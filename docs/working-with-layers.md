# Layers

Layers are a deep deeeep deeeeeeeeeeep rabbit hole. Why? Because they can hand
the world to you on a silver platter. Put your time into layers, and you'll
receive that time back with high rewards.

That being said, Layers do a LOT to make `your life` easy! And that's important
because `your life` can sometimes be hard and we all need a hug or a good
framework at times to help us smile when we're down.

So, let's look at some highlights on what layers will do:

- Inject attributes, and uniforms into a shader
- Set up material expectations
- Set up the expected geometry for each instance that should be rendered
- Divvy up tasks to child layers
- Establish base modules a shader should be provided with
- Establish Attribute modifiers, properties, and settings

Sounds like a mouthful. Sounds scary. Sounds like `your life` isn't going to be
easier :(

Well, let's take a look and wipe away each of those fears!

---

## Props!

We have to pass configuration to our layer somehow, and we should specify what
configuration our layer expects. How do we do this? Props!

Props are passed to the layer when you use `createLayer`. For those of you who
use React, `createLayer` will feel very familiar to the React `createElement`.

```javascript
createLayer(MyLayer, { ...props });
```

For those who are using the React Surface wrapper:

```javascript
<LayerJSX type={MyLayer} config={...props} />
```

In our layer we specify which props our layer expects. Here it should also be
noted: a layer has to be configured to expect a certain type of instance data to
render. In this case, our example layer will be expecting 'MyInstance' style
objects in its data provider.

```javascript
import { Layer2D, ILayer2DProps, InstanceProvider } from 'deltav';
import { MyInstance } from "./my-instance.ts";

class IProps extends ILayer2DProps<MyInstance> {
  aProp: number;
}

export class MyLayer extends Layer2D<MyInstance, IProps> {

}
```

Next we configure the default values of the props for the layer:

```javascript
import { Layer2D, ILayer2DProps, InstanceProvider } from 'deltav';
import { MyInstance } from "./my-instance.ts";

class IProps extends ILayer2DProps<MyInstance> {
  aProp: number;
}

export class MyLayer extends Layer2D<MyInstance, IProps> {
  // The class property 'defaultProps' is used to populate the default values
  // of our props
  static defaultProps: IProps = {
    // Key and data are inherited REQUIRED props from the base Layer class
    key: "",
    data: new InstanceProvider<MyInstance>(),
    aProp: 100,
  };
}
```

At this point, we now have properties available that can be accessed in the
layer via:

```javascript
this.props.aProp; // Yay!
```

### Inheritable layers

The pattern for writing a layer that can be extended in the future should be
written with generics:

```javascript
import { Layer2D, ILayer2DProps, InstanceProvider } from 'deltav';
import { MyInstance } from "./my-instance.ts";

class IProps<T extends MyInstance> extends ILayer2DProps<T> {
  aProp: number;
}

// T and U extend the expected properties which will let us write future layers
// that extends this layer and it's property expectation.
export class MyLayer<TInstance extends MyInstance, TProps extends IProps> extends Layer2D<TInstance, TProps> {
  static defaultProps: IProps = {
    key: "",
    data: new InstanceProvider<MyInstance>(),
    aProp: 100,
  };
}
```

---

## Attributes!

Layers are ALL about attributes and wiring up our data to be pumped into those
attributes!

We know we have shaders to run code on the GPU. We know we want to play around
with all that raw power! We know last time we looked at OpenGL we almost cried
trying to make a pipeline to make that game we always wanted to make but never
could because we wrote that 30k line rendering engine that we didn't comment...
at all...

So! Let's make it easy!

We first start with the all important `initShader` method!

```javascript
import { Layer2D, ILayer2DProps, InstanceProvider, IShaderInitialization } from 'deltav';
import { MyInstance } from "./my-instance.ts";

class IProps<T extends MyInstance> extends ILayer2DProps<T> {
  aProp: number;
}

export class MyLayer<T extends MyInstance, U extends IProps> extends Layer2D<T, U> {
  static defaultProps: IProps = {
    key: "",
    data: new InstanceProvider<MyInstance>(),
    aProp: 100,
  };

  // Override this method to begin making our shader configuration!
  initShader(): IShaderInitialization<MyInstance> {
    return {};
  }
}
```

This method returns several important properties. Read the following carefully
to get acquainted:

```javascript
function initShader(): IShaderInitialization<MyInstance> {
  return {
    // This is the broadest modifier: these are attributes that can change for
    // everything in the layer
    uniforms: [],
    // These are properties that are the same across every instance, but are
    // available per vertex rendered of the instance.
    vertexAttributes: [],
    // These are the most granular properties: attributes that can change
    // for a single Instance
    instanceAttributes: [],
    // This is the number of expected vertices the geometry will contain
    // (per instance)
    vertexCount: number,
    // This is the string content of the vertex shader
    vs: string,
    // This is the string content of the fragment shader
    fs: string,
    // This is how our vertices are to be drawn
    // (triangles, triangles trip, lines, points, etc) You can look into WebGL
    // draw modes for more information
    drawMode: GLSettings.Model.DrawMode;
  };
}
```

With all of that information your layer will be ready to start rendering! Again,
looks intimidating, but let's take it to the next step to see what deltav will
do for you within this config and you will begin to see how easy it is to glue
your data to the gpu:

```javascript
import { Layer2D, ILayer2DProps, InstanceProvider, IShaderInitialization, GLSettings } from 'deltav';
import { MyInstance } from "./my-instance.ts";

class IProps<T extends MyInstance> extends ILayer2DProps<T> {
  aProp: number;
  opacity?(): number;
}

export class MyLayer<T extends MyInstance, U extends IProps> extends Layer2D<T, U> {
  static defaultProps: IProps = {
    key: "",
    data: new InstanceProvider<MyInstance>(),
    aProp: 100,
  };

  // Override this method to begin making our shader configuration!
  initShader(): IShaderInitialization<MyInstance> {
    const { opacity = () => 1 } = this.props;

    // Make some vertex information to essentially declare a 'quad'
    // (two triangles that make a square)
    const vertexToNormal: { [key: number]: number } = {
      0: 1,
      1: 1,
      2: -1,
      3: 1,
      4: -1,
      5: -1
    };

    // More information for our 'quad'
    const vertexToSide: { [key: number]: number } = {
      0: -1,
      1: -1,
      2: -1,
      3: 1,
      4: 1,
      5: 1
    };

    return {
      // We'll pack in our vertices as a triangle strip
      drawMode: GLSettings.Model.DrawMode.TRIANGLES,
      // How many vertices will our mesh use? Our quad will be two triangles:
      // 6 vertices
      vertexCount: 6,

      // Make our vertex attributes to push to our shader. This data is ONLY
      // available in the vertex shader. (use varying values to pass to
      // fragment)
      vertexAttributes: [
        {
          // Name the atttribute the shader will use
          name: "normals",
          // Declare how many floats (numbers) the attribute will represent
          size: VertexAttributeSize.TWO,

          // Make a callback method that will request the data for the vertex at
          // a given index
          update: (vertex: number) => [
            // Normal
            vertexToNormal[vertex],
            // The side of the quad
            vertexToSide[vertex]
          ]
        }
      ],

      // Now that we have vertex geometry established, we set up our
      // instance information. This data is ONLY available in the Vertex Shader.
      // (Use varying values to pass to the fragment shader)
      instanceAttributes: [
        // An attribute for specifying the center of a circle
        {
          // Name as it will appear in our shader
          name: 'center',
          // The number of floats it will represent
          size: InstanceAttributeSize.TWO,
          // Our updates operate very simply:
          // update: instance => [values to send to the  GPU]
          // So in this case, we just retrieve our circle's center value.
          // If you look at the instances.md doc you'll see the 'center'
          // property is observable! Simply retrieving
          // the observable here will automatically wire up this property
          // with updating to the GPU!
          update: circle => circle.center
        },

        // An attribute for specifying the radius of a circle
        {
          name: 'radius',
          size: InstanceAttributeSize.ONE,
          update: circle => [circle.radius]
        },

        // An attribute for specifying the color of a circle
        {
          name: 'color',
          size: InstanceAttributeSize.FOUR,
          update: circle => circle.color
        }
      ],

      // Now uniforms! Often this is where you can put layer properties,
      // things like global alpha levels or global panning levels etc etc.
      uniforms: [
        {
          // Name as it will appear in our shader
          name: "layerOpacity",
          // How many floats it consumes
          size: UniformSize.ONE,
          // Uniforms can appear in the vertex shader, the fragment shader or
          // BOTH. We specify which ones we want it in here.
          shaderInjection: ShaderInjectionTarget.ALL,
          update: (_uniform: IUniform) => [opacity()]
        }
      ],

      // Now for the MAGIC! Let's make our vertex shader! Note: you should
      // probably put this in a .vs file so you can get better syntax
      // highlighting
      vs: `
        precision highp float;

        // No need to declare our input attributes!

        // Let's set up some values we want to send to the fragment shader!
        varying vec4 vertexColor;
        varying float edgeSharpness;
        varying float edgeSharpnessBase;
        varying vec2 pointCoord;

        // The entry method of our shader program
        void main() {
          // What's THIS? color is useable?! deltav *Magic*
          vertexColor = color;

          // layerOpacity can be used...as if by *MAGIC*
          vertexColor.a *= layerOpacity;

          // pixelRatio?! We didn't even declare that anywhere?! This comes
          // from the base modules that Layer2D provides.
          float size = radius * pixelRatio;

          // Fancy Shader math
          edgeSharpness = mix(
            0.8, 0.0, min((size * 6.0 * pixelRatio) / (45.0 * pixelRatio), 1.0)
          );
          edgeSharpnessBase = mix(
            0.1, 0.0, min((size * 6.0 * pixelRatio) / (45.0 * pixelRatio), 1.0)
          );
          pointCoord = (normals.xy + vec2(1.0, 1.0)) / 2.0;

          // Center within clip space
          vec4 clipCenter = clipSpace(vec3(center, depth));
          // Center in screen space
          vec2 screenCenter = (clipCenter.xy + vec2(1.0, 1.0)) * vec2(0.5, 0.5) * viewSize;
          // Position in screen space
          vec2 vertex = (normals.xy * size) + screenCenter;
          // Position back to clip space
          gl_Position = vec4((vertex / viewSize) * vec2(2.0, 2.0) - vec2(1.0, 1.0), clipCenter.zw);
        }
      `,

      // Now for MORE MAGIC! Let's make our fragment shader! Note: you should
      // probably put this in a .fs file so you can get better syntax
      // highlighting
      fs: `
        precision highp float;

        // Match our varying input with the vertex shader varying output
        varying vec4 vertexColor;
        varying float edgeSharpness;
        varying float edgeSharpnessBase;
        varying vec2 pointCoord;

        float circle(vec2 coord, float radius){
          vec2 dist = coord - vec2(0.5);

          return 1.0 - smoothstep(
            radius - (radius * edgeSharpness),
            radius + (radius * edgeSharpnessBase),
            dot(dist, dist) * 4.0
          );
        }

        void main() {
          float step_factor = circle(pointCoord, 1.0);

          // Output our fragment to the "color" buffer output
          $\{out: color} = (mix(
            vec4(0.0, 0.0, 0.0, 0.0),
            vertexColor,
            step_factor
          ));

          // We can use our "color" output as a variable now.
          if (color.a <= 0.0) discard;
        }
      `
    };
  }
}
```

-Breathes deep-

So _hopefully_ reading the break down gives you a really good
feel for how to make a custom Layer!

There's a LOT to pull apart for the shader itself, so we made an entire article
breaking it down for you!

[The Shader](./the-shader.md)

My only warning this early: DO NOT ACCESS ATTRIBUTES OUTSIDE OF `void main()`.
Always pass _Magic_ auto generated properties via parameters to other methods.
They are only scoped to `main()` for many many complex reasons. Suffer you will,
if do this you must.

---

## Material Settings

Another bit of Layer specific items is setting GLSettings for the layer. This
gives you some granular control over the GL system.

For understanding what is what in this part I suggest you dig into the source
files of GLSettings. There are MANY specific comments that gives you URLs to
give detailed specifications in GL on what they do.

```javascript
import { Layer2D, ILayer2DProps, InstanceProvider, IShaderInitialization, GLSettings } from 'deltav';
import { MyInstance } from "./my-instance.ts";

class IProps<T extends MyInstance> extends ILayer2DProps<T> {
  aProp: number;
  opacity?(): number;
}

export class MyLayer<T extends MyInstance, U extends IProps> extends Layer2D<T, U> {
  static defaultProps: IProps = {
    key: "",
    data: new InstanceProvider<MyInstance>(),
    aProp: 100,
  };

  initShader(): IShaderInitialization<MyInstance> {
    return { ... }
  }

  // Override this method to specify the material options this layer will
  // set while rendering.
  getMaterialOptions(): ILayerMaterialOptions {
    // We have some handy presets for you so you don't have to immediately
    // get overwhelemed.
    return CommonMaterialOptions.transparentShapeBlending;
  }
}
```

## Child Layers

Child layers can add some phenomenal cosmic powers to your pipeline. They are a
bit complicated and involved, so will not be documented yet. If you want to see
examples of this functionality, you can check out the text-area-layer and
image-layer. Both implement the:

```javascript
class Mylayer {
  childLayers(): LayerInitializer[] {
    return [];
  }
}
```

And show you how to handle piping data from the provider to them. With child
layers, you can get complete resource management strategies that hides any
complexity from the Instance or use of the layer.

For instance, ImageLayer takes in the instances and makes resource requests for
the images to be loaded into an atlas. The layer also monitors the instances
added and removed and will invalidate and clean out images no longer requested.

It's SUPER powerful behavior and can make an entire rendering pipeline be pure
magic if you put the time into it.
