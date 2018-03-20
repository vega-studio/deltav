import * as Three from 'three';
import { Color } from '../../primitives/color';
import { Image } from '../../primitives/image';
import { Label } from '../../primitives/label';
import { InstanceIOValue } from '../../types';
import { Instance } from '../../util/instance';
import { AtlasManager, AtlasResource } from './atlas-manager';
import { ColorAtlasResource } from './color-atlas-resource';
import { ImageAtlasResource } from './image-atlas-resource';
import { LabelAtlasResource } from './label-atlas-resource';
import { SubTexture } from './sub-texture';

function toInstanceIOValue(texture: SubTexture): InstanceIOValue {
  return [
    texture.atlasTL.x,
    texture.atlasTL.y,
    texture.atlasBR.x,
    texture.atlasBR.y,
  ];
}

/**
 * This class is responsible for tracking resources requested to be placed on an Atlas.
 * This makes sure the resource is uploaded and then properly cached so similar requests
 * return already existing resources. This also manages instances waiting for the resource
 * to be made available.
 */
export class AtlasResourceManager {
  /** This is the atlas currently targetted by requests */
  targetAtlas: string = '';
  labelToTexture = new Map<LabelAtlasResource, SubTexture>();
  colorToTexture = new Map<ColorAtlasResource, SubTexture>();
  imageToTexture = new Map<ImageAtlasResource, SubTexture>();

  /**
   * This is a request for resources
   */
  request(resource: AtlasResource, instance: Instance): InstanceIOValue {
    let texture: SubTexture;

    if (resource instanceof ColorAtlasResource) {
      texture = this.colorToTexture.get(resource);
    }

    else if (resource instanceof LabelAtlasResource) {
      texture = this.labelToTexture.get(resource);
    }

    else if (resource instanceof ImageAtlasResource) {
      texture = this.imageToTexture.get(resource);
    }

    // If the texture is ready and available, then we return the needed IO values
    if (texture) {
      return toInstanceIOValue(texture);
    }

    // If the texture is not available, then we must load the resource, deactivate the instance
    // And wait for the resource to become available. Once the resource is available, the system
    // Must activate the instance to render the resource.
  }

  /**
   * This is used by the system to target the correct atlas for subsequent requests to a resource.
   */
  setTargetAtlas(target: string) {
    this.targetAtlas = target;
  }
}
