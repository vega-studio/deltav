import { InstanceProvider } from "../../../instance-provider";
import { atlasRequest, IAtlasResourceRequest } from "../../../resources";
import { createLayer, LayerInitializer } from "../../../surface/layer";
import { InstanceDiffType } from "../../../types";
import { Layer2D } from "../../view/layer-2d";
import { ImageInstance } from "./image-instance";
import { IImageRenderLayerProps, ImageRenderLayer } from "./image-render-layer";

export interface IImageLayerProps<T extends ImageInstance>
  extends IImageRenderLayerProps<T> {}

/**
 * This layer displays Images and provides as many controls as possible for displaying
 * them in interesting ways. This is the primary handler for image instances.
 */
export class ImageLayer<
  T extends ImageInstance,
  U extends IImageLayerProps<T>
> extends Layer2D<T, U> {
  static defaultProps: IImageLayerProps<any> = {
    atlas: "default",
    key: "",
    data: new InstanceProvider<ImageInstance>()
  };

  /** Internal provider for child layers for this layer to hand off to */
  childProvider = new InstanceProvider<ImageInstance>();
  /**
   * This tracks which resource this image is associated with This allows us to know what resource an image
   * moves on from, thus allowing us to dispatch a disposal request of the resource.
   */
  imageToResource = new Map<ImageInstance, ImageInstance["source"]>();
  /** The cached property ids of the instances so they are not processed every draw */
  propertyIds?: { [key: string]: number };
  /** We can consolidate requests at this layer level to reduce memory footprint of requests */
  sourceToRequest = new Map<ImageInstance["source"], IAtlasResourceRequest>();

  /**
   * The image layer will manage the resources for the images, and the child layer will concern itself
   * with rendering.
   */
  childLayers(): LayerInitializer[] {
    return [
      createLayer(ImageRenderLayer, {
        ...this.props,
        key: `${this.props.key}.child`
      })
    ];
  }

  /**
   * Hijack the draw method to control changes to the source so we can send the manager dispose requests
   * of a given image.
   */
  draw() {
    // Get the changes we need to handle. We make sure the provider's changes remain in tact for
    // the child layer to process them.
    const changes = this.resolveChanges(true);
    // No changes, do nadda
    if (changes.length <= 0) return;

    if (!this.propertyIds) {
      this.propertyIds = this.getInstanceObservableIds(changes[0][0], [
        "source"
      ]);
    }

    // Destructure the ids to work with
    const { source: sourceId } = this.propertyIds;

    for (let i = 0, iMax = changes.length; i < iMax; ++i) {
      const [instance, diffType, changed] = changes[i];

      switch (diffType) {
        case InstanceDiffType.CHANGE:
          // Indicates changes took place
          if (changed[sourceId] !== undefined) {
            // We get the previously stored resource
            const previous = this.imageToResource.get(instance);
            // Nothing needs to happen if the resource didn't change
            if (instance.source === previous) break;
            // We set the new resource
            this.imageToResource.set(instance, instance.source);
            // We make a disposal request to the resource manager
            this.resource.request(
              this,
              instance,
              atlasRequest({
                key: this.props.atlas || "",
                disposeResource: true,
                source: previous
              })
            );

            // Look for similar requests for resources and consolidate
            if (instance.source) {
              let request = this.sourceToRequest.get(instance.source);

              if (!request || (request.texture && !request.texture.isValid)) {
                request = atlasRequest({
                  key: this.props.atlas || "",
                  source: instance.source,
                  rasterizationScale: this.props.rasterizationScale
                });

                this.sourceToRequest.set(instance.source, request);
              }

              instance.request = request;
            }
          }
          break;

        case InstanceDiffType.INSERT:
          // Look for similar requests for resources and consolidate
          if (instance.source) {
            let request = this.sourceToRequest.get(instance.source);

            if (!request || (request.texture && !request.texture.isValid)) {
              request = atlasRequest({
                key: this.props.atlas || "",
                source: instance.source,
                rasterizationScale: this.props.rasterizationScale
              });

              this.sourceToRequest.set(instance.source, request);
            }

            instance.request = request;
          }

          break;

        case InstanceDiffType.REMOVE:
          // We make a disposal request here
          this.resource.request(
            this,
            instance,
            atlasRequest({
              key: this.props.atlas || "",
              disposeResource: true,
              source: instance.source
            })
          );
          break;
      }
    }
  }

  /**
   * Parent layer has no rendering needs
   */
  initShader() {
    return null;
  }
}
