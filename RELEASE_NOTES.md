# Release Notes

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

