# Customization

## Custom Instances

Customers can create a new instance by simply extending [instance](Instances/Instance.md). When creating the new instance, customer can add decorator @observable which intends for single properties on Instances only. It will facilitate automatic updates and stream the updates through an InstanceProvider to properly update the Instances values in the appropriate and corresponding buffers that will get committed to the GPU

## Custom Layers

Customers can create a new layer by extending [Layer2D] or [Layer]. Customers should choose their own ways to initShaders, write their own shaders and set materialOptions.

When initing shaders, an [IShaderInitialization<Instance>] interface should be returned from initShader() method and then the required prperties will be injected into custom shaders. This requires customers to do the following steps:

* Specify the shader source
* Specify [drawMode], it includes six modes: LINE_LOOP, LINE_STRIP, LINES, POINTS, TRIANGLE_FAN,TRIANGLE_STRIP, TRIANGLES
* Specify vertexCount
* Inject [instanceAttributes]
* Inject [vertexAttributes]
* Set the [uniforms]
* Set special attribtue expansion

Setting materialOptions uses the method getMaterialOptions of layer, and ILayerMaterialOptions interface should be returned.

## Shaders

Customized shaders should be binded in initShader method when creating customized layers. Two types of shaders are supported: vertex shader and fragment shader.
When creating customized shaders, there are several in-built shader modules can be applied. These modules include constants and methods. Modules can be easily imported using id:

```
${import: module1, module2, module3}
```

After a module is imported, methods and contants in the module can be used directly in customized shaders.
Here are a list of available modules:

### shaderTemplate

A shader can also be created by method [shaderTemplate], it could help to combine different actions with base shader together to be a new shader.

### base modules

BaseShaderModules will help to form the basic shader that can be modified later. Base shader will be determined by PickType and easing method.
