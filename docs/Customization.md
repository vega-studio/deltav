# Customization

## Custom Instances

Customers can create a new instance by simply extending [instance](Instances/Instance.md). When creating the new instance, customer can add decorator @observable which intends for single properties on Instances only. It will facilitate automatic updates and stream the updates through an InstanceProvider to properly update the Instances values in the appropriate and corresponding buffers that will get committed to the GPU

## Custom Layers

Customers can create a new layer by extending [Layer2D] or [Layer]. Customers should choose their own ways to initShaders, write their own shaders and set materialOptions.

When initing shaders, an [IShaderInitialization<Instance>] interface should be returned from initShader() method and then the required properties will be injected into custom shaders. This requires customers to do the following steps:

* Specify the shader source
* Specify [drawMode], it includes six modes: LINE_LOOP, LINE_STRIP, LINES, POINTS, TRIANGLE_FAN,TRIANGLE_STRIP, TRIANGLES
* Specify vertexCount
* Inject [instanceAttributes]
* Inject [vertexAttributes]
* Set the [uniforms]
* Set special attribute expansion

Setting materialOptions uses the method getMaterialOptions of layer, and ILayerMaterialOptions interface should be returned.

## Shaders

Customized shaders should be binded in initShader method when creating customized layers. Two types of shaders are supported: vertex shader and fragment shader.
When creating customized shaders, there are several in-built shader modules can be applied. These modules include constants and methods. Modules can be easily imported using id:

```
${import: module1, module2, module3}
```

After a module is imported, methods and constants in the module can be used directly in customized shaders.
Here are a list of available modules:

### shaderTemplate

A shader can also be created by function shaderTemplate, it could help to combine different actions with base shader together to be a new shader.

**shaderTemplate(templateOptions: IShaderTemplateOptions): IShaderTemplateResults**

This is a method that aids in making shaders a bit more dynamic with simple string replacement based on tokens written into the shader. Tokens in the shader will appear as ${token} and will either be ignored by this method and thus removed or will be replaced with a provided value. This method will give feedback on the replacements taking place and simplify the process of detecting errors within the process.

Parameters - templateOptions : IShaderTemplateOptions:

* options : {[key: string]: string} - (required) This is a key value pair the template uses to match tokens found to replacement values
* required : IShaderTemplateRequirements - (optional) This is used to indicate which tokens are required both within the shader AND within the 'options'.

  * Interface IShaderTemplateRequirements:

    * name : string - A string identifier to make it easier to identify which shader template failed requirements

    * values : string[] - The options that must be present within both provided options AND within the template

* shader : string - (required) This is the shader written with templating information
* onError(msg: string): void - (optional) Callback for 'required' errors being emitted
* onToken(token: string, replace: string): string - (optional) Callback that allows overrides for token replacement. Provides the token found and the suggested replacement for it
* onMain(body: string | null): string | { main: string; header: string } - (optional) If this is provided, the shader templater will search out the void main method of the shader and provide the body contents of that main() method. You can edit those body contents and return the edited value to replace the body with those contents.

  If the body in the callback is null, then that means a main() method could NOT be determined.

Returns - Interface IShaderTemplateResults:

* shader: string - This is the resulting shader string generated from the templating
* shaderProvidedOptions: Map<string, number> - This is the template options provided by the shader {option: num occurrences}
* unresolvedShaderOptions: Map<string, number> - This is the template options provided by the shader that were not resolved by the options parameter {option: num occurrences}
* unresolvedProvidedOptions: Map<string, number> - This is the options provided to the template that did not get resolved by the shader {option: 1}
* resolvedShaderOptions: Map<string, number> - This is the list of options that DID get resolved by the options provided {option: num occurrences}

### Base Modules

Method baseShaderModules in layer class establishes basic modules required by the layer for the shaders. At it's core functionality, it will support the basic properties a layer has to provide, such as Picking modes

**baseShaderModules(shaderIO: IShaderInitialization): {fs: string[]; vs: string[]}**

Parameters:

* shaderIO: IShaderInitialization
  * drawMode : GLSettings.Model.DrawMode - (optional) Specifies how the vertices are laid out in the model. This defaults to Triangle Strip if not specified
  * vertexAttributes: (IVertexAttribute | null)[] - (optional) These are attributes that should be static on a vertex. These are considered unique per vertex.
  * instanceAttributes: (IInstanceAttribute<T> | null)[] - (optional) These are very frequently changing attributes and are uniform across all vertices in the model
  * vertexCount: number - (required) Specify how many vertices there are per instance. If vertex count is 0, then the layer will render without instancing and draw the buffers straight.
  * uniforms: (IUniform | null)[] - (optional) These are uniforms in the shader. These are uniform across all vertices and all instances for this layer.
  * fs: string - (required) fragment shader
  * vs: string - (required) vertex shader

Returns:

* {fs: string[]; vs: string[]} - An object with a list of vertex shaders and a list of fragment shaders
