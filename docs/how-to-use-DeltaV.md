# How to use DeltaV

## BasicSurface

### BasicSurfaceOptions

* container: HTMLElement
* (required) The container this surface will fill with a canvas to render within
* cameras: U (U extends Lookup<Camera>)
* (required) A lookup of all cameras the surface will utilize. They are injected with identifiers to make it easy to reference them later. It's highly recommended to use an enum to identify the camera.
* handlesWheelEvents: boolean
* (optional) Tell the surface to absorb wheel events to prevent the wheel from scrolling the page. This defaults to true as it's more common to need wheel controls than not. Explicitly set to false to disable.
* providers: T (T extends Lookup<InstanceProvider<Instance>>)
* (required) A list of providers you will utilize within your application. They are injected with identifiers to make it easy to reference them later. It's highly recommended to use an enum to identify the provider. The list can be an empty list.
* rendererOptions?: ISurfaceOptions["rendererOptions"]
* (optional) Options used to specify settings for the surface itself and how it will be composited in the DOM.
* resources: W (W extends Lookup<BaseResourceOptions>)
* (required) A list of resources to be used for the pipeline. The list can be an empty list.
* eventManagers(cameras: U): V (V extends Lookup<EventManager>)
* (required) All of the event managers used to control the surface. They are injected with identifiers to make it easy to reference them later. It's highly recommended to use an enum to identify the event manager. It can be empty.
* pipeline(resources: W, providers: T, cameras: U, managers: V): IBasicSurfacePipeline
* (required) A callback that provides the pipeline to use in the surface.
* onNoWebGL(): void
* (optional) A callback that will be called if no webgl context is detected

### How to set up a pipeline

#### Providers

developers can create a list of InstanceProviders or an empty list. These providers can be empty or with instances. Different providers can hold same or different types of instances.

#### Cameras

developers can create a list of cameras to be applied to controllers and views.

#### EventManagers

This callBack will return a list of eventHandlers. These eventHandlers include SimpleEventHandler or BasicCamera2DController.

#### Resources

This is a list of resources that developers will use in layers for labels, images or videos. There are two types of resources: AtlasResouce and FontResource

#### Pipeline

Pipeline is a callBack that will return a list of scenes. A scene is a world space to inject items into. Each scene can have multiple views and layers. View defines the angle to look at the scene. Layer is the way to inject elements into the scene. A typical list of scene will be like the following codes.

```
scenes: {
  default: {
    views: {
      "default-view": createView(View2D, {
        background: [0, 0, 0, 1],
        camera: cameras.main,
        clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
      })
    },
    layers: {
      labels: createLayer(LabelLayer, {
      	animate: {
        	color: AutoEasingMethod.easeInOutCubic(500)
      	},
      	data: providers.labels,
      	resourceKey: resources.font.key,
      	scaleMode: this.parameters.scaleMode
      })
    }
  }
}
```
