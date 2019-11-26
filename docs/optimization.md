# Optimization

This section feels like a betrayal! You said this should just work and be great!

Well it DOES just work and it IS great! But we all can always do our part to make sure things
run well for our lower budgeted brethern and we must always look out for our laptop batteries.

Also, you will soon realize how not betrayed you are when you realize how easy it is to keep things
optimal.

## Use Layer properties

If you find yourself looping through EVERY instance to make it change in some way: you should
consider changing your approach to use a layer property instead of instance properties.

Simply use a uniform in the layer that hands the property to the shader.

## Avoid touching every property on an instance

If you're updating a property like `center` on an instance, DO NOT do a broad sweep of updating
everything on the instance.

NO!!!!
```javascript
update() {
  Object.assign(this.circle, ...properties);
}
```

Yes!!
```javascript
update() {
  this.circle.center = properties.center;
}
```

DeltaV can VERY pointedly update JUST the center property to the GPU. You just must let it do so.

## Avoid touching anything that need not be touched

Don't loop through your instances and update center for everything if a lot of items are expected
to not change at all.

// BAD IDEA!!! (Unless you are sure everything WILL be moving to new locations)
```javascript
update() {
  this.circles.forEach(c => c.center = newCenter);
}
```

// GOOD IDEA!!
```javascript
update() {
  this.circles.forEach(c => {
    if (!compare2(c.center, newCenter)) {
      c.center = newCenter;
    }
  });
}
```

## Spread out updates over time

When you're dealing with HUGE datasets you shouldn't be soo aggressive with your updates if you plan
on moving or changingg everything. ALWAYS consider spreading oout your updates over time.

This is VERY easy to do with DeltaV too:

```javascript
let index = 0;
const batch = 1000;

// Master loop to make sure we iterate over everything
while(index < this.circles.length) {
  // Batch loop to iterate over a batch of items
  for(let i = 0; i < batch && i < this.circles.length; ++i, ++index) {
    const circle = this.circles[index];
    circle.center = newCenter;
  }

  // Wait till next render frame to commit some more changes
  await onFrame();
}
```

## See performance concerns!

In your developer console in Chrome (r other modern browsers) you can type:

```javascript
localStorage.debug = 'performance';
```

Then refresh your page to see performance logs get spewed into the console.
To shut them off simply:

```javascript
delete localStorage.debug;
```

## Conclusion

That's the major sticking points for performance! Super easy to remember, and doesn't require
spooky math or GPU science!

Enjoy!
