# Instance3D

Instance3D extends from [Instance].

## Constructor(options: IInstance3DOptions)

**options: IInstance3DOptions**

IInstance3DOptions extends IInstanceOptions.

* transform: Transform

  (required) The transform object that will manage this instance.

## Methods

**get transform()**

**set transform(val: Transform)**

Gets and sets the 3D transform that will place this object within the 3D world

**get position()**

World position of the Instance.

Default value of position is [0 ,0 ,0]

**get rotation()**

Rotation of the Instance, represented as a quaternion.

Default value of rotation is [1, 0, 0, 0]

**get scale()**

Scale of the Instance

Default value is [1, 1, 1]
