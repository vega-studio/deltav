import {
  atlasRequest,
  AtlasResource,
  IAtlasResourceRequest,
} from "../../../resources";
import { createChildLayer, mapInjectDefault } from "../../../util";
import { debugVideoEvents } from "./debug-video";
import { IImageRenderLayerProps, ImageRenderLayer } from "./image-render-layer";
import { ImageInstance } from "./image-instance";
import { InstanceDiffType } from "../../../types";
import { InstanceProvider } from "../../../instance-provider";
import { Layer2D } from "../../view/layer-2d";
import { PromiseResolver } from "../../../util/promise-resolver";

export interface IImageLayerProps<T extends ImageInstance>
  extends IImageRenderLayerProps<T> {}

export type ImageVideoResource = {
  /**
   * IF AND ONLY IF the browser supports it. This will cause the video to begin playing immediately when ready and
   * loaded. This merely prevents the need to add video.play() to something after onReady has been called. All other
   * expected video patterns are expected to apply.
   */
  autoPlay?: boolean;
  /**
   * This is the source the video will load.
   */
  videoSrc: string;
};

export type ImageInstanceResource =
  | string
  | ImageBitmap
  | ImageData
  | HTMLImageElement
  | HTMLCanvasElement
  | ImageVideoResource;

/**
 * Typeguard for video resource requests
 */
export function isVideoResource(val: any): val is ImageVideoResource {
  return val && val.videoSrc;
}

/** Simple image source to be used for waiting elements */
const WHITE_PIXEL = new Image();
WHITE_PIXEL.src =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

/**
 * This layer displays Images and provides as many controls as possible for displaying
 * them in interesting ways. This is the primary handler for image instances.
 */
export class ImageLayer<
  TInstance extends ImageInstance,
  TProps extends IImageLayerProps<TInstance>,
> extends Layer2D<TInstance, TProps> {
  static defaultProps: IImageLayerProps<any> = {
    atlas: "default",
    key: "",
    data: new InstanceProvider<ImageInstance>(),
  };

  /** Internal provider for child layers for this layer to hand off to */
  childProvider = new InstanceProvider<ImageInstance>();
  /**
   * This tracks which resource this image is associated with This allows us to know what resource an image
   * moves on from, thus allowing us to dispatch a disposal request of the resource.
   */
  imageToResource = new Map<ImageInstance, IAtlasResourceRequest["source"]>();
  /** The cached property ids of the instances so they are not processed every draw */
  propertyIds?: { [key: string]: number };
  /** We can consolidate requests at this layer level to reduce memory footprint of requests */
  sourceToRequest = new Map<AtlasResource, IAtlasResourceRequest>();
  /** Map video resource requests to their corresponding video element */
  sourceToVideo = new Map<string, HTMLVideoElement>();
  /**
   * Stores a lookup to see which instances are using a video source. This helps track when the video source is no
   * longer in use and can be disposed.
   */
  usingVideo = new Map<string, Set<ImageInstance>>();
  /**
   * These are the instances waiting for a video source to finish loading and have valid dimensions to be used by the
   * resource manager.
   */
  waitingForVideo = new Map<string, Set<ImageInstance>>();
  /**
   * Instance lookup to see which video source the instance is waiting on.
   */
  waitForVideoSource = new Map<ImageInstance, string>();
  /**
   * In cases where the image has a special case loading procedure like videos, the image will have it's onReady
   */
  originalOnReadyCallbacks = new Map<
    ImageInstance,
    ImageInstance["onReady"] | undefined
  >();

  /**
   * The image layer will manage the resources for the images, and the child layer will concern itself
   * with rendering.
   */
  childLayers() {
    const child = createChildLayer(ImageRenderLayer, {
      ...this.props,
      key: `${this.props.key}.image-render-layer`,
    });

    return [child];
  }

  destroy() {
    super.destroy();
    this.sourceToVideo.forEach((video) => {
      video.pause();
      this.sourceToVideo.clear();
      this.waitingForVideo.clear();
      this.waitForVideoSource.clear();
    });
  }

  /**
   * Hijack the draw method to control changes to the source so we can send the manager dispose requests
   * of a given image.
   */
  draw() {
    // Get the changes we need to handle. We make sure the provider's changes remain in tact for
    // the child layer to process them.
    const changes = this.resolveChanges(true);
    // Make sure we are triggering redraws appropriately
    this.updateAnimationState();
    // No changes, do nadda
    if (changes.length <= 0) return;

    if (!this.propertyIds) {
      this.propertyIds = this.getInstanceObservableIds(changes[0][0], [
        "source",
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
            // Make sure we get the atlas appropriate resource for the instance
            let resource = this.getAtlasSource(instance);
            // Nothing needs to happen if the resource didn't change
            if (resource === previous) break;

            // If the previous is a video source we need to clear the instance out from utilizing the video
            if (previous instanceof HTMLVideoElement) {
              // Remove the potentially existing 'waiting on the video' references
              const waitingOnSource = this.waitForVideoSource.get(instance);

              if (waitingOnSource) {
                this.waitForVideoSource.delete(instance);
                const instancesWaiting =
                  this.waitingForVideo.get(waitingOnSource);

                if (instancesWaiting) {
                  instancesWaiting.delete(instance);
                }
              }

              // Remove the instance from 'using' the video source
              let instancesUsing = this.usingVideo.get(
                previous.getAttribute("data-source") || ""
              );

              if (!instancesUsing) {
                instancesUsing = new Set();
              }

              instancesUsing.delete(instance);

              if (instancesUsing.size <= 0) {
                this.sourceToVideo.delete(
                  previous.getAttribute("data-source") || ""
                );
              }

              // Revert the instance's onReady back to what it originally was
              instance.onReady = this.originalOnReadyCallbacks.get(instance);
            }

            // Video resources must be prepped to handle special circumstances
            if (isVideoResource(instance.source)) {
              this.prepareVideo(instance, instance.source);
              // Prepping the video can potentially temp swap the source of the image
              resource = this.getAtlasSource(instance);
              // Add the video to the video's use list
              const usingList = mapInjectDefault(
                this.usingVideo,
                instance.source.videoSrc,
                new Set()
              );
              usingList.add(instance);
            }

            // We set the new resource
            this.imageToResource.set(instance, resource);
            // We make a disposal request to the resource manager
            this.resource.request(
              this,
              instance,
              atlasRequest({
                key: this.props.atlas || "",
                disposeResource: true,
                source: previous,
              })
            );

            // Look for similar requests for resources and consolidate
            if (resource) {
              let request = this.sourceToRequest.get(resource);

              if (!request || (request.texture && !request.texture.isValid)) {
                request = atlasRequest({
                  key: this.props.atlas || "",
                  source: resource,
                  rasterizationScale: this.props.rasterizationScale,
                });

                this.sourceToRequest.set(resource, request);
              }

              instance.request = request;
              this.resource.request(this, instance, request);
            }
          }
          break;

        case InstanceDiffType.INSERT:
          // Look for similar requests for resources and consolidate
          if (instance.source) {
            // Make sure we get the atlas appropriate resource for the instance
            let resource = this.getAtlasSource(instance);

            if (isVideoResource(instance.source)) {
              this.prepareVideo(instance, instance.source);
              // Prepping the video can potentially temp swap the source of the image
              resource = this.getAtlasSource(instance);
              // Add the video to the video's use list
              const usingList = mapInjectDefault(
                this.usingVideo,
                instance.source.videoSrc,
                new Set()
              );
              usingList.add(instance);
            }

            // See if we have an existing request for this resource
            let request = this.sourceToRequest.get(resource);

            if (!request || (request.texture && !request.texture.isValid)) {
              request = atlasRequest({
                key: this.props.atlas || "",
                source: resource,
                rasterizationScale: this.props.rasterizationScale,
              });

              this.sourceToRequest.set(resource, request);
            }

            instance.request = request;
          }

          break;

        case InstanceDiffType.REMOVE: {
          // Make sure we get the atlas appropriate resource for the instance
          const resource = this.getAtlasSource(instance);
          // Clear out any state the instance may have retained in this layer
          this.imageToResource.delete(instance);

          // Clear out video useage
          if (isVideoResource(instance.source)) {
            const waitingOnSource = this.waitForVideoSource.get(instance);

            if (waitingOnSource) {
              this.waitForVideoSource.delete(instance);
              const instancesWaiting =
                this.waitingForVideo.get(waitingOnSource);

              if (instancesWaiting) {
                instancesWaiting.delete(instance);
              }
            }

            let instancesUsing = this.usingVideo.get(instance.source.videoSrc);

            if (!instancesUsing) {
              instancesUsing = new Set();
            }

            instancesUsing.delete(instance);

            if (instancesUsing.size <= 0) {
              this.sourceToVideo.delete(instance.source.videoSrc);
            }

            this.originalOnReadyCallbacks.delete(instance);
          }

          // We make a disposal request here
          this.resource.request(
            this,
            instance,
            atlasRequest({
              key: this.props.atlas || "",
              disposeResource: true,
              source: resource,
            })
          );
          break;
        }
      }
    }

    // After all changes are processed, we need to check to see if any video sources are no longer in use and clear out
    // any remaining references to the video.
    const toRemoveVideoSources: string[] = [];

    this.usingVideo.forEach((usingVideoSet, videoSrc) => {
      if (usingVideoSet.size <= 0) {
        toRemoveVideoSources.push(videoSrc);
      }
    });

    for (let i = 0, iMax = toRemoveVideoSources.length; i < iMax; ++i) {
      const source = toRemoveVideoSources[i];
      this.usingVideo.delete(source);
      this.sourceToVideo.delete(source);
    }
  }

  /**
   * Gets the source that is atlas reques compatible.
   */
  private getAtlasSource(image: ImageInstance) {
    if (isVideoResource(image.source)) {
      return this.sourceToVideo.get(image.source.videoSrc) || WHITE_PIXEL;
    }

    return image.source;
  }

  /**
   * This handles creating the video object from the source. It then queues up the waiting needs and temporarily
   * converts the video Image to a simple white image that will take on the tint of the ImageInstance.
   */
  private prepareVideo(image: ImageInstance, source: ImageVideoResource) {
    const check = this.sourceToVideo.get(source.videoSrc);
    const checkCallback = this.originalOnReadyCallbacks.get(image);

    if (!checkCallback) {
      this.originalOnReadyCallbacks.set(image, image.onReady);
    }

    // Let's first see if the source provided already is being monitored by this layer.
    if (check) {
      const waitingInstances = this.waitingForVideo.get(source.videoSrc);

      // If waiting instances exists, then the video has not loaded yet and this becomes an additional instance waiting
      // for the video to be ready.
      if (waitingInstances) {
        waitingInstances.add(image);
        this.waitForVideoSource.set(image, source.videoSrc);
        image.onReady = undefined;
        image.source = WHITE_PIXEL;

        image.videoLoad = () => {
          check.load();

          if (source.autoPlay) {
            check.play();
          }
        };
      }

      // Otherwise, the video IS ready and the instance can carry on as a normal instance
      else {
        const onReady =
          this.originalOnReadyCallbacks.get(image) || image.onReady;
        if (!onReady) return;

        // Replace the onReady that the resource manager will fire with an onReady that will execute with the video
        // that is prepped and ready included.
        image.onReady = (image: ImageInstance) => {
          onReady(image, check);
        };
      }

      return;
    }

    // Create the physical video element to use.
    const video = document.createElement("video");
    this.sourceToVideo.set(source.videoSrc, video);
    // Store the exact source path on the element (the src attribute gets resolved to relative http request)
    video.setAttribute("data-source", source.videoSrc);

    debugVideoEvents(video);

    // We must load the video properly to make it compatible with the texture and have all of it's properties
    // set in an appropriate fashion to not violate current video playback standards.
    const metaResolver = new PromiseResolver<void>();
    const dataResolver = new PromiseResolver<void>();

    const removeListeners = () => {
      video.removeEventListener("loadedmetadata", waitForMetaData);
      video.removeEventListener("loadeddata", waitForData);
      video.removeEventListener("error", waitForError);

      this.waitingForVideo.delete(source.videoSrc);
      this.waitForVideoSource.delete(image);
    };

    const waitForData = () => {
      dataResolver.resolve();
    };

    const waitForMetaData = () => {
      metaResolver.resolve();
    };

    const waitForError = (event: any) => {
      let error;

      // Chrome v60
      if (event.path && event.path[0]) {
        error = event.path[0].error;
      }

      // Firefox v55
      if (event.originalTarget) {
        error = event.originalTarget.error;
      }

      // Broadcast the error
      console.warn(
        "There was an error loading the video resource to the atlas texture context"
      );
      console.warn(error);

      // Reject the blocking promises
      metaResolver.reject({});
      dataResolver.reject({});
    };

    // We must ensure the source has it's meta data and first frame available. The meta data ensures a
    // videoWidth and height are available and the first frame ensures WebGL does not throw an error in some
    // browsers like chrome that will think the video is initially invalid.
    video.addEventListener("loadedmetadata", waitForMetaData);
    video.addEventListener("loadeddata", waitForData);
    video.addEventListener("error", waitForError);

    // We now initialize the image as waiting on the video
    // The image may have a custom onReady set awaiting the video's completion. We must not allow it to happen for
    // loading the placeholder white image. So we replace it with a NOOP until the video itself is actually ready to
    // be loaded into the resource manager.
    image.onReady = undefined;
    // We must also register the video source as waiting
    const waitingInstances = mapInjectDefault(
      this.waitingForVideo,
      source.videoSrc,
      new Set()
    );
    waitingInstances.add(image);
    this.waitForVideoSource.set(image, source.videoSrc);
    // Make the video's source point to the empty white image
    image.source = WHITE_PIXEL;
    // Lastly, make the image videoLoad method actually be a valid video operation.
    image.videoLoad = () => {
      video.load();

      if (source.autoPlay) {
        video.play();
      }
    };

    // Current standard declares unmuted videos CAN NOT be auto played via javascript and must play in the context of
    // a user event
    video.muted = true;
    // Set the video source after the events have been assigned so we can wait for the video to begin playback
    video.src = source.videoSrc;

    Promise.all([metaResolver.promise, dataResolver.promise])
      // This executes when the video is officially ready and will be loaded into the resource manager for play back
      .then(() => {
        // Make sure the video start from the beginning
        video.currentTime = 0;

        // Check the video source preferences to see if the video should play immediately upon loading.
        if (source.autoPlay) {
          video.play();
        }

        // Retrieve all of the instances waiting for this video to be ready
        const waitingInstances = this.waitingForVideo.get(source.videoSrc);

        if (waitingInstances) {
          waitingInstances.forEach((instance) => {
            // Set the instance's source back to the video. Since this is asynchronous, it should trigger the change and
            // flow through the provider
            instance.source = source;
            instance.onReady = this.originalOnReadyCallbacks.get(instance);
          });
        }

        removeListeners();
      })
      .catch(() => {
        removeListeners();
      });
  }

  /**
   * This asserts whether or not the layer should be triggering redraws or not.
   */
  private updateAnimationState() {
    // We should check to see if any of the video sources are playing or not
    let isVideoPlaying = false;

    this.sourceToVideo.forEach((video) => {
      if (!video.paused) {
        isVideoPlaying = true;
      }
    });

    // When videos are in use AND playing, this layer should be on continuous redraws to ensure the video renders continuously.
    this.isAnimationContinuous = this.usingVideo.size > 0 && isVideoPlaying;
  }

  /**
   * Parent layer has no rendering needs
   */
  initShader() {
    return null;
  }
}
