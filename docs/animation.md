# Animation

Animation is the fun stuff! DeltaV SHINES like a bright morning star in this area. What was impossible
or laggy with your normal puny HTML standards is now a breeze with your deeply integrated animation
system that is provided for you right out of the box.

## Existing Animations

First, let's look at animations already provided for you! Your basic shape layers follow a pattern
to expose animation controls easily for you. Let's look at our common CircleLayer as our example:

```typescript
import { CircleLayer, AutoEasingMethod } from 'deltav';

createLayer(CircleLayer, {
  animate: {
    center: AutoEasingMethod.easinInOutCubic(1000, 0)
  },
  data,
});
```

It is the common pattern for specifying which properties you want to animate in a deltav layer by
providing an `animate` property for the `Layer`. Each property in the animate will correlate to a
property in the Instance it manages.

When you set up an animated property, simply change an instance property value to have it animate
from it's current value to the next! You don't even have to wait for the animation to complete
to change the value and see it move from it's mid animation value to the next!

```typescript
const circle = new CircleInstance({...});
provider.add(circle);

await nextFrame();

circle.center = [200, 50];

// Only wait for half of the animation to finish!
await wait(500);

// Circle will start from where it was located and start moving to this next provided location!
circle.center = [500, 500];
```

Prebaked animations ARE THAT EASY!

---

## Customizing a Layer to accept animations

Now, let's go deeper into the Layer itself. Making your own animations is probably a horrifying
mystical atrocity that no one shall ever comprehend, right?

Nope: still easy. Let's take a look at our own Layer (using the example
from [The Layer](./working-with-layers.md))

```javascript
export class MyLayer<T extends MyInstance, U extends IProps> extends Layer2D<T, U> {

  // Override this method to begin making our shader configuration!
  initShader(): IShaderInitialization<MyInstance> {
    ...

    return {
      ...
      instanceAttributes: [
        {
          // Add this line
          easing: AutoEasingMethod.easeInOutCubic(1000, 0),
          name: 'center',
          size: InstanceAttributeSize.TWO,
          update: circle => circle.center
        },
        ...
      ],
      ...
    };
  }
}
```

Done. You are now forcing the center attribute to animate.

If you want to get fancy with it, make the animate a prop like the base layers:

```javascript
interface IProps<T extends MyInstancec> extends ILayer2DProps<T> {
  animate?: {
    center?: IAutoEasingMethod;
  }
}

export class MyLayer<T extends MyInstance, U extends IProps> extends Layer2D<T, U> {

  // Override this method to begin making our shader configuration!
  initShader(): IShaderInitialization<MyInstance> {
    const { animate: { center: animateCenter }} = this.props;
    ...

    return {
      ...
      instanceAttributes: [
        {
          // Add this line
          easing: animateCenter,
          name: 'center',
          size: InstanceAttributeSize.TWO,
          update: circle => circle.center
        },
        ...
      ],
      ...
    };
  }
}
```

Now if it's provided, it'll animate, and if not, no animation.

---

## Animation Limitations

As with EVERYTHING good in the life, there are limits and moderations to consider.

Shaders have a limited number of attributes you can pump into them. These limits can be felt in weaker
hardware. DeltaV tries it's hardest to reduce those limitations by performing backflips and barrel
rolls for you, but when you backflip and barrel roll too much, performance starts to degrade a lot.

So, it would benefit you to realize MOST platforms are limited to 16 attribute 'slots'.
Each slot represents 4 floats. If you use one float in a slot, you've used up all four floats for that
slot.

So deltav does 'packing' and 'destructuring' for you to optimize the utilization of those slots
(this is one of the major reasons you can ONLY use attributes in the main method.)

SO LASTLY BE AWARE:
Animations come at the cost of increasing your vertex usage by times 2 + a bit! Why? because
easing requires additional information: a start value, an end value, a duration, and a start time.

So KEEP THIS IN MIND AND USE WISELY!
