import * as Three from 'three';
import { Color } from '../../primitives/color';
import { Image } from '../../primitives/image';
import { Label } from '../../primitives/label';
import { AtlasManager, AtlasResource } from './atlas-manager';
import { ColorAtlasResource } from './color-atlas-resource';
import { ImageAtlasResource } from './image-atlas-resource';
import { LabelAtlasResource } from './label-atlas-resource';
import { SubTexture } from './sub-texture';

/**
 * This class is responsible for tracking resources requested to be placed on an Atlas.
 * This makes sure the resource is uploaded and then properly cached so similar requests
 * return already existing resources.
 */
export class AtlasResourceManager {
  labelToTexture = new Map<Label, SubTexture>();
  colorToTexture = new Map<Color, SubTexture>();
  imageToTexture = new Map<Image, SubTexture>();

  /**
   * This is a request for resources
   */
  requestResource(resource: AtlasResource): Three.Texture {
    if (resource instanceof ColorAtlasResource) {

    }

    else if (resource instanceof LabelAtlasResource) {

    }

    else if (resource instanceof ImageAtlasResource) {

    }
  }
}
