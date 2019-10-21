# Customization

## Custom Instances

    Customers can create a new instance by simply extending [instance](Instances/Instance.md). When creating the new instance, customer can add decorator @observable which intends for single properties on Instances only. It will facilitate automatic updates and stream the updates through an InstanceProvider to properly update the Instances values in the appropriate and corresponding buffers that will get committed to the GPU

## Custom Layers

    Customers can create a new layer by extending [Layer2D] or [Layer]. Customers should choose their own ways to initShaders, write their own shaders and set materialOptions.

    When initing shaders, an IShaderInitialization<Instance> interface will be returned and then the required prperties will be injected into custom shader.  This requires customers to do the following steps:
    * Specify the shader source
    * Specify drawMode, it includes six modes: LINE_LOOP, LINE_STRIP, LINES, POINTS, TRIANGLE_FAN,TRIANGLE_STRIP, TRIANGLES
    * inject instanceAttributes
    * inject vertex attributes
    * set the uniforms
    * set attribtue expansion

    Setting materialOptions uses the method getMaterialOptions, and ILayerMaterialOptions interface should be returned.

## Shaders
