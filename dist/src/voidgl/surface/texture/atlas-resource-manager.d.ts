import { InstanceIOValue } from '../../types';
import { Instance } from '../../util/instance';
import { AtlasResource } from './atlas-manager';
import { ColorAtlasResource } from './color-atlas-resource';
import { ImageAtlasResource } from './image-atlas-resource';
import { LabelAtlasResource } from './label-atlas-resource';
import { SubTexture } from './sub-texture';
/**
 * This class is responsible for tracking resources requested to be placed on an Atlas.
 * This makes sure the resource is uploaded and then properly cached so similar requests
 * return already existing resources. This also manages instances waiting for the resource
 * to be made available.
 */
export declare class AtlasResourceManager {
    /** This is the atlas currently targetted by requests */
    targetAtlas: string;
    labelToTexture: Map<LabelAtlasResource, SubTexture>;
    colorToTexture: Map<ColorAtlasResource, SubTexture>;
    imageToTexture: Map<ImageAtlasResource, SubTexture>;
    /**
     * This is a request for resources
     */
    request(resource: AtlasResource, instance: Instance): InstanceIOValue;
    /**
     * This is used by the system to target the correct atlas for subsequent requests to a resource.
     */
    setTargetAtlas(target: string): void;
}
