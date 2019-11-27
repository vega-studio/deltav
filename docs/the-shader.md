# The Shader

-Strike up ominous dungeon music-

You are now within the inner lair of the GPU. You have come far, you must now explore the depths
of an entire different programming language buried beneath the seemingly happy exterior of
javascript.

This can be a tough layer to master, but again DeltaV is here to help you be a happy individual.

Make sure you understand [The Layer](./working-with-layers) FIRST!

ALSO: before you dig, I HIGHLY recommend you learn about shaders in general. Look up shaders for the
ES 2.0 standard for now. We're working on upgrading to the ES 3.0 features soon.

---

## Bundling a shader

It is HIGHLY recommended to write your shaders into separate shader files. One as a vertex shader
and one as a fragment shader. We prefer to use .vs and .fs extensions for these files. It's clean
and easy. You can use whatever extension you want depending on your bundler.

You need to then have a way for your bundler to inject those files as plain text into your
application.

If you are using parcel: you can checkout my personal plugin:

```sh
npm install -DE github:diniden/parcel-plugin-shader-compression
```

Which does some nice things like removing whitespace and comments for production builds.

I also recommend you be using the IDE Visual Studio Code and get the glsl plugin for it to give some
nice syntax highlighting.

## Writing a Shader

So now that you have a pipeline for writing and bundling your shader. We can now add the shader to
the project super easy (See [The Layer](./working-with-layers) to get more details on this):

```javascript
export class MyLayer<T extends MyInstance, U extends IProps> extends Layer2D<T, U> {
  static defaultProps: IProps = {
    key: "",
    data: new InstanceProvider<MyInstance>(),
    aProp: 100,
  };

  initShader(): IShaderInitialization<MyInstance> {
    return {
      ...,
      // Just require your stuff in!
      fs: require('./MyLayer.fs'),
      vs: require('./MyLayer.vs'),
    };
  }
}
```

With that getting you rolling in a happier direction let's look at the example provided in
[The Layer](./working-with-layers) to get a breakdown what is happening.

```glsl
precision highp float;

// No need to declare our input attributes!

varying vec4 vertexColor;
varying float edgeSharpness;
varying float edgeSharpnessBase;
varying vec2 pointCoord;

void main() {
  vertexColor = color; // <- What's THIS? color is useable?!
  vertexColor.a *= layerOpacity;
  float size = radius * pixelRatio;

  edgeSharpness = mix(
    0.8, 0.0, min((size * 6.0 * pixelRatio) / (45.0 * pixelRatio), 1.0)
  );
  edgeSharpnessBase = mix(
    0.1, 0.0, min((size * 6.0 * pixelRatio) / (45.0 * pixelRatio), 1.0)
  );
  pointCoord = (normals.xy + vec2(1.0, 1.0)) / 2.0;

  vec4 clipCenter = clipSpace(vec3(center, depth));
  vec2 screenCenter = (clipCenter.xy + vec2(1.0, 1.0)) * vec2(0.5, 0.5) * viewSize;
  vec2 vertex = (normals.xy * size) + screenCenter;
  gl_Position = vec4((vertex / viewSize) * vec2(2.0, 2.0) - vec2(1.0, 1.0), clipCenter.zw);
}
```

The EASY part of this is: ALL ATTTRIBUTTES / UNIFORMS declared with a 'name' property are by default
ready and available in the `void main()` method of your `vertex shader`.

DO NOT ACCESS ATTRIBUTE NAMES OUTSIDE OF THE `void main()` METHOD! If you need them elsewhere, hand
them down as parameters to methods. There are a HOST of deep secrets as to why this is so. Your life
will be much better following this rule.

The next part of this is understanding `Shader Modules`!

---

## Shader Modules

What?! Modules?! For my shader?!

Yes! DeltaV provides a means to generate modules for shaders! Modularizing your shader development
prevents redundant code in your project thus making your program smaller, AND it makes your shaders
easier to understand.

### Importing a shader module

To use a shader module in your shader you simply use some template syntax custom to DeltaV:

```glsl
// Import the hsv module!
${import: hsv}

void main() {
  // We now have the hsv module methods available in our shader!
  hsv2rgb(...);
  rgb2hsv(...);
}
```

Shader modules inject themselves in correct dependency order to the TOP of your shader. Modules
NEVER INLINE themselves.

### Declaring a shader module

Making your own shader module has two parts:

- Write the methods the shader will provide.
- Write the ShaderModule registration

So first write some shader module methods. If the module is intended for vertex and fragment shaders
I recommend using the .vs extension and if it's for only fragment shaders using the .fs extension.

custom-module.vs
```glsl
vec3 add3(vec3 l, vec3 r) {
  return l + r;
}
```

Next we register the module. I recommend shader registration modules use `*.shader.ts` as the
extension. This extension will be used for the dev process to add in intellisense for the glsl
in vscode in the future.

my-module.shader.ts
```javascript
import { ShaderInjectionTarget, ShaderModule } from "deltav";

/**
 * This module provides an add method for shaders
 */
ShaderModule.register({
  // This is the identifier used in the ${import: <id>} statement
  moduleId: "customModule",
  // This is the content for the module
  content: require("./custom-module.vs")
  // This tells which shader types this module is compatible with
  compatibility: ShaderInjectionTarget.ALL
});
```

Last, make sure your .shader.ts file is imported somewhere to have it inlcuded in the project. This
part is up to you.

```javascript
import './my-module.shader.ts';
```

Now that we have made a module and registered the module, we can use the module in our own shaders:

```glsl
// Use the moduleId you registered the module with
${import: customModule}

void main() {
  add3(vec3(1., 1., 1.), vec3(2., 2., 2.));
}
```

## Shader Module Attribute Injection

If you inject elements into the shader, it is VERY common for your shader to suddenly require certain
uniform, or instance attribute input, or may be even vertex attribute input.

Thus! Our Shader modules can actually modify those attributes for you!

my-module.shader.ts
```javascript
import { ShaderInjectionTarget, ShaderModule } from "deltav";

ShaderModule.register({
  moduleId: "customModule",
  content: require("./custom-module.vs")
  compatibility: ShaderInjectionTarget.ALL,

  // Add a uniform to the layer who's shader require's this module
  uniforms: [
    // This injects the projection matrix from the view camera as a uniform
    // into the Layer's pipeline (Gasps)
    {
      name: "projection",
      size: UniformSize.MATRIX4,
      update: () => layer.view.props.camera.projection
    }
  ]
});
```

I highly recommend you take a look at `world-2d.shader.ts` to see the level of awesome you are
dealing with.

## Module Import Rules

This is super easy!

```glsl
${import: hsv, customModule, PI, PI_2}
```

OR

```glsl
${import: hsv}
${import: customModule}
${import: PI}
${import: PI_2}
```

and imports can happen anywhere but WILL not affect how the code is injected:

```glsl
${import: hsv}
${import: customModule}
void main () {
  ${import: thisIsABadIdeaButWorks}
}
${import: PI}
${import: PI_2}
```

Also modules can depend on modules making a dependency chain. Modules imported multiple time from
various modules is fine too as it will resolve to the module being injected once. The only disallowed
set up is circular dependencies. An error WILL be thrown in those cases.

```glsl
// This is totally cool: you'll see the hsv module only once in your
// generated shader.
${import: hsv}
${import: hsv}
${import: hsv}
${import: hsv}
```

---

## Existing Modules!

Simply search the DeltaV source code for .shader.ts files and you will see all available modules!
Some have super useful methods, and there are a lot of constants already available to you!

## Base Modules

Now for the last bit of magic with your shader. Base Modules! These are modules your Layer
automatically assumes your shader will need to do it's basic tasks!

Let's take a look at layer-2d.ts to see what basics it provides!

```typescript
export class Layer2D<
  TInstance extends Instance,
  UProps extends ILayer2DProps<TInstance>
> extends Layer<TInstance, UProps> {
  /**
   * Force the world2D methods as the base methods
   */
  baseShaderModules(shaderIO: IShaderInitialization<TInstance>) {
    const modules = super.baseShaderModules(shaderIO);
    modules.vs.push("world2D");

    return modules;
  }
}
```

We see it force injects "world2D" into our shaders. So this is the same as writing:

```glsl
${import: world2D}
```

In our shader. With the base modules, that is not required. We can assume a Layer2D will always
have the world2D methods available in the shader without writing the import!

`VERY POWERFUL, but creates MUCH responsibility` code safely :)
