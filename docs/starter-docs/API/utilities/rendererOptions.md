/** Sets some options for the renderer which deals with top level settings that can only be set when the context is retrieved \*/
rendererOptions?: {
/**
_ This indicates the back buffer for the webgl context will have an alpha channel. This affects performance some, but is mainly
_ for the DOM compositing the canvas with the other DOM elements.
_/
alpha?: boolean;
/\*\* Hardware anti-aliasing. Disabled by default. Enabled makes things prettier but slower. _/
antialias?: boolean;
/**
_ This tells the browser what to expect from the colors rendered into the canvas. This will affect how compositing
_ the canvas with the rest of the DOM will be accomplished. This should match the color values being written to
_ the final FBO target (render target null). If incorrect, bizarre color blending with the DOM can occur.
_/
premultipliedAlpha?: boolean;
/**
_ This sets what the browser will do with the target frame buffer object after it's done using it for compositing.
_ If you wish to take a snap shot of the canvas being rendered into, this must be true. This has the potential
_ to hurt performance, thus it is disabled by default.
_/
preserveDrawingBuffer?: boolean;
};
