# Quick Start Example

This is the basic example provided on the intro page. Here we have added comments to explain line by line what is happening to help you see [The Basics](./the-basics) in action.

```javascript
import {
  // Render pipeline generation
  BasicSurface,
  View2D,
  Camera2D,
  ClearFlags,

  // Layer handling
  CircleLayer,
  createView,
  createLayer,

  // Event manager
  BasicCamera2DController,

  // Data management
  CircleInstance,
  InstanceProvider,

  // Math
  scale2,
  add2,
  multiply2,
  Vec2,

  // Frame management
  onFrame,
  wait,

  // Animation
  AutoEasingMethod,
  EasingUtil,
  AutoEasingLoopStyle,
} from 'deltav';

// Make an html thingy to render into!
const container = document.createElement('div');
document.body.appendChild(container);
container.style.width = '100%';
container.style.height = '100%';

// These
const providers = {
  circles: new InstanceProvider<CircleInstance>(),
};

function makeSurface() {
  // Make a surface to render stuff!
  const surface = new BasicSurface({
    // Use our html thing for rendering into!
    container,
    // Set the bridge for adding and removing data
    providers,

    // Set up our camera mechanisms for controlling what we see
    cameras: {
      main: new Camera2D(),
    },

    // Make a controller for our camera to let us move around and zoom with ease
    eventManagers: cameras => ({
      main: new BasicCamera2DController({
        camera: cameras.main,
        startView: ['main.fullscreen'],
      }),
    }),

    // No resources needed
    resources: {},

    // Establish our scenes that has items injected into
    pipeline: (_resources, _providers, cameras) => ({
      resources: [],
      scenes: {
        main: {
          // Establish how this scene is viewed (Camera orientation)
          // and where we want to print that rendering
          // (By default to a portion of the screen)
          views: {
            fullscreen: createView(View2D, {
              camera: cameras.main,
              background: [0, 0, 0, 1],
              clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
            }),
          },
          // Establish layers to inject elements into the scene to be viewed
          layers: {
            // We want circles!
            circles: createLayer(CircleLayer, {
              // Establish which properties we want animated and which easing to
              // use to animate them
              animate: {
                center: AutoEasingMethod.easeInOutCubic(
                  1000,
                  0,
                  AutoEasingLoopStyle.NONE
                ),
              },
              // This layer renders data provided by the circles provider
              data: providers.circles,
              // A property of the layer that can improve performance with certain
              // limitations.
              usePoints: true,
            }),
          },
        },
      },
    }),
  });

  // BOOM: you made your first rendering pipeline!
  // This pipeline can be customized to include VERY complex behaviors VERY easily!
  // Use your imagination!
}

// Now let's make it render something by adding actual circles to it!
async function doStuff() {
  const { width, height } = container.getBoundingClientRect();
  const screenSize: Vec2 = [width, height];
  const all = [];

  // Easy method for adding a circle to our 'all' list and to our provider
  function makeCircle(opts) {
    const c = new CircleInstance(opts);
    all.push(c);
    providers.circles.add(c);

    return c;
  }

  // Make and render a circle
  let circle = makeCircle({
    center: [100, 100],
    radius: 4,
    color: [0, 0.8, 1, 1],
  });

  // Add some circles to delineate our corners
  providers.circles.add(
    new CircleInstance({
      center: [0, 0],
      radius: 2,
      color: [1, 0, 0, 1],
    })
  );

  providers.circles.add(
    new CircleInstance({
      center: [screenSize[0], 0],
      radius: 2,
      color: [1, 0, 0, 1],
    })
  );

  providers.circles.add(
    new CircleInstance({
      center: [screenSize[0], screenSize[1]],
      radius: 2,
      color: [1, 0, 0, 1],
    })
  );

  providers.circles.add(
    new CircleInstance({
      center: [0, screenSize[1]],
      radius: 2,
      color: [1, 0, 0, 1],
    })
  );

  await wait(1000);

  // Move the circle.
  circle.center = scale2(screenSize, 0.5);
  await wait(1000);
  // Wait!?
  circle.center = scale2(screenSize, 0.7);
  await wait(1000);
  // What is this devilry?!
  circle.center = scale2(screenSize, 0.1);
  await wait(1000);
  // It animates on it's own!
  circle.center = scale2(screenSize, 0.3);
  await wait(1000);

  // Add a LOT of circles
  for (let i = 0; i < 200; ++i) {
    await onFrame();

    // Add them in a fancy randomized circle thingy
    for (let k = 0; k < 50; ++k) {
      const dist = Math.random() * 200;
      const angle = Math.random() * Math.PI * 2;

      makeCircle({
        center: add2(
          scale2(screenSize, 0.3),
          scale2([Math.sin(angle), Math.cos(angle)], dist)
        ),
        radius: 4,
        color: [0, 0.8, 1, 1],
      });
    }
  }

  let index = 0;

  while (index < all.length) {
    // Stream all of them somewhere else in batches
    const batch = [];

    for (let i = 0; i < 1000 && index < all.length; ++i, ++index) {
      circle = all[index];
      circle.center = scale2(screenSize, 0.7);
      batch.push(circle);
    }

    // Randomize the batches animation start time
    EasingUtil.all(
      false,
      batch,
      [CircleLayer.attributeNames.center],
      easing => {
        easing.setTiming(Math.random() * 1000);
      }
    );

    await onFrame();
  }

  await EasingUtil.all(true, all, [CircleLayer.attributeNames.center]);
  await wait(1000);

  // Explode!
  for (let i = 0; i < all.length; ++i) {
    circle = all[i];
    circle.center = multiply2(screenSize, [Math.random(), Math.random()]);
  }

  EasingUtil.all(false, all, [CircleLayer.attributeNames.center], easing => {
    easing.setTiming(Math.random() * 1000);
  });

  await wait(2000);

  // Implode!
  for (let i = 0; i < all.length; ++i) {
    circle = all[i];
    circle.center = [100, 100];
  }

  await wait(2000);

  // Clear
  providers.circles.clear();
  // Restart
  doStuff();

  // See!? Easy fun :)
}

// We can immediately start doing stuff with our providers even before the
// rendering pipeline is ready.
// Notice: ~40 lines of powerful set up then the other 90+ lines are for actually
// making things happen! And it's easy to understand!
doStuff();
// As seen here! We are NOW making the surface AFTER starting up our data handling!
// You can even call this BEFORE doStuff()
// with the same effect! This illustrates a VERY detached architecture which
// eliminates almost all dependencies that like to tangle complicated rendering
// with complicated data processing.
makeSurface();
```
