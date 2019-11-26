# Instances

Instances are the easiest of all the concepts in DeltaV!

They are essentially simple objects configured however you like!

```javascript
import { Instance, Vec2, Color } from 'deltav';

export class MyInstance extends Instance {
  center: Vec2 = [0, 0];
  radius: number = 5;
  color: Color = [0, 0.8, 1, 1];
}
```

But there IS ONE additional consideration. You want properties to UPDATE with `magic` and *wonder*!

So simply add 'observable' to the properties you care to have changed:

```javascript
import { Instance, Vec2, Color, observable } from 'deltav';

export class MyInstance extends Instance {
  @observable center: Vec2 = [0, 0];
  @observable radius: number = 5;
  @observable color: Color = [0, 0.8, 1, 1];
}
```

Now this makes it possible to see those changes reflected with ease in your Layer!

Also remember! Instances are all about YOU and what YOU want! Do whatever else you wish with your
instance:

```javascript
import { Instance, Vec2, Color, observable, subtract2, dot2 } from 'deltav';

export class MyInstance extends Instance {
  @observable center: Vec2 = [0, 0];
  @observable radius: number = 5;
  @observable color: Color = [0, 0.8, 1, 1];

  // Easy getter!
  get diameter() { return this.radius * 2; }

  // Snazzy hit check!
  hitTest(circle: MyInstance) {
    const d = subtract2(circle.center, this.center);
    const distSq = dot2(d, d);

    return distSq < (circle.radius * circle.radius + this.radius * this.radius);
  }
}
```

## InstanceProviders

You have probably seen these providers floating about in examples already. What are they? Well,
they're really a VERY simple concept that helps pipe information to our Layers. They're also very
simplistic internally and highly agnostic to what is done with them.

Internally, the layers know how to use them and can squeeze the info out of them and pipe hat info
where it needs to go.

But for all of us who could care less, the important part of instance providers is:

```javascript
const provider = new InstanceProvider<MyInstance>();

// Add stuff
provider.add(new MyInstance());
provider.add(new MyInstance());
const instance = provider.add(new MyInstance());

// Remove stuff
provider.remove(instance);

// Delete it ALL
provider.clear();
```

SUPER SIMPLE! DON'T OVER THINK IT! Add/remove is all you should know.

Keeping it simple in this case is SUPER powerful!

Let's look at how simple it is to make our instance work with react:

```javascript
import * as React from 'react';

interface IProps extends Partial<MyInstance> {
  // House your pipeline in a snazzy easy to pass around class
  graphics: MyGraphicsPipeline;
}

class Circle extends React.Component<IProps> {
  // We are a wrapper for this instance
  circle: MyInstance;

  componentWillMount() {
    // This circle is now a part of the pipeline
    this.props.graphics.providers.circles.add(this.circle);
  }

  componentWillUpdate(nextProps) {
    // Apply the changes to the instance. You can improve performance by only applying properties
    // that actually changed
    this.circle.radius = nextProps.radius;
    this.circle.center = nextProps.center;
    this.circle.color = nextProps.color;
  }

  componentWillUnmount() {
    // This circle is now removed from the pipeline
    this.props.graphics.providers.circles.remove(this.props.circle);
  }

  render() {
    // You don't HAVE to return anything unless you want to place debugging info in the HTML doc
    return null;
  }
}
```

Boom. You just created a React wrapper around your Instance, if you want that sort of thing.
