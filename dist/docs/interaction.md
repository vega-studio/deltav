# Interactions

Our pretty rendering is pretty useless if the user can't poke around it and see changes or query
for more info. It's just a glorified picture until you can interact with it.

So what does deltav do for you in terms of interaction?

We have a couple of items to help you get rolling:

- Event Managers
- Pre-baked event managers
- Custom Event Managers
- Layer Events
- Color Picking

---

## Layer Mouse Events and Picking

The type of interaction you will mostly be interested in, is how to interact with Instances. Our
layers provide an easy access into that:

```javascript
import { BasicSurface, BasicCamera2DController, Camera2D } from 'deltav';

const el = document.createElement('div'); // <- Style this bad boy to make it fill up some space
document.body.appendChild(el);

const container = new BasicSurface({
  ...,
  scenes: (_resources, _providers, cameras) => ({
    main: {
      views: {
        main: createView(View2D, {
          camera: cameras.main,
          background: [0, 0, 0, 1],
          clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
        })
      },
      layers: {
        circles: createLayer(CircleLayer, {
          data: providers.circles,

          // Set picking to SINGLE (This is currently the only supported version of picking)
          picking: PickType.SINGLE,
          // With picking enabled: this method will now execute when you click on an instance
          onMouseClick: info => {
            // Info instances contains all of the instances detected in the click. Since our pick
            // is set to single
            info.instances.forEach(instance => {
              // Do something
            })
          }
        }),
      }
    }
  })
});
```

### Making custom layers compatible with Color picking

Color picking is available to layers that has a base module of 'picking'.
You just have to make sure in your fragment shader you use `setColor` INSTEAD
of `gl_FragColor =`.

```glsl
void main() {
  setColor(vec4(1., 1., 1., 1.));
}
```

---

## Event Managers

When you look at setting up our BasicSurface you may have noticed a section that was fairly ignored:

```javascript
eventManagers: () => ({})
```

What are these beasts? Well, simply put, they are the receivers of all user input. They are piped
in User Interactions coupled with the Views the user interacted with. It is then up to the
EventManager to react to this information however it so chooses.

For example! We made you a REALLY nice manager `BasicCamera2DController`!

```javascript
import { BasicSurface, BasicCamera2DController, Camera2D } from 'deltav';

const el = document.createElement('div'); // <- Style this bad boy to make it fill up some space
document.body.appendChild(el);

const container = new BasicSurface({
  container: el,
  providers: {},
  cameras: {
    main: new Camera2D(),
  },
  eventManagers: (cameras) => ({
    controller: new BasicCamera2DController({
      camera: cameras.main,
      startView: "main.main"
    })
  }),
  scenes: (_resources, _providers, cameras) => ({
    main: {
      views: {
        main: createView(View2D, {
          camera: cameras.main,
          background: [0, 0, 0, 1],
          clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
        })
      },
      layers: {
        circles: createLayer(CircleLayer, {
          // Give the layer the circles provider as it's data source
          data: providers.circles,
        }),
      }
    }
  })
});
```

This event manager listens to all of the User Input and manipulates the camera in common expected
interactions. You will also notice the controller handles touch interactions fairly well!

## Custom Handlers

There's a couple of ways to customize event handling: either extend SimpleEventHandler or use
SimpleEventHandler:

extend
```javascript
class MyController extends SimpleEventHandler {
  handleMouseDown(e: IMouseInteraction) {
    // Do stuff
  }
}
```

or use directly
```javascript
import { BasicSurface, SimpleEventHandler } from 'deltav';

const container = new BasicSurface({
  ...
  eventManagers: (cameras) => ({
    controller: new SimpleEventHandler({
      handleMouseDown(e: IMouseInteraction) {
        // Do stuff
      }
    })
  }),
  ...
});
```
