# InstanceProvider<T extends Instance>

InstanceProvider implements IInstancePrivider

## Constructor(instances: T[])

Can be constructed by an arroy of instances or an empty provider will be constructed. 

**instances:T[]**

(optional) An array of instances

## Properties

**resolveContext: string**

This indicates the context this provider was handled within. Currently, only one context is allowed per provider, so we use this to detect when multiple contexts have attempted use of this provider.

Default value is an empty string

## Methods

**get changeList(): InstanceDiff<T>[]**

Retrieve all of the changes applied to instances

**add(instance: T)**

Adds an instance to the provider which will stream observable changes of the instance to the framework

**clear()**

Removes all instances from this provider

**destroy()**

Clear all resources held by this provider. It IS valid to lose reference to all instances and to this object, which would effectively cause this object to get GC'ed. But if you desire to hang onto the instance objects, then this should be called.
   
**instanceUpdated(instance: T)**

This is called from observables to indicate it's parent has been updated.

This is what an instance calls when it's observable property is modified.
   
**remove(instance: T)**

Stops the instance's ability to register changes with this provider and flags a final removal diff change

**resolve(context: string)**

Flagged all changes as dealt with

**sync()**

This performs an operation that forces all of the instances to be flagged as an'add' change. This allows a layer listening to this provider to ensure it has added all currently existing instances monitored by the provider.

NOTE: This is a VERY poor performing method and should probably be used by the framework and not manually.
  