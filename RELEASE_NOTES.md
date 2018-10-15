# Release Notes

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

