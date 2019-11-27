# DeltaV - A Versatile Graphics Platform

Welcome to DeltaV! This project is born from the need to crunch serious data and be able to interact with that data in meaningful, beautiful, and flexible ways.

This project has also been born to prevent you from needing to be a rocket scientist to optimize your system to get to significant results quickly.

---

## ULTRA QUICK GUIDE: Gimme code NOW! (Technically isn't even a guide)

Me even writing this small text header runs the risk of you leaving. That's what this code snippet is for: The code crunching death machine that is you! If you are mortal like the rest of us, go to the Quick Guide section below this :)

To see this example with comments and a more complex usage: [Quick Start](./quick-start.md)

`I RECOMMEND USING THIS PROJECT WITH TYPESCRIPT!`

```sh
npm install -DE deltav
```

```javascript
import {
  BasicSurface,
  View2D,
  Camera2D,
  CircleLayer,
  createView,
  createLayer,
  CircleInstance,
  InstanceProvider,
  scale2,
  add2,
  multiply2,
  Vec2,
  nextFrame,
  onFrame,
  AutoEasingMethod,
  EasingUtil,
} from 'deltav';

const container = document.createElement('div');
document.body.appendChild(container);
container.style.width = '100%';
container.style.height = '100%';

const providers = {
  circles: new InstanceProvider<CircleInstance>()
}

function makeSurface() {
  const surface = new BasicSurface({
    container,
    providers,
    cameras: {
      main: new Camera2D()
    },
    eventManagers: (cameras) => ({
      main: new BasicCamera2DController({
        camera: cameras.main,
        startView: ["main.main"]
      }),
    }),
    scenes: () => ({
      main: {
        views: {
          fullscreen: createView(View2D, {
            camera: cameras.main,
            background: [0, 0, 0, 1],
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
          }),
        },
        layers: {
          circles: createLayer(CircleLayer, {
            animate: {
              center: AutoEasingMethod.easeInOutCubic(
                1000, 0, AutoEasingLoopStyle.NONE
              )
            },
            data: providers.circles,
            usePoints: true
          })
        }
      }
    })
  });
}

async function doStuff() {
  const { width. height } = container
  const screenSize: Vec2 = [width, height];
  const { circles } = providers.circles;
  const all = [];

  function makeCircle(opts) {
    const c = new CircleInstance(opts);
    all.push(c);
    this.surface.providers.circles.add(circle);

    return c;
  }

  let circle = makeCircle({
    center: scale2(screenSize, 0.1),
    radius: 25,
    color: [0, 0.8, 1, 1],
  });

  await wait(1000);

  circle.center = scale2(screenSize, 0.5);
}

doStuff();
makeSurface();
```

## QUICK GUIDE: Start learning fast!

- [The Basics](./the-basics.md): Learn some terms. Get cozy. Settle in.
- [Quick Start](./quick-start.md): Look at a minimal example that renders something to the screen
- [Instances](./instances.md.md): Instances. Instances everywhere and anywhere.
- [Interaction](./interaction.md): Exploring the rendering and probing around.
- [Working With Layers](./working-with-layers.md): Really dig into the power of your GPU!
- [The Shader](./the-shader.md): The lair of the Shader. Enter here. Leave born anew.
- [Animation](./animation.md): You're starting to use this framework like a pro. Make your products reflect that!
- [Optimization](./optimization.md): The south is already a sauna. Your CPU doesn't need to help with that situation.
- [Project Considerations](project-considerations.md): There are MANY ways to bundle a cat. Here's some thoughts to make your life easier.

---

## What DeltaV is and is not

DeltaV IS a graphics framework! It gives you:

- Math utilities (2D and 3D)
- A means to run programs on the GPU
- A way to split your rendering from your processing
- Optimized handling of updates to the GPU
- Animation Helper
- Basic Graphics Library (Shapes, Images, Text, Video)
- Shader Simplification and Shader Module manager
- Will not become a speed bump to your goals. This framework tries really hard to meet your processing demands for rendering LOADS of data and possibly even animating it.
- Very modular to add functionality or convenience as your needs demand. Things you create will/should be VERY versatile and usable across projects.
- Speeds up custom GPU development so you can create optimal handling of your visuals with ease.

DeltaV IS NOT a one stop solution to everything you hoped and dreamed of, but it WILL ENABLE you to achieve your dreams!

- No specific data handling (This enables your awesome algorithmic prowess of data to take hold!)
- Not a layout solution (Combine with d3 or your favorite library for easy amazing results!)
- Not a complete game platform (Just makes everything you want to do EASY)
- No sound handling
- Does not force you to make great/perfect choices. But that's ok! Sometimes not great choices are what we're stuck with, and we always need something to support us through our rough times! DeltaV will take on the weight of a bad set up and try to make your job easier!

---

## Features! What is and is to come.

We'll be forward with what you get out of the box right now. If a desired feature is not here: don't panic! Still give this a shot. You'll be AMAZED what DeltaV will do for you! It can quickly make you realize you did NOT need x-y-z feature as this can open the door to a 'better way'!

Also know, this framework is actively being used AND developed! New features are being added all the time!

So, what comes in the box?! Read On!

### Framework
- Custom `Views`, `Cameras`, and `Scenes`: Breakup the canvas into sections to inject information into it!

- `Layers` to break up and compose complicated "data to visuals"

- `Partial Updates`! modify something, see it update with magic and without updating entire buffers.

- `Animation`: Properties sent to the GPU can be automatically animated and have synced feedback on the CPU for the current value of the animation.

- `Custom attribute behavior`: Create your own Attribute to Shader behaviors!

- `Shader Modules`: Make your own shader modules to be imported and re-used

- `Shader extending`: Analyze and modify a shader

- `Color Picking`: Easily set up a layer to have its instances rendered to a color buffer to have feedback in mouse interactions with the instance.

- `Resource Management` Pipeline: You can create your own resource managers for different types of assets! Or you can use the built-in Image and Font Resource manager to get MOST tasks done!

- `Basic Surfaces`: Get started with your visualization QUICKLY and with helpful intellisense feedback. We wrapped some common concepts like animation loops and project structure into simple classes to get you rolling FAST!

- `Event Managers`: Get some out of the box controllers to make controlling camera and interact with elements with ease! Also, use the simple interface and informative event feedback to quickly design your own interactions!

- `Mouse` and `Touch` Support! Get useful feedback from user interactions for all devices!

- `Frame Control`: Gain access to extremely convenient methods for running commands on the framework's animation loop or execute commands on timed values or specific frames using methods like: `onFrame`, `nextFrame`, `onAnimationLoop`, `stopAnimationLoop`, and `stopAllFrameCommands`.

### Math
- `Unit Tested`: Thousands of tests!

- `Vectors`: Extensive library for vectors that is VERY easy to use with great performance!

- `Matrices`: Extensive library for Matrix math to aid in projections and transforms

- `Quaternions`: Do rotations the right way! Use lookAt style methods to get your orientations right!

### 2D
- `Basic Shapes`: Circle, Square, Edges, Arcs, Images, Text, TextArea, Rings! Plenty to make TONS of custom visualizations already!

- A `Camera2D` and a `View2D` to aid in projection handling

- `QuadTree` for managing and querying the space

### 3D
- `Instance3D` for handling transform manipulation

- `View3D` to aid in projecting rays into the 3D space

### Examples!

- TONS of examples to look at and mess around with in the `test` folder! See just a FEW possibilities this framework can work with!

### For the Future:

- COMPLETE `WebGL 2.0` features: The framework is already designed with WebGL 2.0 integration with fallbacks to 1.0 for robust compatibility.

- `Render Targets`: These are a WIP and are GREATLY needed for many techniques in handling certain large data loads or see interesting point cloud visualizations or do HDR rendering etc etc etc. I get it, I want it too. BUT do NOT write off this framework thinking you MUST have this feature. Play with it a bit first to see how the framework makes it possible to STILL work with HUGE amounts of data.

- `Multiple Render Targets`: This will be seamlessly integrated to support MRT for systems that do and DON'T have MRT enabled hardware.

- `More 3D` is a tricky realm to get involved in. Essentially creating our own layers for 3D with lighting systems etc means we'd be developing our own internal engine for rendering, which is something I'd like to NOT do with this project as this is a platform for essentially 'making' engines or pipelines. There will be some helpful starting points with Math, Projections, and Updates in this library; however, in-depth rendering systems for 3D will be made in other projects that will be shared and built upon DeltaV

- `More Geometry` There will be geometry helpers added aplenty as the framework evolves.

- Better documentation for the API. Every part of DeltaV is useful and ready to create modular improvements to it. We need some better docs about that modular development beyond just using vanilla DeltaV.

- Better API docs for elements used when using deltav yourself.

- Better Framework docs to help those developing the framework itself.
