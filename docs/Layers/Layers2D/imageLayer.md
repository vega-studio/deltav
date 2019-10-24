# ImageLayer

## Props

IImageLayerProps extends from IImageRenderLayerProps, here is the list of IImageRenderLayerProps.

**animate: {<br>&emsp;&emsp;tint: IAutoEasingMethod<Vec>;<br>&emsp;&emsp;location: IAutoEasingMethod<Vec>;<br>&emsp;&emsp;size: IAutoEasingMethod<Vec>;<br>}**

(optional for animate and its all elements)

The properties to animate for the image.

**atlas: string**

(optional) The id of the atlas to load resources into

**rasterizationScale: number**

(optional) This is the scale resources for the images will be loaded into the atlas. A value of 0.5 will cause images to load at 50% their source size to the atlas.

# ImageInstance

## Constructor (options: IImageInstanceOptions)

**options: IImageInstanceOptions**

* anchor: Anchor

  (optional) The point on the image which will be placed in world space via the x, y coords. This is also the point which the image will be scaled around.

* depth: number

  (optional) Depth sorting of the image (or the z value of the image)

* source: ImageInstanceResource

  (required) This is the HTMLImageElement that the image is to render. This element MUST be loaded completely before this instance is created.

  ImageInstanceResource can be string, ImageBitMap, ImageData, HTMLImageElement, HTMLCanvasElement or ImageVideoResource

* height: number

  (optional) The height of the image as it is to be rendered in world space

* width: number

  (optional) The width of the image as it is to be rendered in world space

* origin: Vec2

  (optional) The coordinate where the image will be anchored to in world space

* scaling: ScaleMode

  (optional) Sets the way the image scales with the world

* tint: [number, number, number, number]

  (required) The color the image should render as

* onError(): void

  (optional) Triggered when it's detected that the image will never render correctly

* onReady(image: ImageInstance, video?: HTMLVideoElement): void

  (optional) Triggered when the image has fully loaded it's resources

## Properties

**tint: [number, number, number, number]**

This is the rendered color of the image

Default value is [0, 0, 0, 1]

**depth: number**

Depth sorting of the image (or the z value of the image)

Default value is 0

**height: number**

The height of the image as it is to be rendered in world space. After onReady: this is immediately populated with the width and height of the image as it appears in the atlas.

Default value is 1

**origin: Vec2**

The coordinate where the image will be located in world space.

Default value is [0, 0]

**scaling: ScaleMode**

Sets the way the image scales with the world.

Default value is ScaleMode.BOUND_MAX

**source: ImageInstanceResource**

This is where the source of the image will come from

**width: number**

The width of the image as it is to be rendered in world space. After onReady: this is immediately populated with the width and height of the image as it appears in the atlas.

Default value is 1.

**onError?: IImageInstanceOptions["onError"]**

Event called when there is an error attempting to load and render the image

**onReady?: IImageInstanceOptions["onReady"]**

Event called when the instance has it's resource loaded and ready for use

**request?: IAtlasResourceRequest**

This is the request generated for the instance to retrieve the correct resource

**sourceWidth: number**

After onReady: This is populated with the width of the source image loaded into the Atlas

Default value is 0

**sourceHeight: number**

After onReady: This is populated with the height of the source image loaded into the Atlas

Default value is 0

## Metheds

**get maxSize()**

Returns the max value between width and height

**set maxSize(value: number)**

Sets the maxSize to height and resize width while keeping the aspect of width to height

**get anchor()**

Returns anchor of image

**setAnchor(anchor: Anchor)**

Applies a new anchor to this image and properly determines its anchor position on the image

**resourceTrigger()**

Triggered after the request bas been completed
