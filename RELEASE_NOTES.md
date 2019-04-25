# Release Notes

## 1.25.4

* `(FIXED)` Labels onReady event was not firing when the label changed text and in other expected cases.
* `(FIXED)` Major issue, Source is too large, that caused a crash for a layer when using the font resource manager.
* `(FIXED)` Source is too large errors now provides some additional helpful feedback showing which attribute is receiving too large of a value.

## 1.25.3

* `(FIXED)` Key debug statements should log properly now
* `(FIXED)` Reduced GL context retrieval when producing a LayerSurface

## 1.25.2

* `(FIXED)` Added blending tests

## 1.25.1

* `(FIXED)` Blending issues with circles and edges

## 1.25.0

* `(ADDED)` Control Font Map resource texture sizes
* `(ADDED)` Material control can now be applied to a layer's props

## 1.24.0

* `(ADDED)` Attribute expanders. Easily integrate custom attribute modifiers that applies across the entire pipeline.
* `(ADDED)` Atlas Resource Manager now handles disposing of image resources to make it simpler to create your own layers that utilize resources.
* `(ADDED)` Fixed naming and sizing conventions in the base layers that were in place to appease threejs.
* `(ADDED)` Text is now implemented to be a bitmap font with in browser kerning estimation
* `(ADDED)` Resource Managers, create resource managers to handle resource requests to routines that manage textures.
* `(ADDED)` Attribute Expanders, create custom attribute expanders to create new and unique attributes that can produce child attributes or modify an input attribute in significant ways that automates complicated processes in the GL layer.
* `(ADDED)` Removed all run time third party libraries for the project.

## 1.23.3

* `(FIXED)` Mouse wheel to pan was very sensitive when zoomed in deep

## 1.23.2

* `(FIXED)` Vertex packing resizing its buffer caused instances in the first buffer to not update the correct buffer

## 1.23.1

* `(FIXED)` Panning would not happen under certain conditions or would be incorrect with the applied bounds.

## 1.23.0

* `(ADDED)` Basic Camera Controller now supports panning via scroll wheel when desired.
* `(FIXED)` Error with large numbers of instances being created causing a vertex packing buffer to resize and cause a buffer error

## 1.22.1

* `(FIXED)` The framework now detects and warns when a provider is improperly used across two layers

## 1.22.0

* `(ADDED)` Comma delimited imports ${import: module, module2, etc}
* `(ADDED)` Constants and math methods have been added to the module base. fsin, fcos, PI, PI2, PI_2, etc.
* `(ADDED)` More component-wise vector methods min<1-4>(), max<1-4>(), divide<1-4>(), vec<1-4>()
* `(ADDED)` Shader modules can include attributes and uniforms to help guarantee the module has what it needs to work with the layer.
* `(FIXED)` inject-shader-io is now cleaned up to use the new shader module attribute inclusion pattern to make the code cleaner and easier to follow.
* `(FIXED)` Vec2 is used a lot more consistently through the project. IPoint has been removed in favor of Vec2.

## 1.21.0

* `(ADDED)` Project now releases to AWS s3 during release process to detach dependence on this private repo without gaining access to the project specifics.

## 1.20.4

* `(FIXED)` Some devices would force a pixel ratio less than one for the window status. This is problematic for many of fiestas features, so a hard cap on keeping the ratio >= 1.0 has been employed for the context.

## 1.20.3

* `(FIXED)` Update typescript and threejs typings

## 1.20.2

* `(FIXED)` Version fixes for the three library as well as updates to address some typing issues showing up in projects using this library.

## 1.20.1

* `(FIXED)` Vertex Packing performance buffering strategy was not creating proper blending outcomes for transparent shapes.

## 1.20.0

* `(ADDED)` The framework will now detect when no changes are taking place.  Upon no changes and no mouse interactions detected, draw calls will cease.
* `(ADDED)` There is an additional buffer strategy to help keep shaders running optimally. Vertex Attribute Packing. This causes the system to detect layers that used too many attributes to utilize vertex attributes explicitly. Usually in this case the system would use the compatibility mode of the uniform buffer strategy, but now it will attempt to pack down the vertex attributes into blocks to maximize the space used for attributes as much as possible thus keeping it in an attribute mode rather than uniform mode for our instancing. This mode is based on the idea that an Attribute is actually a Block of size 4 floats. If you use just one float, the hardware considers the entire block used instead of packing it down internally. Thus we have to help the hardware utilize those blocks a bit smarter.
* `(ADDED)` Shader modules! You can now register a shader and import it via {import: module-id} within your shader code. As the library grows, modules will be registered in the framework for easy access to useful methods. You can also register your own modules using ShaderModule.register.

## 1.19.6

* `(FIXED)` printShader for a layer's props now works properly.
* `(FIXED)` Rectangles now follow the label rendering logic closer thus making them more uniform in use.
* `(FIXED)` Updated Three JS to the most recent version that is compatible.

## 1.19.5

* `(FIXED)` Labels were overly applying alpha color values thus making them look faded.

## 1.19.4

* `(FIXED)` Providers would not always fully clear when clear() or destroy() was called.

## 1.19.3

* `(FIXED)` Properties on an instance could get out of sync with their rendering if properties on the instance changed while a resource for the instance was being loaded.

## 1.19.2

* `(FIXED)` An error would appear when a layer would switch over to Uniform Buffering due to the new easing controls added in.

## 1.19.1

* `(FIXED)` Providers handed to a new layer that had been handled by another layer now will be synced when a layer is initialized so the layer properly tracks all existing items in the provider.
* `(FIXED)` GPU Easing had a bug that caused start states of animations to be incorrect and point to seemingly other elements start states
* `(FIXED)` Vectors now have a working copy method for any of the vector sizes.
* `(FIXED)` syncing providers to new layers, issue with easing animations

## 1.19.0

* `(ADDED)` This improves animations considerably and grants easier access to the internal easing process to allow for animation timings and initial values to be controlled directly.
* `(ADDED)` Circles now use a Vec2 for position to increase consistency and improve performance.

## 1.18.0

* `(ADDED)` Edges and circles now have layer level opacities added to them to allow for fast and efficient transparency control of an entire layer.

## 1.17.0

* `(ADDED)` Additional properties added to the arcs to allow for GPU animations.
* `(FIXED)` Arcs had precision limitations on some hardware due to sine and cosine limitations. This was averted by replacing these methods with high accuracy approximations that retains the precision of floats on the shader.

## 1.16.0

* `(ADDED)` After resources are finished loading in, the surface has a new promise loadReady that can be used in a promise or await pattern that will resolve once loading resources have completed loading.

## 1.15.0

* `(ADDED)` Block and block index are no longer required when making instance attributes
* `(FIXED)` Auto packing caused some issues in varying environments

## 1.14.0

* `(ADDED)` Animation property added to several base layers for custom animation control over certain properties.

## 1.13.0

* `(ADDED)` Added arcs as a new base layer for rending circular edges.
* `(FIXED)` Edges for screen space did not have extending set up correctly

## 1.12.1

* `(FIXED)` Labels in single axis scaling would get distorted and unreadable

## 1.12.0

* `(ADDED)` Upgraded to TypeScript 2.9.2 and patched compatability issues

## 1.11.0

* `(ADDED)` Automatic Instancing performance is vastly increased for many systems with zero changes to the front facing API.
* `(ADDED)` Continuous AutoEasing timing mode is available now. This allows easing methods to utilize a time value that ranges from 0 to max value of a float.
* `(ADDED)` A sinusoidal AutoEasingMethod was added. This allows for easy continuous changing of a value that operates on a sine wave. The value will oscillate based on: start value is where the sine wave begins (x=0) and the set end value is the peak of the amplitude of the sine wave. Thus (end - start) * 2 is the amplitude of the sine wave.

## 1.10.1

* `(FIXED)` certain async operations caused an undefined scene to crop up and cause issues on FF

## 1.10.0

* `(ADDED)` Color picking is an option for pick type by setting picking to PickType.SINGLE
* `(ADDED)` You can now inherit layer's that are properly designed for extension. This allows you to inject additional attributes, uniforms, and shader code into an existing layer's system. This does have some limitations in not allowing overriding or removal of properties. All base layers have been updated to be inheritable.
* `(FIXED)` MobX is removed, more than doubling performance for committing changes to instances.

## 1.9.4

* `(FIXED)` network-bubble-chart #146. Rapid reloading of the chart will no longer cause an error to occur.

## 1.9.3

* `(FIXED)` Section title flattens section circle #135

## 1.9.2

* `(FIXED)` Release process will now produce the correct release file name

## 1.9.1

* `(FIXED)` autoUpdate of null error removed
* `(FIXED)` Useless resource error removed that was caused from invalidated and no longer used resources finished loading.

## 1.9.0

* `(ADDED)` maxScale for labels to allow for higher scales in BOUND_MAX scale mode

## 1.8.3

* `(FIXED)` Mouse wheel for FF is working now

## 1.8.2

* `(FIXED)` Rings were not honoring scaleFactor

## 1.8.1

* `(FIXED)` Labels now can have a scale and honor their scale mode properly now
* `(FIXED)` Circles and rings are no longer point sprites, thus eliminating gl_PointSize max limitations

## 1.8.0

* `(ADDED)` High level destroying of utilized resources. Ensures all resources utilized by the surface is freed up.
* `(FIXED)` blending issues with some base layers

## 1.7.0

* `(ADDED)` Camera Bounds now supports bounding scale ranges
* `(FIXED)` Camera Bounds was not honoring the view id injected into the bounds settings.

## 1.6.0

* `(ADDED)` View bounds available for the BasicCameraController

## 1.5.0

* `(ADDED)` Improved controls over changes to camera positioning when using BasicCameraController
* `(FIXED)` Labels and other anchorable elements had issues with rendering and hit tests
* `(FIXED)` Bad imports
* `(FIXED)` Fixed edge picking math on single control bezier curves

## 1.4.0

* `(ADDED)` Control and get the view range of a camera for a given view
* `(ADDED)` Anchor-able rectangles

## 1.3.0

* `(ADDED)` Included a way to add a selection padding to edges to make them easier to pick.
* `(ADDED)` Improved pan scale filter interface
* `(ADDED)` Scale and pan filters added to BasicCameraController
* `(ADDED)` PickInfo now includes more metrics about the mouse
* `(ADDED)` Label maxWidth is now available
* `(FIXED)` Atlas had concurrency issues and issues with loading empty label resources
* `(FIXED)` Edge interactions did not consistently work with mouse interactions
* `(FIXED)` Fixed up edge and circle picking issues
* `(FIXED)` World view query had pixel ratio fallacies
* `(FIXED)` NPE randomly occurs for atlas resource lookups
* `(FIXED)` Transparency was not blending correctly

## 1.2.0

* `(ADDED)` Mouse interactions for EdgeLayer, RingLayer, LabelLayer, ImageLayer

## 1.1.0

* `(ADDED)` A base layer property 'picking' is now available for setting PickType.ALL, PickType.SINGLE and PickType.NONE
* `(ADDED)` Layers can implement quad tree mouse interactions now for the PickType.ALL mode
* `(ADDED)` Base circle layer has quad tree mouse interactions available now

## 1.0.1

* `(FIXED)` auto release notes errored on first release

## 1.0.0

* `(BREAKING)` Changed from react to preact

