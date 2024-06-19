# Interactions

Our pretty rendering is pretty useless if the user can't poke around it and see
changes or query for more info. It's just a glorified picture until you can
interact with it.

So what does deltav do for you in terms of interaction?

We have a couple of items to help you get rolling:

- Event Managers
- Pre-baked event managers
- Custom Event Managers
- Layer Events
- Color Picking

---

## Event Managers

When you look at setting up our Surface you may have noticed Event Handlers
being added which hooks in an performs extra functionality.

These are EventManagers.

What are these beasts? Well, simply put, they are the receivers of all user
input. They are piped in User Interactions coupled with the Views the user
interacted with. It is then up to the EventManager to react to this information
however it so chooses.

For example! We made you a REALLY nice manager `BasicCamera2DController`!

```javascript
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

return (
  <SurfaceJSX
    ready={ready.current}
    options={{
      alpha: true,
      antialias: true,
    }}
  >
    {/** Just add this here to suddenly gain mouse interactions that lets you zoom and pan the scene! */}
    <BasicCamera2DControllerJSX config={{ camera: camera.current }} />
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

This event manager listens to all of the User Input and manipulates the camera
in common expected interactions. You will also notice the controller handles
touch interactions fairly well!

## Custom Handlers

There's a couple of ways to customize event handling: either extend
SimpleEventHandler or use SimpleEventHandler:

extend

```javascript
class MyController extends SimpleEventHandler {
  // Override the interactions you wish to handle
  handleMouseDown(e: IMouseInteraction) {
    // Do stuff
  }
}
```

or use directly

```javascript
<SurfaceJSX>
  <SimpleEventHandler handlers={{
    handleMouseDown(e: IMouseInteraction) {
      ...
    }
  }}>
</SurfaceJSX>
```

---

## Color Picking

There is a common technique called "color picking" that uses the GPU rendering
pipeline to render your geomtry as identifiable colors. You then select the
color underneath the mouse and you can use that color to decide which object you
interacted with.

This is a fairly involved process, deltav helps you set up these interactions
but also let's you control the pipeline for them so you can tune the
capabilities to your pipeline and needs.

Let's look at the pieces!

First, we must create a texture that can STORE the color picking output.

```tsx
<SurfaceJSX>
  {/**
   * Note: mip maps MUST be disabled for this technique to work accurately.
   * An error will be generated to the log if they are enabled.
   */}
  <TextureJSX
    width={TextureSize.SCREEN}
    height={TextureSize.SCREEN}
    textureSettings={{ generateMipMaps: false }}
  />
</SurfaceJSX>
```

Next step is to enable picking on our layer of choice by setting picking to
PickType.Single. This is due to this mode only being able to select a single
instance at a time.

```tsx
<SurfaceJSX>
  <TextureJSX width={TextureSize.SCREEN} height={TextureSize.SCREEN} textureSettings={{ generateMipMaps: false }}/>
  <LayerJSX type={CircleLayer} config={{
    picking: PickType.Single
    ...
  }}/>
</SurfaceJSX>
```

Next, we must create a view that will output the pick buffer to our texture we
made

```tsx
<SurfaceJSX>
  <TextureJSX name="pick" width={TextureSize.SCREEN} height={TextureSize.SCREEN} textureSettings={{ generateMipMaps: false }}/>
  {/** Render our view to the screen for the elements we're showing */}
  <ViewJSX
    name="main"
    type={View2D}
    config={{
      camera: camera.current,
      clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
    }}
  />
  {/** Render our view to the picking buffer so the system has the data to work with */}
  <ViewJSX
    name="pick"
    type={View2D}
    config={{
      camera: camera.current,
      clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
    }}
    output={{
      buffers: { [FragmentOutputType.PICKING]: "pick" },
      depth: true,
    }}
  />
  <LayerJSX type={CircleLayer} config={{
    picking: PickType.Single
    ...
  }}/>
</SurfaceJSX>
```

Now we have the last and strangest step. The surface is working to inject and
modify your layers to make the picking system work, so we have to tell that
system when it is time to process everything it has gathered and emit the
results.

Thus we have a Command layer to allow for an injection of a command anywhere
within the pipeline. This allows you to specify WHEN the process it to take
place. Keep in mind the process performs a reading of a texture's pixel data so
it is a MASSIVELY blocking operation so positioning it in the render pipeline
correctly can make a major difference in performance.

```tsx
<SurfaceJSX>
  <TextureJSX name="pick" width={TextureSize.SCREEN} height={TextureSize.SCREEN} textureSettings={{ generateMipMaps: false }}/>
  {/** Execute the picking decoding process here in the render pipeline */}
  {CommandsJSX({
    name: "decode-picking",
    callback: (surface) => {
      surface.commands.decodePicking();
    },
  })}
  <ViewJSX
    name="main"
    type={View2D}
    config={{
      camera: camera.current,
      clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
    }}
  />
  <ViewJSX
    name="pick"
    type={View2D}
    config={{
      camera: camera.current,
      clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
    }}
    output={{
      buffers: { [FragmentOutputType.PICKING]: "pick" },
      depth: true,
    }}
  />
  <LayerJSX type={CircleLayer} config={{
    picking: PickType.Single
    ...
    {/** Do something with the interaction of instances */}
    onMouseOver={(info) => {
      info.instances;
    }}
  }}/>
</SurfaceJSX>
```

To further see why color picking is SO involved, let's look at how to make the
rendering the picking buffer can be reduced to a buffer a QUARTER the size of
the rest of the rendering. This can improve your target rendering experience
significantly.

```tsx
<SurfaceJSX>
  {/** Reduce the Texture buffer size we render to */}
  <TextureJSX name="pick" width={TextureSize.SCREEN_QUARTER} height={TextureSize.SCREEN_QUARTER} textureSettings={{ generateMipMaps: false }}/>
  {CommandsJSX({
    name: "decode-picking",
    callback: (surface) => {
      surface.commands.decodePicking();
    },
  })}
  <ViewJSX
    name="main"
    type={View2D}
    config={{
      camera: camera.current,
      clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
    }}
  />
  {/** Adjust the View to render a scaled version of the output */}
  <ViewJSX
    name="main"
    type={View2D}
    config={{
      screenScale: [4, 4],
      pixelRatio: 0.5,
      camera: camera.current,
      clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
    }}
    output={{
      buffers: { [FragmentOutputType.PICKING]: "pick" },
      depth: true,
    }}
  />
  <LayerJSX type={CircleLayer} config={{
    picking: PickType.Single
    ...
    onMouseOver={(info) => {
      info.instances;
    }}
  }}/>
</SurfaceJSX>
```

Here's an example of an MRT strategy in rendering the picking color.

```tsx
<SurfaceJSX>
  <TextureJSX
    name="pick"
    width={TextureSize.SCREEN}
    height={TextureSize.SCREEN}
    textureSettings={{ generateMipMaps: false }}
  />
  <TextureJSX
    name="color"
    width={TextureSize.SCREEN}
    height={TextureSize.SCREEN}
    textureSettings={{ generateMipMaps: false }}
  />
  {CommandsJSX({
    name: "decode-picking",
    callback: (surface) => {
      surface.commands.decodePicking();
    },
  })}
  <ViewJSX
    name="main"
    type={View2D}
    config={{
      camera: camera.current,
      clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
    }}
    // Output to color and pick buffers simultaneously
    output={{
      buffers: {
        [FragmentOutputType.PICKING]: "pick",
        [FragmentOutputType.COLOR]: "color",
      },
      depth: true,
    }}
  />
  <LayerJSX
    type={CircleLayer}
    config={{
      picking: PickType.Single,
      onMouseOver: (info) => {
        info.instances;
      },
    }}
  />
  {DrawJSX({
    name: "draw",
    input: "color",
  })}
</SurfaceJSX>
```
