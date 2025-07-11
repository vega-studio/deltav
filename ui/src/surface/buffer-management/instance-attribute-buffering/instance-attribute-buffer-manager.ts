"use strict";

import Debug from "debug";

import { Attribute, Geometry, Material, Model } from "../../../gl";
import { Instance, ObservableMonitoring } from "../../../instance-provider";
import {
  IInstanceAttribute,
  IInstanceAttributeInternal,
  InstanceDiffType,
} from "../../../types.js";
import { emitOnce, flushEmitOnce } from "../../../util/emit-once.js";
import { uid } from "../../../util/uid.js";
import { ILayerProps, Layer } from "../../layer.js";
import { generateLayerModel } from "../../layer-processing/generate-layer-model.js";
import { LayerScene } from "../../layer-scene.js";
import {
  BufferManagerBase,
  IBufferLocation,
  IBufferLocationGroup,
  isBufferLocationGroup,
} from "../buffer-manager-base.js";

const debug = Debug("performance");
const { max } = Math;

/**
 * This represents the location of data for an instance's property to the piece
 * of attribute buffer it will update when it changes.
 */
export interface IInstanceAttributeBufferLocation extends IBufferLocation {
  /**
   * We narrow the buffer type for instance attributes down to just array
   * buffers
   */
  buffer: {
    data: Float32Array | Uint8Array;
  };

  /** We narrow the child locations to be the same as this buffer location */
  childLocations?: IInstanceAttributeBufferLocation[];
}

/** Represents the Location Groupings for Instance attribute Buffer locations */
export type IInstanceAttributeBufferLocationGroup =
  IBufferLocationGroup<IInstanceAttributeBufferLocation>;

/**
 * Typeguard for the instance attribute buffer location.
 */
export function isInstanceAttributeBufferLocation(
  val: IBufferLocation
): val is IInstanceAttributeBufferLocation {
  return Boolean(val && val.buffer && val.buffer.data);
}

/**
 * Typeguard for the instance attribute buffer location group.
 */
export function isInstanceAttributeBufferLocationGroup(
  val: any
): val is IInstanceAttributeBufferLocationGroup {
  return isBufferLocationGroup(val);
}

/**
 * This manages instances in how they associate with buffer data for an
 * instanced attribute strategy.
 */
export class InstanceAttributeBufferManager<
  TInstance extends Instance,
  TProps extends ILayerProps<TInstance>,
> extends BufferManagerBase<
  TInstance,
  TProps,
  IInstanceAttributeBufferLocation
> {
  /**
   * This is the unique identifier for this buffer manager, used for debugging
   */
  get uid() {
    return this._uid;
  }
  private _uid = uid();
  /** This contains the buffer locations the system will have available */
  private availableLocations: IInstanceAttributeBufferLocationGroup[] = [];
  /** This is the number of instances the buffer draws currently */
  currentInstancedCount = 0;
  /** This is the mapped buffer location to the provided Instance */
  private instanceToBufferLocation: {
    [key: number]: IInstanceAttributeBufferLocationGroup;
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
          this.layer.shaderIOInfo.indexBuffer?.indexCount ||
            this.layer.shaderIOInfo.instanceVertexCount,
        ];
        this.model.drawInstances = this.currentInstancedCount;

        if (this.layer.shaderIOInfo.instanceVertexCount === 0) {
          this.model.vertexDrawRange[1] = this.model.drawInstances;
        }
      }
    } else {
      console.error(
        "Add Error: Instance Attribute Buffer Manager failed to pair an instance with a buffer location"
      );
    }

    // This helps ensure errors get reported in a timely fashion in case this
    // triggers some massive looping
    flushEmitOnce();
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
   * This resizes our buffers to accommodate more instances and also generates
   * attribute locations to associate with our instances.
   */
  private resizeBuffer() {
    debug("Gathering resize growth amount...");
    // Get the shader io information from the layer to reduce deep references
    const shaderIOInfo = this.layer.shaderIOInfo;
    // This stores how much the buffer will be able to regrow
    let growth = 0;
    // Each attribute will generate lists of new buffer locations after being
    // created or expanded
    const attributeToNewBufferLocations = new Map<
      string,
      IInstanceAttributeBufferLocation[]
    >();
    // Keep track of how many instances we had before this operation
    const previousInstanceAmount = this.maxInstancedCount;

    // As an optimization to guarantee the buffer is resized only a single time
    // for a single changelist we will calculate the necessary growth of the
    // buffer by finding all of the insertions the changelist will cause.
    if (this.changeListContext) {
      // We will always grow beyond a 1000 units. That way there is room to
      // prevent immediate resize operations from happening too frequently.
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
      // For our first growth, we will see if the layer specifies some
      // optimization hints
      growth = Math.max(
        growth,
        this.layer.props.bufferManagement?.optimize?.expectedInstanceCount ?? 0
      );
      // The buffer grows from 0 to our initial instance count
      this.maxInstancedCount += growth;
      // We generate a new geometry object for the buffer as the geometry
      // Needs to have it's own unique draw range per buffer for optimal
      // Performance.
      this.geometry = new Geometry();

      // The geometry needs the vertex information (which should be shared
      // amongst all instances of the layer)
      for (const attribute of shaderIOInfo.vertexAttributes) {
        if (attribute.materialAttribute) {
          this.geometry.addAttribute(
            attribute.name,
            attribute.materialAttribute
          );
        }
      }

      // Copy over the the index buffer to the new geometry as well. Nothing
      // special needs to happen to this index buffer to work. It has the same
      // needs as the simple vertex buffer
      if (shaderIOInfo.indexBuffer) {
        if (shaderIOInfo.indexBuffer.materialIndexBuffer) {
          this.geometry.setIndexBuffer(
            shaderIOInfo.indexBuffer.materialIndexBuffer
          );
        }
      }

      this.attributes = [];

      // Generate the attributes for the new geometry
      for (const attribute of shaderIOInfo.instanceAttributes) {
        // We start with enough data in the buffer to accommodate 1024 instances
        const size: number = attribute.size || 0;
        const bufferAttribute = new Attribute(
          new Float32Array(0),
          size,
          true,
          true
        );
        bufferAttribute.resize(this.maxInstancedCount);
        this.geometry.addAttribute(attribute.name, bufferAttribute);

        const internalAttribute: IInstanceAttributeInternal<TInstance> =
          Object.assign({}, attribute, {
            uid: uid(),
            bufferAttribute: bufferAttribute,
          });

        // Make an internal instance attribute for tracking
        this.attributes.push(internalAttribute);
      }

      // Ensure the draw range covers every instance in the geometry.
      this.geometry.maxInstancedCount = 0;
    } else {
      // If the geometry is already created, then we will expand each instanced
      // attribute to the next growth level and generate the new buffer
      // locations based on the expansion Since were are resizing the buffer,
      // let's destroy the old buffer and make one anew
      this.geometry.rebuild();
      this.maxInstancedCount += growth;
      // Ensure attributes is still defined
      this.attributes = this.attributes || [];

      // Resize all of the attributes to the new size
      for (const attribute of this.attributes) {
        // Resize the buffer to fit the new instances.
        if (attribute.bufferAttribute.count < this.maxInstancedCount) {
          // OPTIMIZATION:
          // We double the backing buffer instead of tightly pack fit it. This
          // allows us to reduce memory allocations and improve overall
          // performance at the cost of some extra memory useage.
          if (this.layer.props.bufferManagement?.optimize?.bufferDoubling) {
            attribute.bufferAttribute.resize(
              this.maxInstancedCount * 2,
              previousInstanceAmount
            );
          }

          // Otherwise we keep the buffer tightly packed to the instance growth
          // + the base growth rate
          else {
            attribute.bufferAttribute.resize(
              this.maxInstancedCount,
              previousInstanceAmount
            );
          }
        }
      }
    }

    // Do the work of generating buffer locations for the new buffer size.
    for (let a = 0, aMax = this.attributes.length; a < aMax; ++a) {
      const attribute = this.attributes[a];
      const bufferAttribute = attribute.bufferAttribute;
      const size: number = attribute.size || 0;
      const added = this.maxInstancedCount - previousInstanceAmount;
      // Get the temp storage for new buffer locations
      let newBufferLocations = attributeToNewBufferLocations.get(
        attribute.name
      );

      if (!newBufferLocations) {
        newBufferLocations = new Array(added);
        attributeToNewBufferLocations.set(attribute.name, newBufferLocations);
      }

      // Set up some optimizations for this loop
      let index = 0;

      for (
        let i = previousInstanceAmount, end = this.maxInstancedCount;
        i < end;
        ++i, ++index
      ) {
        newBufferLocations[index] = {
          attribute,
          // We set this to the attribute, that way when the attribute creates a
          // new buffer object, the new reference will automatically be used
          // which prevents us from having to manually update the reference
          // across all generated locations.
          buffer: bufferAttribute,
          instanceIndex: i,
          start: i * size,
          end: i * size + size,
        };
      }
    }

    // Clear out the old model so we can regenerate it with out new geometry
    // with new buffers.
    if (this.scene && this.model && this.scene.container) {
      this.scene.container.remove(this.model);
    }

    // Ensure material is defined
    if (!this.material) {
      this.material = this.makeLayerMaterial();

      // Grab the global uniforms from the material and add it to the uniform's
      // materialUniform list so that We can keep uniforms consistent across all
      // Instances
      for (let i = 0, end = shaderIOInfo.uniforms.length; i < end; ++i) {
        const uniform = shaderIOInfo.uniforms[i];
        uniform.materialUniforms.push(this.material.uniforms[uniform.name]);
      }
    }

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
      IInstanceAttributeBufferLocation[]
    >,
    totalNewInstances: number
  ) {
    if (this.attributeToPropertyIds.size === 0) return;

    debug("BEGIN: Unpacked attribute manager grouping new buffer locations");

    // Optimize inner loops by pre-fetching lookups by names
    const attributesBufferLocations: {
      attribute: IInstanceAttribute<TInstance>;
      bufferLocationsForAttribute: IInstanceAttributeBufferLocation[];
      childBufferLocations: {
        location: IInstanceAttributeBufferLocation[];
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

    let allLocations,
      attribute: IInstanceAttribute<TInstance>,
      ids: number[],
      bufferLocationsForAttribute: IInstanceAttributeBufferLocation[],
      bufferLocation: IInstanceAttributeBufferLocation | undefined,
      childAttribute: IInstanceAttribute<TInstance>;

    // Loop through all of the new instances available and gather all of the
    // buffer locations
    for (let i = 0; i < totalNewInstances; ++i) {
      const group: IInstanceAttributeBufferLocationGroup = {
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
                `${id}: There is an error in forming buffer location groups in InstanceAttributeBufferManager. Error count: ${count}`
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
                `${id}: There is an error in forming buffer location groups in InstanceAttributeBufferManager. Error count: ${count}`
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
  }

  /**
   * Returns the total instances this buffer manages.
   */
  getInstanceCount() {
    return this.maxInstancedCount;
  }
}
