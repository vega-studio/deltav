# The Basics

DeltaV requires at _minimum_ the following to get something to render to the
screen:

`WARNING: Quit counting how many lines comes ahead! It's not that bad and you need to chill out!`
`-grumbles in one liners too ambiguous and useless to discern-`

- A container HTMLElement
- A Surface
- A Scene
- A View with a Camera
- A Layer
- Some data (Instance and InstanceProvider)

Note: As a web developer you should be familiar with HTML and basic DOM
manipulation. If not: You need to know how to use it to feed a container to the
framework.

Follow this guide in a downward fashion to see the code example grow slowly into
a fully functional surface.

---

## The Surface

The Surface is the base part of the framework for DeltaV. Everything is built on
top of it as a foundation.

It ranges from "simple and easy", to "deep and complex" depending on how much
involvement you need to make your project a success.

For now, let's take a look at "simple and easy" using the convenience of the
included "SurfaceJSX". I MAYDE THIS FOR YEW! Is how I like to say it, as it's an
abstraction over the true Surface that makes your life SO EASY! (when you use
react. Because you should be using JSX -cough cough- You CAN use the RAW Surface
type to build a Surface using your own specific framework. I happen to love
React)

```javascript
import { SurfaceJSX, SceneJSX } from 'deltav';

const MyComponent = (props: IMyComponent) => {
  // Slap a className on this to fill a region or just let it expand to fill
  // it's container
  return <SurfaceJSX />
}
```

Congratulations! You made a surface that is ready to render stuff into your
page!

`NOTE: It's wise to give your HTML element some valid dimensions. For testing and playing, I recommend filling the screen with the element`

---

## The Scene

Now that we have a Surface to work with: let's continue by setting up our next
item of interest: The Scene!

Our scene by itself does not render anything still, it's essentially a container
stuff can be placed inside of then viewed.

Your scene is just a floaty lofty concept of something akin to a box that you
throw things into. But there is no box, and there is no spoon. It can be your
personal _unnamed sci-fi film with streaming green letters I won't mention for
legal reasons_!

```javascript
import { SurfaceJSX, SceneJSX } from 'deltav';

const MyComponent = (props: IMyComponent) => {
  return (
    <SurfaceJSX>
      <SceneJSX name="ooOooOooo-a-scene">
      </SceneJSX>
    </SurfaceJSX>
  );
}
```

---

## The Camera!

`WARNING: SCARY SENTENCE` The camera is technically just a mathematical model
that projects geometry from one space to another.

For those of us who value meaningful words though: The camera is how we look at
stuff. If you imagine a REAL camera, you position yourself somewhere, then you
point the camera at something, then magically your camera shows what it's
looking at on it's screen.

Basically the same thing happens here: it's something you can position and use
to look at things in the scene. When paired with a View, you will see what it's
pointing at rendered to your screen!

We simply add a camera to our surface so it can be available for next steps:

```javascript
import { SurfaceJSX, SceneJSX } from 'deltav';

const MyComponent = (props: IMyComponent) => {
  // We made a Camera2D as our camera! This is a convenience camera that is
  // provided with deltav's 2D system that makes the top left of the render
  // space [0, 0] and maps coordinates directly to pixels when at scale 1.
  const camera = React.useRef(new Camera2D());

  return (
    <SurfaceJSX>
      <SceneJSX name="ooOooOooo-a-scene">
      </SceneJSX>
    </SurfaceJSX>
  );
}
```

---

## The View

We now have cameras, but we have no film :( There be nothing for our lovely
Camera of Math (Mathera?) to use it's little inner mechanisms to work with.

Enter: The View!

This is where we depict what we are rendering to! We say: What do your fair
camera eyes see? And we tell it to scribe it's sightings' upon a scroll! Well,
not a scroll...but a screen or a render target of some sort.

The view let's us depict yon scroll and it's properties upon which we scribe!

```javascript
import { SurfaceJSX, SceneJSX, ViewJSX, View2D } from 'deltav';

const MyComponent = (props: IMyComponent) => {
  const camera = React.useRef(new Camera2D());

  return (
    <SurfaceJSX>
      <SceneJSX name="ooOooOooo-a-scene">
        <ViewJSX type={View2D} config={{
          // Use our camera
          camera: camera.current,
          // When the colors are cleared in this view, clear to this color
          background: [0, 0, 0, 1],
          // Tell the view to clear properties from it. We have colors and
          // depth information that should be reset
          // every draw before redrawing.
          clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          // A view by default fully utilizes the entire screen. You can use
          // viewport to set custom regions to render to. Viewport utilizes
          // metrics VERY similar to absolute position CSS properties
          // (%, value, right, left, top, bottom, width, height).
          // The following examples would all indicate the entire screen
          viewport: { left: 0, right: 0, top: 0, bottom: 0 },
          viewport: { left: 0, top: 0, width: "100%", height: "100%" },
          // This would indicate a small window in the bottom right of your
          // screen that is the same aspect ratio of the screen
          viewport: { right: 10, top: 10, width: "10%", height: "10%" },
        }}>
        </ViewJSX>
      </SceneJSX>
    </SurfaceJSX>
  );
}
```

---

## The Data - Instances and InstanceProviders

What is a rendering without data? I liken it to being man without purpose. A
lump of potential reduced to being a lump.

So, let's see how data / shapes / modes are injected to DeltaV!!!

First, we have data providers. These are our bridge from the void to the
framework. This is where we mount and unmount data to be rendered.

InstanceProviders ONLY manage Instances! Instances are very near simple JS
Objects. They can be whatever you like and have whatever properties you so
desire. They just MUST inherit Instance and have observable properties.

For this example, we will show you an already provided Instance type:
CircleInstance which is used to to model Circle properties.

```javascript
import { SurfaceJSX, SceneJSX, ViewJSX, View2D, CircleInstance, InstanceProvider } from 'deltav';

const MyComponent = (props: IMyComponent) => {
  const camera = React.useRef(new Camera2D());
  // Since this is a Functional component in react our provider will be stored
  // in a ref for use in the component for it's lifetime.
  const providerRef = React.useRef(new InstanceProvider<CircleInstance>());

  // The following is just an example that the provider and the instance
  // handling are completely decoupled from the rendering pipeline, letting you
  // do what you need to do in simple JS terms:

  // You can make circle instances all you want!
  const circle = new CircleInstance({
    radius: 5,
    center: [100, 100],
    color: [1, 1, 1, 1]
  });

  // This is how you use the provider:
  providerRef.current.add(circle);

  // You can even condense things a bit as the provider returns the newly added
  // instance immediately
  const circle2 = providerRef.current.add(new CircleInstance({
    radius: 5,
    center: [100, 100],
    color: [1, 1, 1, 1]
  }));

  return (
    <SurfaceJSX>
      <SceneJSX name="ooOooOooo-a-scene">
        <ViewJSX type={View2D} config={{
          camera: camera.current,
          background: [0, 0, 0, 1],
          clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          viewport: { left: 0, right: 0, top: 0, bottom: 0 },
        }}>
        </ViewJSX>
      </SceneJSX>
    </SurfaceJSX>
  );
}
```

Now for a DOOZY! InstanceProviders are ALSO how the system keeps your rendering
TOTALLY separate from your Data and/or state!

You cram things into your provider, but you ARE NOT OBLIGATED to use that
provider immediately or dispose of that provider if you're done with your render
surface!

The previous example shows this. We did things with the provider and with
instances without really even worrying about how they will be rendered.

This makes handling your instances layouts super easy and able to be written as a totally seperate idea relative to your rendering system.

---

## The Layer

Prepare yourself. This is where it all happens. The pinnacle. The zenith. The
purpose. The moment for which we are all here.

Layers. Go ahead. Take it in. Breathe for a moment.

Layers are where you set up geometry to be injected into your scene. It takes
your data, does magnificent miracles with your instances, and causes your camera
to suddenly see those items, which causes your view to start drawing like a
crazed painting gnome seeing the morning sun for the first time in its life.

Layers are the heart of where most of your customization can happen so you may
wrangle the GPU to do your bidding.

Here we add a deltav provided Layer that is intended for rendering Circle
Instances using the 2D View system deltav provides.

```javascript
import {
  SurfaceJSX,
  SceneJSX,
  ViewJSX,
  View2D,
  CircleInstance,
  InstanceProvider,
  CircleLayer,
} from 'deltav';

const MyComponent = (props: IMyComponent) => {
  const camera = React.useRef(new Camera2D());
  const providerRef = React.useRef(new InstanceProvider<CircleInstance>());

  // In react world we do this so it only executes on component mount
  React.useEffect(() => {
    // Add our circle to the provider
    providerRef.current.add(new CircleInstance({
      radius: 50,
      center: [250, 250],
      color: [1, 1, 1, 1]
    }))
  }, []);

  return (
    <SurfaceJSX>
      <SceneJSX name="ooOooOooo-a-scene">
        <ViewJSX type={View2D} config={{
          camera: camera.current,
          background: [0, 0, 0, 1],
          clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          viewport: { left: 0, right: 0, top: 0, bottom: 0 },
        }}>
          <LayerJSX
            {/** We use the CircleLayer as our layer type */}
            type={CircleLayer}
            {/** Tell the layer who provides it's CircleInstance data */}
            providerRef={providerRef}
            {/** We can pass in CircleLayer configuration here if we want */}
            config={{}}
          />
        </ViewJSX>
      </SceneJSX>
    </SurfaceJSX>
  );
}
```

---

## Congratulations!!!

You made a basic functioning surface for rendering! You made a Circle appear. It
was a long journey for such meager results. But have some fun with it and start
to be amazed at what deltav does for you!

Here's a mildly more complicated example using some of the properties and tools
available to you:

```javascript
import {
  AutoEasingMethod,
  BasicCamera2DControllerJSX,
  Camera2D,
  CircleInstance,
  CircleLayer,
  ClearFlags,
  IMouseInteraction,
  InstanceProvider,
  LayerJSX,
  PromiseResolver,
  SceneJSX,
  SimpleEventHandlerJSX,
  Surface,
  SurfaceJSX,
  View2D,
  ViewJSX,
} from "deltav";

const circleProvider = React.useRef<InstanceProvider<CircleInstance>>(null);
const circles = React.useRef<CircleInstance[]>([]);
const camera = React.useRef(new Camera2D());
const ready = React.useRef(new PromiseResolver<Surface>());

useLifecycle({
  async didMount() {
    // Wait for the surface to establish the full pipeline
    const surface = await ready.current.promise;
    if (!circleProvider.current) return;

    const size = surface.getViewSize("main");
    if (!size) {
      console.warn("Invalid View Size", surface);
      return;
    }

    const instances: CircleInstance[] = [];

    for (let i = 0, iMax = 100; i < iMax; ++i) {
      instances.push(
        circleProvider.current.add(
          new CircleInstance({
            center: [
              Math.random() * 400 - 200 + size.mid[0],
              Math.random() * 400 - 200 + size.mid[1],
            ],
            radius: Math.random() * 5 + 2,
            color: [
              0,
              Math.random() * 0.8 + 0.2,
              Math.random() * 0.8 + 0.2,
              1,
            ],
          })
        )
      );

      circles.current = instances;
    }

    return () => {};
  },
});

const handleMouseDown = (e: IMouseInteraction) => {
  if (!circles.current) return;
  const world = e.target.view.projection.screenToWorld(e.screen.position);

  circles.current.forEach((circle) => {
    circle.center = [
      Math.random() * 400 - 200 + world[0],
      Math.random() * 400 - 200 + world[1],
    ];
  });
};

return (
  <SurfaceJSX
    ready={ready.current}
    options={{
      alpha: true,
      antialias: true,
    }}
  >
    <BasicCamera2DControllerJSX config={{ camera: camera.current }} />
    <SimpleEventHandlerJSX handlers={{ handleMouseDown }} />
    <ViewJSX
      name="main"
      type={View2D}
      config={{
        camera: camera.current,
        background: [0, 0, 0, 1],
        clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
      }}
    />
    <LayerJSX
      type={CircleLayer}
      providerRef={circleProvider}
      config={{
        animate: {
          center: AutoEasingMethod.easeInOutCubic(2000),
        },
      }}
    />
  </SurfaceJSX>
);
```
