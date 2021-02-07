## 2.0.0

## Breaking

- [`BREAKING`]: Color picking is now controlled by the implementation so decisions on when the GPU executes read pixels is now controlled. Additionally, color picking is integrated into the concepts of MRT so layers benefit from single draw call outputs.
- [`BREAKING`]: For some cases, writing gl_FragColor is no longer supported. You must write in an output in your main method ${out: color} = something.

## Added

- [`ADDED`]: Float array now supported by uniforms.
- [`ADDED`]: Render Target and Multiple Render Target support to render output to a specified Texture utilizing Views. This includes upgrades to how Layers are written so they can be compatible with a multiple Render Target types but still optimize themselves to only compute what is needed for available and compatible render targets for a given pipeline.
- [`ADDED`]: Optimize output targets for your MRT system. You can now make specific target types disabled by default and will not be enabled unless expressly called to do so.
- [`ADDED`]: Post processing is available along with helper methods for some common techniques, as well as helpers to create your own post processing effects to combine Texture information into another destination.
- [`ADDED`]: Shader support for MRT. Write multiple fragment shaders that will be optimally combined and utilized in rendering, but write only what you need per output.
- [`ADDED`]: Script for generating shader modules snippets for your VSCode environment. Makes import statements available in your code hinting for ShaderModules created.

## Fixed

- [`FIXED`]: Double rendering per frame has been removed. Major performance boost from fixing this major oversight.

## 1.39.0

## Added

- [`ADDED`]: Added initial Transform Scene Graph capabilities along with a pattern that integrates with Instances for automated updates.
- [`ADDED`]: Enabled WebGL2 context. This does not include extra webgl2 features, but works with the new context.
- [`ADDED`]: Added support for Orthographic cameras for View3D
- [`ADDED`]: Better support for Transform and Instance3D triggering updates based on changes to the transform directly.

## Fixed

- [`FIXED`]: Rendering performance improvement for 2D assets by utilizing the combined view projection matrix for the clipSpace operation
- [`FIXED`]: Camera on Firefox updates properly to changes
- [`FIXED`]: Fixed issue with observables registering IDs during complex update loops where updating an attribute can trigger updates to the instance
- [`FIXED`]: Performance improvements and fixes for camera
- [`FIXED`]: Quaternion slerp animations were causing distortions in geometry instead of properly rotating. This has been resolved and you will no longer see flattened 3D animations.
- [`FIXED`]: New demo showing the screenRay projection to aid in interactions with elements from the screen into the 3D world

## 1.38.1

## Fixed

- [`FIXED`]: OffscreenCanvas no longer breaks browsers that did not implement the OffscreenCanvas class.
- [`FIXED`]: Ensured minifying does not happen during development to improve build times.

## 1.38.0

## Added

- [`ADDED`]: Ability to preload strings into a font resource to improve initial render times with no perceived flicker.
- [`ADDED`]: OnAnimationLoop now includes a duration option so the command will only execute for a provided amount of time.

## 1.37.3

## Fixed

- [`FIXED`]: Draws halt when nothing is animating or changing within a view. Previous changes had broken this behavior, so this should be resolved now.

## 1.37.2

## Fixed

- [`FIXED`]: The version deltav is using is now embedded into the canvas it generates as a data attribute. Will be useful for debugging purposes.

## 1.37.1

## Fixed

- [`FIXED`]: The Lookup type now is a string keyed type. This is more in line with typescript identifying all keys as strings and simplifies the use of the type.

## 1.37.0

## Added

- [`ADDED`]: Made waiting for valid dimensions an available utility. This provides a pattern for improving re-entrant single executing methods that need valid dimensions of an HTML Element be available before continuing.

## 1.36.0

## Added

- [`ADDED`]: Stream changes by setting a simple property on a layer now. Allows for changes to not cause intense pressure on the CPU or RAM when working with massive amounts of data.
- [`ADDED`]: Layer refs added. You can now get deeper inspection into created layers by setting a reference to the layer. The current feature this supports is greater insight to completion of easing animations.

## Fixed

- [`FIXED`]: Made color picking integration simpler to understand by moving elements from the diff processing portion to the layer level of logic. This cleaned out some excess and confusing files and made higher flexibility for the layer or customized layers.
- [`FIXED`]: Typescript and typings updated to most recent versions, allowing for latest TS features as well as ensuring the library is compatible with the latest standards.

## 1.35.9

## Fixed

- [`FIXED`]: Mouse picking was picking with an offset if the view was not rendered with its edges at the edges of the screen. This has been resolved and now the mouse triggers events on instances no matter the View's offset from the surface's edges.

## 1.35.8

## Fixed

- [`FIXED`]: Publish problem with tarball. This effectively is v1.35.7 but with a version bump to fix the publishing problem.

## 1.35.7

## Fixed

- [`FIXED`]: Type references will now resolve properly for distributed type files.

## 1.35.6

## Fixed

- [`FIXED`]: Fixed release script by requiring npx to be available. Makes the script more reliable in differing environments.
- [`FIXED`]: Release script now works better cross-platform by fixing some pathing issues.
- [`FIXED`]: Label interactions now properly work when you set events to the LabelLayer

## 1.35.5

## Fixed

- [`FIXED`]: Output now provides better typescript docs and also has its source maps.

## 1.35.4

## Fixed

- [`FIXED`]: Moved the shader compression loader to a separate project so it can be utilized within other projects that use deltav.

## 1.35.3

## Fixed

- [`FIXED`]: README updated to reflect proper yarn instructions

## 1.35.2

## Fixed

- [`FIXED`]: README improvements

## 1.35.1

## Fixed

- [`FIXED`]: Fixed links within docs to work correctly within npm and git.
- [`FIXED`]: Added the github repo to the package.

## 1.35.0

## Added

- [`ADDED`]: The project has been prepared for the open source community. MIT license added. Initial Docs added. npmignore updated to only include relevant items.

## 1.34.0

## Added

- [`ADDED`]: OnAnimationLoop method now available to generate a command that executes on the animation frame. This also provides a means to do timings that resolve on an animation frame.
- [`ADDED`]: StopAllFrameCommands is a means to stop EVERYTHING that made a frame request including simple single frame commands and animation loops.

## Fixed

- [`FIXED`]: Git ignore updated to remove local aws script
- [`FIXED`]: Added a script to make aws deployment easier while not Open Sourced yet.
- [`FIXED`]: Added demos for easing equations to make it easier to have them debugged and visualize their output
- [`FIXED`]: Established a pattern for sub properties working with observables.
- [`FIXED`]: Removed a shift operator that caused hefty performance costs during add operations

## 1.33.0

## Added

- [`ADDED`]: 3D system with initial 3D layers
- [`ADDED`]: Transform support for both Cameras and models.
- [`ADDED`]: Views are now customizable and can be injected into the pipeline
- [`ADDED`]: Unit testing
- [`ADDED`]: Matrix and Quaternion libraries with tested methods. Vector library unit tested now as well.
- [`ADDED`]: Shader compression added. When the library is built, the shaders are stripped of comments and excess whitespace.
- [`ADDED`]: Math libraries have an out variable pattern to reduce interim allocations of variables.

## Fixed

- [`FIXED`]: Major performance enhancement for attributes with child attributes. A shift operator was causing load times to explode for items with many child attributes.
- [`FIXED`]: Fixed heroku deploys for CI

## 1.32.1

## Fixed

- [`FIXED`]: Release script added to replace auto release for now
- [`FIXED`]: Added app json to enable heroku features

# Release Notes

## 1.32.0

* `(ADDED)` Custom view creation. Use createView(View Type, props) to generate customized view functionality to handle viewport changes and manipulate your camera.
* `(ADDED)` All layers for 2D are now distinguished and ripped away from deep in the framework. This will make it much easier to manipulate, as well as simplify integration of additional systems.
* `(ADDED)` Use world2D shader module and Layer2D to work within the 2D world system.
* `(ADDED)` More reliable video playback.
* `(ADDED)` Resources used with the resource manager now properly garbage collects unused resources within the atlas when more resources are required to be injected in the atlas and the atlas is full.
* `(ADDED)` Alignment property for the text area is now available. Text can be center, left, or right within its bounds.
* `(ADDED)` TextArea now has scale modes BOUND_MAX, NEVER, ALWAYS to aid in displaying the text appropriately for varying situations.
* `(ADDED)` TextArea honors anchor points now to work in tandem with the scale modes.
* `(ADDED)` Touch events for single and multitouch input
* `(ADDED)` Touch support for the Basic Camera Controller. Pinch to zoom, drag to pan
* `(FIXED)` Fixed an issue with using a Texture as the options to creating a new Texture.
* `(FIXED)` Circles can now render as quads or points. Points perform way better in many cases but have rendering limitations. For this reason, the points mode will be the optional mode rather than the default.

## 1.31.3

* `(FIXED)` Circles can now render as quads or points. Points perform way better in many cases but have rendering limitations. For this reason, the points mode will be the optional mode rather than the default.

## 1.31.2

* `(FIXED)` Circles renders as POINTS now, thus improving performance a bit.
* `(FIXED)` POINTS can now be rendered non-instanced by setting vertex count to 0. This improves points rendering further.

## 1.31.1

* `(FIXED)` Added checks for lookup deconstruction to detect when naming has gone awry.

## 1.31.0

* `(ADDED)` pipeline method implemented. This allows a diffing approach to the rendering pipeline and allows for easy view dimension manipulation.
* `(ADDED)` BasicSurface added. This allows for extremely easy starting of a new rendering pipeline with providers and camera controls. This also helps with necessary guarantees required like reducing duplication of keys.
* `(ADDED)` TextArea is now available with many common text area properties for rendering multiline text such as lineSpacing, padding, and word wrap modes.
* `(FIXED)` The space for words in a label have been fixed and addressed.

## 1.30.5

* `(FIXED)` Completely fixed camera infinite loop

## 1.30.4

* `(FIXED)` ChartCamera caused an infinite loop in its event loop

## 1.30.3

* `(FIXED)` When the camera animates automatically, the camera now broadcasts the animated changes. The BasicCameraController responds to those changes as well and properly broadcasts the onRangeChange event for those changes.

## 1.30.2

* `(FIXED)` Bounds and quad trees operate properly now

## 1.30.1

* `(FIXED)` Timer would go negative when injected into the shaders.

## 1.30.0

* `(ADDED)` debugLayer is added. This can replace a createLayer call and will output useful information about the layer indicated.

## 1.29.0

* `(ADDED)` Camera offset and scale can now be animated

## 1.28.3

* `(FIXED)` The method nextFrame passes the time to the commands again

## 1.28.2

* `(FIXED)` Cleaned up unused items in the utility folder
* `(FIXED)` Added an encapsulateAll method for the bounds class

## 1.28.1

* `(FIXED)` Rectangles use more vectorized properties now for consistency across base shapes

## 1.28.0

* `(ADDED)` Edges use Vecs more consistently
* `(FIXED)` Easing expansion erased child attributes unintentionally
* `(FIXED)` DataBounds and Bounds are the same thing now

## 1.27.3

* `(FIXED)` Basic Camera Controller setBounds works correctly now for the vertical axis

## 1.27.2

* `(FIXED)` Layers now respond to their pick type changing by rebuilding the layer

## 1.27.1

* `(FIXED)` Mouse interactions now broadcast in the proper order, Out then Over then move
* `(FIXED)` Mouse interactions now properly broadcasts interactions for instances that are close to each other or overlapping
* `(FIXED)` Renderer options are now a part of the layer surface options

## 1.27.0

* `(ADDED)` Arcs have an offset for angle now. Makes animating rotations easier and makes it easier to set the orientation of angle 0.
* `(FIXED)` Improved precision issues with arcs

## 1.26.8

* `(FIXED)` Improved easy blending with circles

## 1.26.7

* `(FIXED)` Instances reactivate flag is now unset after reactivation
* `(FIXED)` Auto easing methods start at their end values upon reactivation. Thus preventing unintended initialized animations on reactivation

## 1.26.6

* `(FIXED)` Reactivating an instance (without removing and adding to a provider) now properly syncs all attributes upon reactivation. This ensures changes made while inactive are properly synced with the buffer after made active again.

## 1.26.5

* `(FIXED)` maxScale capabilities added back in for BOUND_MAX scale mode which allows for better controls to prevent a font from scaling up too much to keep it crisp.

## 1.26.4

* `(FIXED)` Anchors calculate their positions accurately now

## 1.26.3

* `(FIXED)` Layers can rebuild properly now
* `(FIXED)` Node edge demo added
* `(FIXED)` Added back scale modes for the labels
* `(FIXED)` Label anchors now properly position the label relative to its origin.
* `(FIXED)` Reduced overhead for readPixels by removing a frame buffer check
* `(FIXED)` Organized the font request code to make the requests easier to find as its own file

## 1.26.2

* `(FIXED)` Improved picking performance for many scenarios
* `(FIXED)` Label instance provider handling was missing some cases causing labels to not show up when needed.

## 1.26.1

* `(FIXED)` Easing calculation issues

## 1.26.0

* `(ADDED)` Font resources can now cache calculated kernings in localstorage to make viewing similar resources much faster.
* `(ADDED)` Label preloads can be made to warm up the kerning calculations without creating glyphs. Makes initial label viewing much smoother.

## 1.25.6

* `(FIXED)` Removed kerning calculations across labels causing not needed kerning support for characters that are unrelated. This makes it easier to warm up an environment to a set of labels before the labels are officially used.

## 1.25.4

* `(FIXED)` Labels onReady event was not firing when the label changed text and in other expected cases.
* `(FIXED)` Major issue, Source is too large, that caused a crash for a layer when using the font resource manager.
* `(FIXED)` Source is too large errors now provides some additional helpful feedback showing which attribute is receiving too large of a value.

## 1.25.3

* `(FIXED)` Key debug statements should log properly now
* `(FIXED)` Reduced GL context retrieval when producing a Surface

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
