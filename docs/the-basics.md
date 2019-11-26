# The Basics

DeltaV requires at *minimum* the following to get something to render to the screen:

`WARNING: Quit counting how many lines comes ahead! It's not that bad and you need to chill out!`
`-grumbles in one liners too ambiguous and useless to discern-`

- A container HTMLElement
- A Surface
- A Scene
- A View with a Camera
- A Layer
- Some data (Instance and InstanceProvider)

Note: As a web developer you should be familiar with HTML and basic DOM manipulation. If not: You need to know how too use it to feed a container to the framework.

Follow this guide in a downward fashion to see the code example grow slowly into a fully functional surface.

---



## The Surface

The Surface is the base part of the framework for DeltaV. Everything is built on top of it as a foundation.

It ranges from simple and easy, to deep and complex depending how much involvement you need to make your project a
success.

For now, let's take a look at simple and easy using the convenience of the included "BasicSurface".
I MAYDE THIS FOR YEW! Is how I like to say it as it's an abstraction over the true Surface that makes your life SO EASY!

```javascript
import { BasicSurface } from 'deltav';

const el = document.createElement('div'); // <- Style this bad boy to make it fill up some space
document.body.appendChild(el);

const container = new BasicSurface({
  container: el,
  providers: {},
  cameras: {},
  eventManagers: () => ({}),
  scenes: () => ({})
});
```

Congratulations! You made a surface that is ready to render stuff into your page!

`NOTE: It's wise to give your HTML element some valid dimensions. For testing and playing, I recommend filling the screen with the element`

---




## The Scene

Now that we have a Surface to work with: let's continue by setting up our next item of interest: The Scene!

Our scene by itself does not render anything still, it's essentially a container stuff can be placed inside of then
viewed.

Your scene is just a floaty lofty concept of something akin to a box that you throw things into. But there is no box,
and there is no spoon. It can be your personal *unnamed sci-fi film with streaming green letters I won't mention for
legal reasons*!

```javascript
import { BasicSurface } from 'deltav';

const el = document.createElement('div');
document.body.appendChild(el);

const container = new BasicSurface({
  container: el,
  providers: {},
  cameras: {},
  eventManagers: () => ({}),

  // Here we make a scene with the key 'main'. You can use any object organization
  // you like here. The string of object keys essentially makes the identifier for the scene.
  scenes: () => ({
    // The id of this scene is 'main'
    main: {
      views: {},
      layers: {}
    },

    // The id of this scene is 'example.of.a.deeply.organized.scene'
    // We won't use this scene in the next examples because it's annoying to type
    example: {
      of: {
        a: {
          deeply: {
            organized: {
              scene: {
                views: {},
                layers: {}
              }
            }
          }
        }
      }
    }
  })
});
```
---



## The Camera!

`WARNING: SCARY SENTENCE`
The camera is technically just a mathematical model that projects geometry from one space to another.

For those of us who value meaningful words though: The camera is how we look at stuff. If you imagine a REAL camera,
you position yourself somewhere, then you point the camera at something, then magically your camera shows what it's
looking at on it's screen.

Basically the same thing happens here: it's something you can position and use to look at things in the scene. When
paired with a View, you will see what it's pointing at rendered to your screen!

We simply add a camera to our surface so it can be available for next steps:

```javascript
import { BasicSurface, Camera2D } from 'deltav';

const el = document.createElement('div');
document.body.appendChild(el);

const container = new BasicSurface({
  container: el,
  providers: {},

  // Add our camera to our cameras! Identifiers are like the scene and you'll see how cool this can be if you're using
  // typescript
  cameras: {
    main: new Camera2D()
  },

  eventManagers: () => ({}),
  scenes: () => ({
    main: {
      views: {},
      layers: {}
    },
  })
});
```

---


## The View

We now have cameras, but we have no film :( There be nothing for our lovely Camera of Math (Mathera?) to use it's little
inner mechanisms to work with.

Enter: The View!

This is where we depict what we are rendering to! We say: What do your fair camera eyes see? And we tell it to scribe
it's sightings upon a scroll! Well, not a scroll...but a screen or a render target of some sort.

The view let's us depict yon scroll and it's properties upon which we scribe!

```javascript
import { BasicSurface, Camera2D, CircleInstance, InstanceProvider } from 'deltav';

const el = document.createElement('div');
document.body.appendChild(el);

const container = new BasicSurface({
  container: el,
  providers: {},
  cameras: {
    main: new Camera2D()
  },
  eventManagers: () => ({}),

  // When we create the scenes, we receive our instantiated elements we specify in this constructor
  // as items in this callback to use! You will even get intellisense feedback (depending on your IDE)
  // for the structure you declared! Try it out! cameras.m -> will intellisense cameras.main for you!
  scenes: (_resources, _providers, cameras) => ({
    main: {
      views: {
        // Make our scroll to scribe upon! Our View! Tell it the type of view we want, and offer it properties
        main: createView(View2D, {
          // Use our main camera
          camera: cameras.main,
          // When the colors are cleared in this view, clear to this color
          background: [0, 0, 0, 1],
          // Tell the view to clear properties from it. We have colors and depth information that should be reset
          // every draw before redrawing.
          clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
          // createView by default fully fills the surface area. You can use viewport to set custom regions to render to.
          // viewport utilizes metrics VERY similar to position: absolute CSS properties (%, value, right, left, top
          // bottom, width, height).
          // viewport: { left: 0, right: 0, top: 0, bottom: 0 }
        })
      },
      layers: {}
    },
  })
});
```

---




## The Data - Instances and InstanceProviders

What is a rendering without data? I liken it to being man without purpose. A lump of potential reduced to being a lump.

So, let's see how data is injected to DeltaV!!!

First, we have data providers. These are our bridge from the void to the framework. This is where we mount and unmount
data to be rendered.

InstanceProviders ONLY manage Instances! Instances are simple, very near simple JS Objects. They can be whatever you
like and have whatever properties you so desire. They just MUST inherit Instance.

```javascript
import { BasicSurface, Camera2D, CircleInstance, InstanceProvider } from 'deltav';

const el = document.createElement('div');
document.body.appendChild(el);

const container = new BasicSurface({
  container: el,

  // We make a provider that can provide CircleInstances. It shall be where we add and remove instances!
  providers: {
    circles: new InstanceProvider<CircleInstance>()
  },

  cameras: {
    main: new Camera2D()
  },
  eventManagers: () => ({}),
  scenes: (_resources, _providers, cameras) => ({
    main: {
      views: {
        main: createView(View2D, {
          camera: cameras.main,
          background: [0, 0, 0, 1],
          clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
        })
      },
      layers: {}
    },
  })
});
```

Now for a DOOZY! InstanceProviders are ALSO how the system keeps your rendering TOTALLY separate from your Data and/or
state! You cram things into your provider, but you ARE NOT OBLIGATED to use that provider immediately or dispose of
that provider if you're done with your render surface!

So oft you will find it convenient to do:

```javascript
import { BasicSurface, Camera2D, CircleInstance, InstanceProvider } from 'deltav';

const el = document.createElement('div');
document.body.appendChild(el);

// Psh, this data is MINE! I give it to you when I FEEL LIKE IT!
const providers = {
  circles: new InstanceProvider<CircleInstance>()
}

// I shall add data to this...BEFORE I CARE TO RENDER MWAHAHA
providers.add(new CircleInstance({
  center: [100, 100],
  radius: 25,
  color: [1, 1, ,1 , 1]
}))

const container = new BasicSurface({
  container: el,
  providers,
  cameras: {
    main: new Camera2D()
  },
  eventManagers: () => ({}),
  scenes: (_resources, _providers, cameras) => ({
    main: {
      views: {
        main: createView(View2D, {
          camera: cameras.main,
          background: [0, 0, 0, 1],
          clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
        })
      },
      layers: {}
    },
  })
});
```

---



## The Layer

Prepare yourself. This is where it all happens. The climax. The purpose. The moment for which we are all here.

Layers. Go ahead. Take it in. Breathe for a moment.

Layers are where you set up geometry to be injected into your scene. It takes your data, does magnificent miracles with
your instances, and causes your camera to suddenly see those items, which causes your view to start drawing like a
crazed painting gnome seeing the morning sun for the first time in it's life.

Layers are the heart of where most of your customization can happen so you may wrangle the GPU to do your bidding.

Here we add an already made Layer for rendering Circle Instances.

```javascript
import { BasicSurface, Camera2D, CircleInstance, InstanceProvider, CircleLayer } from 'deltav';

const el = document.createElement('div');
document.body.appendChild(el);

const providers = {
  circles: new InstanceProvider<CircleInstance>()
}

providers.add(new CircleInstance({
  center: [100, 100],
  radius: 25,
  color: [1, 1, ,1 , 1]
}))

const container = new BasicSurface({
  container: el,
  providers,
  cameras: {
    main: new Camera2D()
  },
  eventManagers: () => ({}),
  scenes: (_resources, providers, cameras) => ({
    main: {
      views: {
        main: createView(View2D, {
          camera: cameras.main,
          background: [0, 0, 0, 1],
          clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
        })
      },

      // Make our circle layer using the same identifier pattern as the other elements
      layers: {
        circles: createLayer(CircleLayer, {
          // Give the layer the circles provider as it's data source
          data: providers.circles,
        }),
      }
    },
  })
});
```

---


## Congratulations!!!

You made a basic functioning surface for rendering! You made a Circle appear. It was a long journey for such meager
results. But have some fun with it and start to be amazed at what deltav does for you:

```javascript
import { BasicSurface, Camera2D, CircleInstance, InstanceProvider, CircleLayer, AutoEasingMethod, nextFrame } from 'deltav';

const el = document.createElement('div');
document.body.appendChild(el);

const providers = {
  circles: new InstanceProvider<CircleInstance>()
}

let circle;

// Add a TON of circles!
for (let i = 0; i < 2000; ++i) {
  circle = new CircleInstance({
    center: [Math.random() * 100, Math.random() * 100],
    radius: 5,
    color: [1, 1, ,1 , 1]
  });

  providers.add(circle);
}

const container = new BasicSurface({
  container: el,
  providers,
  cameras: {
    main: new Camera2D()
  },
  eventManagers: () => ({}),
  scenes: (_resources, providers, cameras) => ({
    main: {
      views: {
        main: createView(View2D, {
          camera: cameras.main,
          background: [0, 0, 0, 1],
          clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
        })
      },

      // Make our circle layer using the same identifier pattern as the other elements
      layers: {
        circles: createLayer(CircleLayer, {
          animate: {
            center: AutoEasingMethod.easeInOutCubic(1000, 0)
          },
          // Give the layer the circles provider as it's data source
          data: providers.circles,
        }),
      }
    },
  })
});

// Move a single circle and watch it animate!
nextFrame(() => {
  circle.center = [0, 0];
});
```
