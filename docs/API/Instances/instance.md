# Instance

Class Instanace implements IdentifiableById.

## Constructor(options: IInstanceOptions)

**options: IInstanceOptions**

* active: boolean

  (optional) Sets an initial active state of an instance

* id: string

  (optional) Sets the id of an instance

## Properties

**changes: { [key: number]: number }**

The property changes on the instance.

Default value is {}

**easingId: { [key: string]: number } | undefined**

This is a lookup that provides a means to retrieve the id of an easing type currently available to the instance.

This is populated when the instance becomes a part of a layer with easing attributes.

This property is to NOT be mutated except by the system

**observableStorage: any[]**

This is where observables store their data for the instance.

Default value is [].

**reactivate: boolean**

This is the flag indicating this instance was reactivated. When true, this performs a full update of all properties on the instance

Default value is false

## Methods

**get active()**

Gets active state

**set active(val: boolean)**

Sets the active state

**get observableDisposer(): () => void**

Retrieves a method for disposing the link between observables and observer.

**get observer(): InstanceProvider<this> | null**

Retrieves the observer of the observables

**set observer(val: InstanceProvider<this> | null)**

Applies an observer for changes to the observables.

**clearEasing()**

This clears any lingering easing information that may have been registered with the instance.

**get easing()**

Retrieves easing properties for the observables that are associated with easing.

**getEasing(attributeName: string): IEasingControl | undefined**

This attempts to get the easing object for this instance for a given attribute that it MIGHT be associated with.

When an instance is added to a layer and the layer has attributes with easing applied to them, the instance gains easing values for the attributes in the layer with applied easing.

Easing values can be accessed by requesting the attribute's "name" property value using this method.

There is NO WAY TO GUARANTEE this value is set or available, so this method WILL return undefined if you did not use the correct name, or no such value exists, or the layer decided to not make the attribute animateable.

Thus ALWAYS check the returned value to ensure it is defined before attempting to use it's results.

**get id()**

Get the applied id of this instance

**get uid()**

Get the auto generated ID of this instance

**resourceTrigger()**

This method is utilized internally to indicate when requested resources are ready. If you have a property that will be requesting a resource, you should implement this method to cause a trigger for the property to activate such that the property will update it's buffer.

There is no default behavior, subclasses must override and provide behavior.
