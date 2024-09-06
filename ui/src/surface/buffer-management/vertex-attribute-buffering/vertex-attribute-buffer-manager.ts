"use strict";

import { Attribute, Geometry, Material, Model } from "../../../gl";
import {
  BufferManagerBase,
  IBufferLocation,
  IBufferLocationGroup,
  isBufferLocationGroup,
} from "../buffer-manager-base";
import { emitOnce, flushEmitOnce } from "../../../util/emit-once";
import { generateLayerModel } from "../../layer-processing/generate-layer-model";
import {
  IInstanceAttribute,
  IInstanceAttributeInternal,
  InstanceDiffType,
} from "../../../types";
import { ILayerProps, Layer } from "../../layer";
import { Instance, ObservableMonitoring } from "../../../instance-provider";
import { LayerScene } from "../../layer-scene";
import { uid } from "../../../util/uid";

import Debug from "debug";

const debug = Debug("performance");
const { max } = Math;

/**
 * This represents the location of data for an instance's property to the piece
 * of attribute buffer it will update when it changes.
 */
export interface IVertexAttributeBufferLocation extends IBufferLocation {
  /**
   * We narrow the buffer type for instance attributes down to just array
   * buffers
   */
  buffer: {
    data: Float32Array | Uint8Array;
  };

  /** We narrow the child locations to be the same as this buffer location */
  childLocations?: IVertexAttributeBufferLocation[];
}

/** Represents the Location Groupings for Instance attribute Buffer locations */
export type IVertexAttributeBufferLocationGroup =
  IBufferLocationGroup<IVertexAttributeBufferLocation>;

/**
 * Typeguard for the instance attribute buffer location.
 */
export function isVertexAttributeBufferLocation(
  val: IBufferLocation
): val is IVertexAttributeBufferLocation {
  return Boolean(val && val.buffer && val.buffer.data);
}

/**
 * Typeguard for the instance attribute buffer location group.
 */
export function isVertexAttributeBufferLocationGroup(
  val: any
): val is IVertexAttributeBufferLocationGroup {
  return isBufferLocationGroup(val);
}

/**
 * This manages instances in how they associate with buffer data for an
 * non-instanced vertex attribute strategy.
 *
 * SOME NOTES:
 * This buffer management strategy follows the EXACT same pattern as
 * the instance attribute buffering strategy. It creates the EXACT SAME buffer
 * location values.
 *
 * WHERE IT DIFFERS:
 * - This will resize the vertex attributes AS WELL to match the instance count
 *   since we will NOT be able to take advantage of drawing instanced arrays.
 * - ALL BUFFERS will repeat values for every instance for every VERTEX instead
 *   of storing a single copy of the value for each instance.
 *
 * BUFFER LOCATIONS GENERATED WILL NOT MATCH REAL BUFFER LOCATIONS WITH THIS
 * STRATEGY:
 * Again! This follows the instance attribute buffer location strategy
 * for BUFFER LOCATIONS EXXXXACTLY. This similarity will be resolved in the diff
 * processor as it will take into account the number of vertices the values need
 * to be copied for to match the buffer expectations when drawing as a
 * non-instanced attribute.
 */
export class VertexAttributeBufferManager<
  TInstance extends Instance,
  TProps extends ILayerProps<TInstance>,
> extends BufferManagerBase<TInstance, TProps, IVertexAttributeBufferLocation> {
  /** This stores an attribute's name to the buffer locations generated for it */
  private allBufferLocations: { [key: string]: IBufferLocation[] } = {};
  /** This contains the buffer locations the system will have available */
  private availableLocations: IVertexAttributeBufferLocationGroup[] = [];
  /** This is the number of instances the buffer draws currently */
  currentInstancedCount = 0;
  /** This is the mapped buffer location to the provided Instance */
  private instanceToBufferLocation: {
    [key: number]: IVertexAttributeBufferLocationGroup;
  } = {};
  /** This is the number of instances the buffer currently supports */
  private maxInstancedCount = 0;

  // These are the only GL objects that must be monitored for disposal
  private geometry?: Geometry;
  private material?: Material;
  private model?: Model;
  private attributes?: IInstanceAttributeInternal<TInstance>[];

  /**
   * This is a mapping of all attributes to their associated property ids that,
   * when the property changes, the attribute will be updated
   */
  private attributeToPropertyIds = new Map<
    IInstanceAttribute<TInstance>,
    number[]
  >();
  /**
   * This is a trimmed listing of minimum property ids needed to trigger an
   * update on all properties. This is used by the diffing process mostly to
   * handle adding a new instance.
   */
  private updateAllPropertyIdList: number[] = [];
  /**
   * This is the discovered property id of the active attribute for the instance
   * type this manager manages. This is used by the diffing process to target
   * updates related to deactivating an instance.
   */
  private activePropertyId = -1;
  /**
   * As changes are processed, instances will be added into the buffers. As they
   * are added in, the instance will take over available locations within the
   * buffer. Normally we would have these available locations in a queue and we
   * would push and shift into that queue to retrieve the locations; however,
   * shifting queues when done in VERY large quantities causes javascript to lag
   * horrendously. Thus we instead have this index to monitor the next available
   * item to pull during processing changes. AFTER changes have been processed
   * we perform a one time operation splice to delete any list of available
   * locations that have been used. This GREATLY improves performance for these
   * types of operations.
   */
  private currentAvailableLocation = -1;

  constructor(layer: Layer<TInstance, any>, scene: LayerScene) {
    super(layer, scene);
    // Start our add method as a registration step.
    this.add = this.doAddWithRegistration;
  }

  /**
   * This is the tail end of processing changes and lets us clean up anything
   * that might have been used to aid in the processing.
   */
  changesProcessed() {
    super.changesProcessed();
    // Clean out available locations that have been consumed during processing
    // changes
    this.availableLocations.splice(0, this.currentAvailableLocation + 1);
    // All elements in the availableLocations buffer are now valid locations so
    // we reset this index back to the beginning which is -1 since our loop
    // iterates with it using ++currentAvailableLocation.
    this.currentAvailableLocation = -1;
  }

  /**
   * First instance to be added to this manager will be heavily analyzed for
   * used observables per attribute.
   */
  private doAddWithRegistration(instance: TInstance) {
    // Activate monitoring of ids, this also resets the monitor's list
    ObservableMonitoring.setObservableMonitor(true);

    // We need to find out how an instance interacts with the attributes, so we
    // will loop through the instances, call their updates and get feedback
    this.layer.shaderIOInfo.instanceAttributes.forEach((attribute) => {
      // We don't need to register child attributes as they get updated as a
      // consequence to parent attributes
      if (attribute.parentAttribute) return;
      // Access the update which accesses an instances properties (usually)
      attribute.update(instance);
      // We now have all of the ids of the properties that were used in updating
      // the attributes
      const propertyIdsForAttribute =
        ObservableMonitoring.getObservableMonitorIds(true);
      // Store the mapping of the property ids
      // TODO: We currently only support ONE property id per change
      this.attributeToPropertyIds.set(attribute, [
        propertyIdsForAttribute[propertyIdsForAttribute.length - 1],
      ]);

      if (propertyIdsForAttribute.length > 1) {
        debug(
          "Property has multiple observables. Only the last trigger will be retained as the feature is not complete yet"
        );
      }

      // If this is the active attribute, then we track the property id that
      // modifies it for handling internal instance management.
      if (attribute === this.layer.shaderIOInfo.activeAttribute) {
        this.activePropertyId = propertyIdsForAttribute[0];
      }
    });

    // SUPER IMPORTANT to deactivate this here. Leaving this turned on causes
    // memory to be chewed up for every property getter.
    ObservableMonitoring.setObservableMonitor(false);
    // This analyzes the properties and how they affect the attributes. It
    // determines the smallest list possible of property ids needed to trigger
    // an update on all of the attributes.
    this.makeUpdateAllPropertyIdList();
    // Do the first resize which creates the buffer and makes all of the initial
    // buffer locations
    const locationInfo = this.resizeBuffer();
    // After all of the property id to attribute associations are made, we must
    // break down the buffers into locations and then group those locations
    // which will become our instance to buffer location slots
    this.gatherLocationsIntoGroups(
      locationInfo.newLocations,
      locationInfo.growth
    );
    // After the first registration add, we gear shift to a more efficient add
    // method.
    this.add = this.doAdd;

    // Perform the add after all of the registration process is complete
    return this.doAdd(instance);
  }

  /**
   * After the registration add happens, we gear shift over to this add method
   * which will only pair instances with their appropriate buffer location.
   */
  private doAdd(instance: TInstance) {
    // Ensure we have buffer locations available
    if (
      this.availableLocations.length <= 0 ||
      this.currentAvailableLocation >= this.availableLocations.length - 1
    ) {
      // Resice the buffer to accommodate more instances
      const locationInfo = this.resizeBuffer();
      // Break down the newly generated buffers into property groupings for the
      // instances
      this.gatherLocationsIntoGroups(
        locationInfo.newLocations,
        locationInfo.growth
      );
    }

    // Get the next available location
    const bufferLocations =
      this.availableLocations[++this.currentAvailableLocation];

    // Pair up the instance with it's buffer location
    if (bufferLocations && this.geometry) {
      this.instanceToBufferLocation[instance.uid] = bufferLocations;
      this.currentInstancedCount = this.geometry.maxInstancedCount = max(
        this.currentInstancedCount,
        // Instance index + 1 because the indices are zero indexed and the
        // maxInstancedCount is a count value
        bufferLocations.instanceIndex + 1
      );

      if (this.model) {
        this.model.vertexDrawRange = [
          0,
          this.layer.shaderIOInfo.instanceVertexCount *
            this.currentInstancedCount,
        ];
        this.model.drawInstances = this.currentInstancedCount;

        if (this.layer.shaderIOInfo.instanceVertexCount === 0) {
          this.model.vertexDrawRange[1] =
            this.layer.shaderIOInfo.instanceVertexCount *
            this.currentInstancedCount;
        }
      }
    } else {
      console.error(
        "Add Error: Instance Attribute Buffer Manager failed to pair an instance with a buffer location"
      );
    }

    return bufferLocations;
  }

  /**
   * Free any buffer and material resources this is managing.
   */
  destroy() {
    if (this.geometry) this.geometry.destroy();
    if (this.material) this.material.dispose();

    if (this.scene && this.scene.container && this.model) {
      this.scene.container.remove(this.model);
    }
  }

  /**
   * This retireves the buffer locations associated with an instance, or returns
   * nothing if the instance has not been associated yet.
   */
  getBufferLocations(instance: TInstance) {
    return this.instanceToBufferLocation[instance.uid];
  }

  /**
   * This is the property id of the active attribute.
   */
  getActiveAttributePropertyId() {
    return this.activePropertyId;
  }

  /**
   * This is the bare minimum property ids that, when triggered for update, will
   * update ALL of the attribute buffers for the managed layer.
   */
  getUpdateAllPropertyIdList() {
    return this.updateAllPropertyIdList;
  }

  /**
   * Checks to see if an instance is managed by this manager.
   */
  managesInstance(instance: TInstance) {
    // We know this instance is managed if the instance has buffer location real
    // estate assigned to it
    return this.instanceToBufferLocation[instance.uid] !== void 0;
  }

  /**
   * Analyzes the list of attributes to the property ids that affects them. This
   * populates the list of minimal property ids needed to trigger updates on all
   * of the attributes.
   */
  private makeUpdateAllPropertyIdList() {
    // Make a deduping list of ids
    const updateAllPropertyIdList: { [key: number]: number } = {};

    // Get unique ids that will target all attributes
    this.attributeToPropertyIds.forEach((ids) => {
      updateAllPropertyIdList[ids[0]] = ids[0];
    });

    // Store the list for the diffing process to utilize
    this.updateAllPropertyIdList = Object.values(
      updateAllPropertyIdList
    ).filter(Boolean);
  }

  /**
   * Disassociates an instance with a buffer
   */
  remove = (instance: TInstance) => {
    const location = this.instanceToBufferLocation[instance.uid];

    if (location) {
      delete this.instanceToBufferLocation[instance.uid];
      this.availableLocations.push(location);
    }

    return instance;
  };

  /**
   * Clears all elements of this manager from the current scene it was in.
   */
  removeFromScene() {
    if (this.scene && this.scene.container && this.model) {
      this.scene.container.remove(this.model);
    }

    delete this.scene;
  }

  /**
   * This generates a new buffer of attribute locations to associate instances
   * with.
   */
  private resizeBuffer() {
    debug("Gathering resize growth amount...");
    const vertexCount = this.layer.shaderIOInfo.instanceVertexCount;
    // Get the shader io information from the layer to reduce deep references
    const shaderIOInfo = this.layer.shaderIOInfo;
    // This stores how much the buffer will be able to regrow
    let growth = 0;
    // Each attribute will generate lists of new buffer locations after being
    // created or expanded
    const attributeToNewBufferLocations = new Map<
      string,
      IVertexAttributeBufferLocation[]
    >();

    // As an optimization to guarantee the buffer is resized only a single time
    // for a single changelist we  will calculate the necessary growth of the
    // buffer by finding all of the insertions the changelist will cause.
    if (this.changeListContext) {
      growth = this.layer.shaderIOInfo.baseBufferGrowthRate;

      // We loop through all of the changes to find which operations will result
      // in an additional unit
      for (let i = 0, iMax = this.changeListContext.length; i < iMax; ++i) {
        const diff = this.changeListContext[i];

        switch (diff[1]) {
          case InstanceDiffType.CHANGE:
          case InstanceDiffType.INSERT:
            // If the instance is not managed, it is a buffer growth
            if (!this.instanceToBufferLocation[diff[0].uid]) growth++;
            break;

          default:
            break;
        }
      }
    }

    debug("BEGIN: Resizing unpacked attribute buffer by %d instances", growth);

    // If our geometry is not created yet, then it need be made
    if (!this.geometry) {
      // The buffer grows from 0 to our initial instance count
      this.maxInstancedCount += growth;
      // We generate a new geometry object for the buffer as the geometry
      // Needs to have it's own unique draw range per buffer for optimal
      // Performance.
      this.geometry = new Geometry();

      // The geometry needs the vertex information (which should be shared
      // amongst all instances of the layer). When using non-instanced
      // rendering, this buffer has to grow with the instanced buffers as the
      // user adds instances to the layer.
      for (const attribute of shaderIOInfo.vertexAttributes) {
        if (attribute.materialAttribute) {
          // Resize the attribute to account for all of the instancing vertices
          // it will need.
          attribute.materialAttribute.resize(
            vertexCount * this.maxInstancedCount
          );

          // Repeat the vertex buffer data for every instance we need in the
          // buffer
          attribute.materialAttribute.repeatInstances(
            this.maxInstancedCount - 1,
            vertexCount
          );

          // Establish other buffer metrics
          attribute.materialAttribute.setDynamic(true);

          // Move the shader info attributes generated to our geometry object
          // for management
          this.geometry.addAttribute(
            attribute.name,
            attribute.materialAttribute
          );
        }
      }

      // We now check to see if this layer is utilizing an index buffer. The
      // index buffer will need to be sized up and have it's indices repeated
      // but also change the copied indices to match the new instance within the
      // buffer.
      if (shaderIOInfo.indexBuffer?.materialIndexBuffer) {
        // Move the shader info index buffer generated to our geometry object
        // for management
        this.geometry.setIndexBuffer(
          shaderIOInfo.indexBuffer.materialIndexBuffer
        );

        // Resize the index buffer to account for all of the instancing vertices
        // it will need.
        shaderIOInfo.indexBuffer.materialIndexBuffer.resize(
          shaderIOInfo.indexBuffer.indexCount * this.maxInstancedCount,
          // We will have vertices to reference for our original instance and
          // every new instance added to the buffer
          vertexCount * this.maxInstancedCount
        );

        // Repeat the index buffer indices for every instance (this also will
        // offset the indices to match the instance they are referencing)
        shaderIOInfo.indexBuffer.materialIndexBuffer.repeatInstances(
          // Repeat instances more than the original instance in the buffer
          this.maxInstancedCount - 1,
          // We indicate how many reference vertices there are for each instance
          vertexCount,
          // We indicate how many index vertices there are in the buffer
          shaderIOInfo.indexBuffer.indexCount,
          // Copy starting from the second instance in the buffer
          1
        );
      }

      this.attributes = [];

      // We now take the instance attributes and add them as Instanced
      // Attributes to our geometry
      for (const attribute of shaderIOInfo.instanceAttributes) {
        // We start with enough data in the buffer to accommodate 1024 instances
        const size: number = attribute.size || 0;
        // Make our buffer for the attribute. This manager is responsible for
        // creating and managing instance attributes completely.
        const bufferAttribute = new Attribute(
          new Float32Array(0),
          size,
          true,
          false
        );

        // Buffer is the size of the attribute times the number of instances and
        // then the number of vertices in the mesh (This buffering mode does not
        // take advantage of instancing. Better rendering performance, drastic
        // reduction in making dynamic changes.)
        bufferAttribute.resize(this.maxInstancedCount * vertexCount);
        // Track our attribute in our geometry
        this.geometry.addAttribute(attribute.name, bufferAttribute);

        // Get our storage for our new buffer locations
        let newBufferLocations = attributeToNewBufferLocations.get(
          attribute.name
        );

        if (!newBufferLocations) {
          newBufferLocations = [];
          attributeToNewBufferLocations.set(attribute.name, newBufferLocations);
        }

        const allLocations = this.allBufferLocations[attribute.name] || [];
        this.allBufferLocations[attribute.name] = allLocations;

        const internalAttribute: IInstanceAttributeInternal<TInstance> =
          Object.assign({}, attribute, {
            uid: uid(),
            bufferAttribute,
          });

        for (let i = 0; i < this.maxInstancedCount; ++i) {
          const newLocation: IVertexAttributeBufferLocation = {
            attribute: internalAttribute,
            buffer: {
              data: bufferAttribute.data,
            },
            instanceIndex: i,
            start: i * size,
            end: i * size + size,
          };

          newBufferLocations.push(newLocation);
          allLocations.push(newLocation);
        }

        // Make an internal instance attribute for tracking
        this.attributes.push(internalAttribute);
      }

      // Ensure the draw range covers every instance in the geometry.
      this.geometry.maxInstancedCount = 0;
      // This is the material that is generated for the layer that utilizes all
      // of the generated and Injected shader IO and shader fragments
      this.material = this.makeLayerMaterial();

      // Grab the global uniforms from the material and add it to the uniform's
      // materialUniform list so that We can keep uniforms consistent across all
      // Instances
      for (let i = 0, end = shaderIOInfo.uniforms.length; i < end; ++i) {
        const uniform = shaderIOInfo.uniforms[i];
        uniform.materialUniforms.push(this.material.uniforms[uniform.name]);
      }
    } else {
      // If the geometry is already created, then we will expand each instanced
      // attribute to the next growth level and generate the new buffer
      // locations based on the expansion Since were are resizing the buffer,
      // let's destroy the old buffer and make one anew
      this.geometry.rebuild();
      const previousInstanceAmount = this.maxInstancedCount;
      this.maxInstancedCount += growth;

      // The geometry needs the vertex information (which should be shared
      // amongst all instances of the layer) For this strategy, we need to
      // expand the vertex buffers for every instance as well. And we need to
      // perform a copy of the data instances to the new buffer (all the data is
      // repeating and identical per instance)
      for (const attribute of shaderIOInfo.vertexAttributes) {
        if (attribute.materialAttribute) {
          // Resize the buffer to account for the new instances
          attribute.materialAttribute.resize(
            vertexCount * this.maxInstancedCount
          );

          // Repeat the vertex information for each new instance. Vertex
          // attributes will remain the same for all new instances.
          attribute.materialAttribute.repeatInstances(
            this.maxInstancedCount - previousInstanceAmount,
            vertexCount,
            previousInstanceAmount
          );
        }
      }

      // We now check to see if this layer is utilizing an index buffer. The
      // index buffer will need to be sized up and have it's indices repeated
      // but also change the copied indices to match the new instance within the
      // buffer.
      if (shaderIOInfo.indexBuffer && this.geometry.indexBuffer) {
        const indexVertices = shaderIOInfo.indexBuffer.indexCount;

        // Resize the index buffer to account for the new instances
        this.geometry.indexBuffer.resize(
          indexVertices * this.maxInstancedCount,
          vertexCount * this.maxInstancedCount
        );

        // Repeat the instance indices within the buffer to account for the
        // extra vertices that will be referenced.
        this.geometry.indexBuffer.repeatInstances(
          this.maxInstancedCount - previousInstanceAmount,
          vertexCount,
          indexVertices,
          previousInstanceAmount
        );
      }

      // Ensure attributes is still defined
      this.attributes = this.attributes || [];

      for (const attribute of this.attributes) {
        const bufferAttribute = attribute.bufferAttribute;
        const size: number = attribute.size || 0;

        if (bufferAttribute.data instanceof Float32Array) {
          // Resize the buffer to account for the new instances
          attribute.bufferAttribute.resize(
            this.maxInstancedCount * vertexCount
          );

          // Get the temp storage for new buffer locations
          let newBufferLocations = attributeToNewBufferLocations.get(
            attribute.name
          );

          // Since we have a new buffer object we are working with, we must
          // update all of the existing buffer locations to utilize this new
          // buffer. The locations keep everything else the same, but the buffer
          // object itself should be updated
          const allLocations = this.allBufferLocations[attribute.name] || [];
          this.allBufferLocations[attribute.name] = allLocations;

          for (let k = 0, endk = allLocations.length; k < endk; ++k) {
            allLocations[k].buffer.data = attribute.bufferAttribute.data;
          }

          if (!newBufferLocations) {
            newBufferLocations = [];
            attributeToNewBufferLocations.set(
              attribute.name,
              newBufferLocations
            );
          }

          // Set up some optimizations for this loop
          let newLocation: IVertexAttributeBufferLocation;
          let index = newBufferLocations.length;
          const added = this.maxInstancedCount - previousInstanceAmount;
          newBufferLocations.length += added;
          allLocations.length += added;

          for (
            let i = previousInstanceAmount, end = this.maxInstancedCount;
            i < end;
            ++i, ++index
          ) {
            newLocation = {
              attribute,
              buffer: {
                data: attribute.bufferAttribute.data,
              },
              instanceIndex: i,
              start: i * size,
              end: i * size + size,
            };

            newBufferLocations[index] = newLocation;
            allLocations[i] = newLocation;
          }
        }
      }

      if (this.scene?.container && this.model) {
        this.scene.container.remove(this.model);
      }
    }

    if (this.scene && this.model && this.scene.container) {
      this.scene.container.remove(this.model);
    }

    // Ensure material is defined
    this.material = this.material || this.makeLayerMaterial();
    // Remake the model with the generated geometry
    this.model = generateLayerModel(
      this.layer.id,
      this.geometry,
      this.material,
      shaderIOInfo.drawMode
    );

    // Now that we are ready to utilize the buffer, let's add it to the scene so
    // it may be rendered. Each new buffer equates to one draw call.
    if (this.scene && this.scene.container && this.model) {
      this.scene.container.add(this.model);
    }

    debug("COMPLETE: Resizing unpacked attribute buffer");

    return {
      growth,
      newLocations: attributeToNewBufferLocations,
    };
  }

  /**
   * This takes newly created buffer locations and groups them by the property
   * ids identified by the registration phase.
   */
  private gatherLocationsIntoGroups(
    attributeToNewBufferLocations: Map<
      string,
      IVertexAttributeBufferLocation[]
    >,
    totalNewInstances: number
  ) {
    if (this.attributeToPropertyIds.size === 0) return;

    debug("BEGIN: Unpacked attribute manager grouping new buffer locations");

    // Optimize inner loops by pre-fetching lookups by names
    const attributesBufferLocations: {
      attribute: IInstanceAttribute<TInstance>;
      bufferLocationsForAttribute: IVertexAttributeBufferLocation[];
      childBufferLocations: {
        location: IVertexAttributeBufferLocation[];
        // This is one of those odd but extremely necessary optimizations.
        // Normally while assigning these buffers to groups, one would simply
        // use the available items and shift() those items out into the group;
        // however, shift() or pop() is VERY ineffecient in mass quantities in
        // that it causes massive amounts of memory allocation and movement. So
        // instead of shifting the buffer, we simply keep an index to move to
        // the next buffer to use. It makes the mental works a lot harder to
        // envision, but the gains are immense doing this.
        bufferIndex: number;
      }[];
      ids: number[];
      bufferIndex: number;
    }[] = [];

    this.attributeToPropertyIds.forEach((ids, attribute) => {
      attributesBufferLocations.push({
        attribute,
        bufferLocationsForAttribute:
          attributeToNewBufferLocations.get(attribute.name) || [],
        childBufferLocations: (attribute.childAttributes || []).map((attr) => ({
          location: attributeToNewBufferLocations.get(attr.name) || [],
          bufferIndex: -1,
        })),
        ids,
        bufferIndex: -1,
      });
    });

    let allLocations: (typeof attributesBufferLocations)[number];
    let attribute: IInstanceAttribute<TInstance>;
    let ids: number[];
    let bufferLocationsForAttribute: IVertexAttributeBufferLocation[];
    let bufferLocation: IVertexAttributeBufferLocation | undefined;
    let childAttribute: IInstanceAttribute<TInstance>;

    // Loop through all of the new instances available and gather all of the
    // buffer locations
    for (let i = 0; i < totalNewInstances; ++i) {
      const group: IVertexAttributeBufferLocationGroup = {
        instanceIndex: -1,
        propertyToBufferLocation: {},
      };

      // Loop through all of the property ids that affect specific attributes.
      // Each of these ids needs an association with the buffer location they
      // modify.
      for (let j = 0, endj = attributesBufferLocations.length; j < endj; ++j) {
        allLocations = attributesBufferLocations[j];
        attribute = allLocations.attribute;
        ids = allLocations.ids;
        bufferLocationsForAttribute = allLocations.bufferLocationsForAttribute;

        if (!bufferLocationsForAttribute) {
          emitOnce(
            "Instance Attribute Buffer Error",
            (count: number, id: string) => {
              console.warn(
                `${id}: There is an error in forming buffer location groups in VertexAttributeBufferManager. Error count: ${count}`
              );
            }
          );
          continue;
        }

        bufferLocation =
          bufferLocationsForAttribute[++allLocations.bufferIndex];

        if (!bufferLocation) {
          emitOnce(
            "Instance Attribute Buffer Error",
            (count: number, id: string) => {
              console.warn(
                `${id}: There is an error in forming buffer location groups in VertexAttributeBufferManager. Error count: ${count}`
              );
            }
          );
          continue;
        }

        if (group.instanceIndex === -1) {
          group.instanceIndex = bufferLocation.instanceIndex;
        } else if (bufferLocation.instanceIndex !== group.instanceIndex) {
          emitOnce(
            "Instance Attribute Parallelism Error",
            (count: number, id: string) => {
              console.warn(
                `${id}: A buffer location does not have a matching instance index which means the buffer locations are not in parallel with each other somehow. Error count: ${count}`
              );
              console.warn(attribute.name, bufferLocation);
            }
          );
          continue;
        }

        // If the attribute has children attributes. Then when the attribute is
        // updated, the child attributes should be updated as well. Thus the
        // buffer location needs the child attribute buffer locations.
        if (attribute.childAttributes) {
          bufferLocation.childLocations = [];

          for (
            let k = 0, endk = attribute.childAttributes.length;
            k < endk;
            ++k
          ) {
            const bufferLocationsForChildAttribute =
              allLocations.childBufferLocations[k];

            if (bufferLocationsForChildAttribute) {
              const childBufferLocation =
                bufferLocationsForChildAttribute.location[
                  ++bufferLocationsForChildAttribute.bufferIndex
                ];
              // count++;
              if (childBufferLocation) {
                bufferLocation.childLocations.push(childBufferLocation);
              } else {
                childAttribute = attribute.childAttributes[k];
                emitOnce(
                  "Instance Attribute Child Attribute Error",
                  (count: number, id: string) => {
                    console.warn(
                      `${id}: A child attribute does not have a buffer location available. Error count: ${count}`
                    );
                    console.warn(
                      `Parent Attribute: ${attribute.name} Child Attribute: ${childAttribute.name}`
                    );
                  }
                );
              }
            }
          }
        }

        // In the group, associate the property ids that affect a buffer
        // location WITH the buffer location they affect
        for (let k = 0, endk = ids.length; k < endk; ++k) {
          group.propertyToBufferLocation[ids[k]] = bufferLocation;
        }
      }

      // Store this group as a group that is ready to be associated with an
      // instance
      this.availableLocations.push(group);
    }

    debug(
      "COMPLETE: Unpacked attribute buffer manager buffer location grouping"
    );
    // This helps ensure errors get reported in a timely fashion in case this
    // triggers some massive looping
    flushEmitOnce();
  }

  /**
   * Returns the total instances this buffer manages.
   */
  getInstanceCount() {
    return this.maxInstancedCount;
  }
}
