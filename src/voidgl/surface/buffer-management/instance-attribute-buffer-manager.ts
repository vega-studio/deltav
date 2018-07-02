import * as Three from 'three';
import { getObservableMonitorIds, Instance, setObservableMonitor } from '../../instance-provider';
import { IInstanceAttributeInternal, PickType } from '../../types';
import { uid } from '../../util';
import { generateLayerModel } from '../generate-layer-model';
import { IModelConstructable, Layer } from '../layer';
import { Scene } from '../scene';
import { BufferManagerBase, IBufferLocation, IBufferLocationGroup } from './buffer-manager-base';

const { max } = Math;

/**
 * This represents the location of data for an instance's property to the piece of attribute buffer
 * it will update when it changes.
 */
export interface IInstanceAttributeBufferLocation extends IBufferLocation {
  uid: number;
}

export type IInstanceAttributeBufferLocationGroup = IBufferLocationGroup<IInstanceAttributeBufferLocation>;

/**
 * This manages instances in how they associate with buffer data for an instanced attribute strategy.
 */
export class InstanceAttributeBufferManager<T extends Instance> extends BufferManagerBase<T, IInstanceAttributeBufferLocation> {
  /** This contains the buffer locations the system will have available to the  */
  private availableLocations: IInstanceAttributeBufferLocationGroup[] = [];
  /** This is the number of instances the buffer draws currently */
  currentInstancedCount = 0;
  /** This is the mapped buffer location to the provided Instance */
  private instanceToBufferLocation = new Map<number, IInstanceAttributeBufferLocationGroup>();
  /**
   * This is the number of times the buffer has grown. This is used to determine how much the buffer will grow
   * for next growth pass.
   */
  private growthCount: number = 0;
  /** This is the number of instances the buffer currently supports */
  private maxInstancedCount: number = 1000;

  // These are the only Three objects that must be monitored for disposal
  private geometry: Three.InstancedBufferGeometry;
  private material: Three.ShaderMaterial;
  private model: IModelConstructable & Three.Object3D;
  private attributes: IInstanceAttributeInternal<T>[];
  private attributeToPropertyIds = new Map<string, number[]>();

  constructor(layer: Layer<T, any>, scene: Scene) {
    super(layer, scene);
    // Start our add method as a registration step.
    this.add = this.doAddWithRegistration;
  }

  /**
   * First instance to be added to this manager will be heavily analyzed for used observables per attribute.
   */
  doAddWithRegistration(instance: T) {
    // We need to find out how an instance interacts with the attributes, so we will
    // loop through the instances, call their updates and get feedback
    this.layer.instanceAttributes.forEach(attribute => {
      // Activate monitoring of ids, this also resets the monitor's list
      setObservableMonitor(true);
      // Access the update which accesses an instances properties (usually)
      attribute.update(instance);
      // We now have all of the ids of the properties that were used in updating the attributes
      const propertyIdsForAttribute = getObservableMonitorIds();
      // Store the mapping of the property ids
      this.attributeToPropertyIds.set(attribute.name, propertyIdsForAttribute);
    });

    // SUPER IMPORTANT to deactivate this here. Leaving this turned on causes memory to be chewed up
    // for every property getter.
    setObservableMonitor(false);
    // Do the first resize which creates the buffer and makes all of the initial buffer locations
    const locationInfo = this.resizeBuffer();
    // After all of the property id to attribute associations are made, we must break down the buffers
    // into locations and then group those locations which will become our instance to buffer location
    // slots
    this.gatherLocationsIntoGroups(locationInfo.newLocations, locationInfo.growth);
    // After the first registration add, we gear shift to a more efficient add method.
    this.add = this.doAdd;

    // Perform the add after all of the registration process is complete
    return this.doAdd(instance);
  }

  /**
   * After the registration add happens, we gear shift over to this add method which will only pair instances
   * with their appropriate buffer location.
   */
  doAdd(instance: T) {
    this.currentInstancedCount++;

    // Ensure we have buffer locations available
    if (this.availableLocations.length <= 0) {
      // Resice the buffer to accommodate more instances
      const locationInfo = this.resizeBuffer();
      // Break down the newly generated buffers into property groupings for the instances
      this.gatherLocationsIntoGroups(locationInfo.newLocations, locationInfo.growth);
    }

    // Get the next available location
    const bufferLocations = this.availableLocations.shift();

    // Pair up the instance with it's buffer location
    if (bufferLocations) {
      this.instanceToBufferLocation.set(instance.uid, bufferLocations);
    }

    else {
      console.error('Add Error: Instance Attribute Buffer Manager failed to pair an instance with a buffer location');
    }

    return bufferLocations || null;
  }

  destroy() {
    this.geometry.dispose();
    this.material.dispose();
    this.scene.container.remove(this.model);
  }

  /**
   * Disassociates an instance with a buffer
   */
  remove = (instance: T) => {
    const location = this.instanceToBufferLocation.get(instance.uid);

    if (location) {
      this.instanceToBufferLocation.delete(instance.uid);
      this.availableLocations.push(location);
    }

    return instance;
  }

  /**
   * This generates a new buffer of uniforms to associate instances with.
   */
  private resizeBuffer() {
    let growth = 0;
    // Each attribute will generate lists of new buffer locations after being created or expanded
    const attributeToNewBufferLocations = new Map<string, IInstanceAttributeBufferLocation[]>();

    // If our geometry is not created yet, then it need be made
    if (!this.geometry) {
      // The buffer grows from 0 to our initial instance count
      growth = this.maxInstancedCount;
      // We generate a new geometry object for the buffer as the geometry
      // Needs to have it's own unique draw range per buffer for optimal
      // Performance.
      this.geometry = new Three.InstancedBufferGeometry();

      // The geometry needs the vertex information (which should be shared amongst all instances of the layer)
      this.layer.vertexAttributes.forEach(attribute => {
        if (attribute.materialAttribute) {
          this.geometry.addAttribute(attribute.name, attribute.materialAttribute);
        }
      });

      // We now take the instance attributes and add them as Instanced Attributes to our geometry
      this.attributes = this.layer.instanceAttributes.map(attribute => {
        // We start with enough data in the buffer to accommodate 1024 instances
        const size: number = attribute.size || 0;
        const buffer = new Float32Array(size * this.maxInstancedCount);
        const bufferAttribute = new Three.InstancedBufferAttribute(buffer, size);
        this.geometry.addAttribute(attribute.name, bufferAttribute);
        let newBufferLocations = attributeToNewBufferLocations.get(attribute.name);

        if (!newBufferLocations) {
          newBufferLocations = [];
          attributeToNewBufferLocations.set(attribute.name, newBufferLocations);
        }

        for (let i = 0; i < this.maxInstancedCount; ++i) {
          newBufferLocations.push({
            buffer: {
              value: buffer,
            },
            instanceIndex: i,
            range: [i * size, i * size + size],
            uid: uid(),
          });
        }

        // Make an internal instance attribute for tracking
        return Object.assign({}, attribute, { bufferAttribute: bufferAttribute });
      });

      // Ensure the draw range covers every instance in the geometry.
      this.geometry.maxInstancedCount = 0;

      // This is the material that is generated for the layer that utilizes all of the generated and
      // Injected shader IO and shader fragments
      this.material = this.layer.material.clone();
      // Now make a Model for the buffer so it can be rendered withn the scene
      this.model = generateLayerModel(this.layer, this.geometry, this.material);
      // We render junkloads of instances in a buffer. Culling will have to happen
      // On an instance level.
      this.model.frustumCulled = false;
      // Make a picking model if we need it so we can render the model with a different uniform set
      // for the picking procedure.
      const pickModel = this.layer.picking.type === PickType.SINGLE ? this.model.clone() : undefined;

      // Now that we are ready to utilize the buffer, let's add it to the scene so it may be rendered.
      // Each new buffer equates to one draw call.
      if (this.scene) {
        this.scene.container.add(this.model);

        if (pickModel) {
          this.scene.pickingContainer.add(pickModel);
        }
      }
    }

    // If the geometry is already created, then we will expand each instanced attribute to the next growth
    // level and generate the new buffer locations based on the expansion
    else {
      // Since were are resizing the buffer, let's destroy the old buffer and make one anew
      this.geometry.dispose();
      this.geometry = new Three.InstancedBufferGeometry();
      const previousInstanceAmount = this.maxInstancedCount;

      // We grow our buffer by magnitudes of 10 * 1024
      // First growth: 1000
      // Next: 10000
      // Next: 100000
      // Next: 1000000
      // Next: 1000000
      // We cap at growth of 1 million to prevent a mass unused RAM void.
      growth = Math.pow(10, this.growthCount) * 1000;
      this.growthCount = Math.min(3, this.growthCount + 1);
      this.maxInstancedCount += growth;

      this.attributes.forEach(attribute => {
        const bufferAttribute = attribute.bufferAttribute;
        const size: number = attribute.size || 0;

        if (bufferAttribute.array instanceof Float32Array) {
          const buffer: Float32Array = new Float32Array(this.maxInstancedCount * size);
          buffer.set(bufferAttribute.array, 0);
          const newAttribute = new Three.InstancedBufferAttribute(buffer, size);
          this.geometry.addAttribute(attribute.name, newAttribute);

          let newBufferLocations = attributeToNewBufferLocations.get(attribute.name);

          if (!newBufferLocations) {
            newBufferLocations = [];
            attributeToNewBufferLocations.set(attribute.name, newBufferLocations);
          }

          for (let i = previousInstanceAmount, end = this.maxInstancedCount - previousInstanceAmount; i < end; ++i) {
            newBufferLocations.push({
              buffer: {
                value: buffer,
              },
              instanceIndex: i,
              range: [i * size, i * size + size],
              uid: uid(),
            });
          }
        }
      });

      this.scene.container.remove(this.model);
      this.model = generateLayerModel(this.layer, this.geometry, this.material);
    }

    return {
      growth,
      newLocations: attributeToNewBufferLocations,
    };
  }

  /**
   * This takes newly created buffer locations and groups them by the property ids identified by the
   * registration phase.
   */
  gatherLocationsIntoGroups(attributeToNewBufferLocations: Map<string, IInstanceAttributeBufferLocation[]>, totalNewInstances: number) {
    if (this.attributeToPropertyIds.size === 0) return;

    // Loop through all of the new instances available and gather all of the buffer locations
    for (let i = 0; i < totalNewInstances; ++i) {
      const group: IInstanceAttributeBufferLocationGroup = {
        instanceIndex: -1,
        propertyToBufferLocation: new Map<number, IInstanceAttributeBufferLocation>(),
      };

      // Loop through all of the property ids that affect specific attributes. Each of these ids
      // needs an association with the buffer location they modify.
      this.attributeToPropertyIds.forEach((ids, attributeName) => {
        const bufferLocationsForAttribute = attributeToNewBufferLocations.get(attributeName);

        if (!bufferLocationsForAttribute) {
          console.warn('There is an error in forming buffer location groups in InstanceAttributeBufferManager');
          return;
        }

        const bufferLocation = bufferLocationsForAttribute.shift();

        if (!bufferLocation) {
          console.warn('There is an error in forming buffer location groups in InstanceAttributeBufferManager');
          return;
        }

        if (group.instanceIndex === -1) {
          group.instanceIndex = bufferLocation.instanceIndex;
        }

        else if (bufferLocation.instanceIndex !== group.instanceIndex) {
          console.warn('A buffer location does not have a matching instance index which means the buffer locations are not in parallel with each other somehow');
          console.warn(attributeName, bufferLocation);
          return;
        }

        // In the group, associate the property ids that affect a buffer location WITH the buffer location they affect
        for (let k = 0, endk = ids.length; k < endk; ++k) {
          const id = ids[k];

          group.propertyToBufferLocation.set(id, bufferLocation);
        }
      });

      // Store this group as a group that is ready to be associated with an instance
      this.availableLocations.push(group);
    }
  }
}
