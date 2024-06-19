# Quick Start Example

This is the basic example provided on the intro page. Here we have added
comments to explain line by line what is happening to help you see
[The Basics](./the-basics.md) in action.

```javascript
export const MyComponent = (() => {
  // Make a ref that will hold our provider for passing instances to a Layer
  const circleProvider = React.useRef(new InstanceProvider<CircleInstance>());
  // Make a list tracking all of our created instances
  const circles = React.useRef<CircleInstance[]>([]);
  // Make a resolver to wait for the surface ready signal
  const ready = React.useRef(new PromiseResolver<Surface>());
  // Make a Camera2D which is a special camera provided for the 2D rendering
  // system deltav provides.
  const camera = React.useRef(new PromiseResolver(new Camera2D()));

  // Execute when our component mounts
  React.useEffect(() => {
    // Wait for the surface ready signal so the pipeline is fully established
    // and hopefully didn't have errors
    const surface = await ready.current.promise;
    // Ensure our provider is avaialble
    if (!circleProvider.current) return;
    // Request the rendering size of the View with name="main"
    const size = surface.getViewSize("main");

    // If no size was provided, the view was not available
    if (!size) {
      console.warn("Invalid View Size", surface);
      return;
    }

    // We're gonna make some instances
    const instances: CircleInstance[] = [];

    // Let's make a bunch of circles
    for (let i = 0, iMax = 100; i < iMax; ++i) {
      // Create the new CircleInstance, add it to the circle provider for the
      // layer, then add that instance to our instance list for easy management
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

      // Update our ref of all instances
      circles.current = instances;
    }
  }, []);

  // Handler for mouse down events from the surface
  const handleMouseDown = (e: IMouseInteraction) => {
    if (!circles.current) return;
    // Get the mouse's position within our world space
    const world = e.target.view.projection.screenToWorld(e.screen.position);

    // Move all of our instances to the mouse position but randomly around it
    // Due to how we configured the CircleLayer, this will animate the circles
    // to their new destination!
    circles.current.forEach((circle) => {
      circle.center = [
        Math.random() * 400 - 200 + world[0],
        Math.random() * 400 - 200 + world[1],
      ];
    });
  };

  return (
    {/** Create our new surface for rendering. It will expand to fit it's container */}
    <SurfaceJSX
      {/** Receive the ready signal via our PromiseResolver */}
      ready={ready.current}
      {/** Apply the options to apply to the rendering canvas */}
      options={{
        alpha: true,
        antialias: true,
      }}
    >
      {/**
        * This hooks into the Surfaces event system. Here we wire into the
        * handleMosueDown .
        */}
      <SimpleEventHandlerJSX handlers={{ handleMouseDown }} />
      {/**
        * Make our View to render our scene to the entire screen!
        * Normally this is wrapped in a SceneJSX BUT our SurfaceJSX provides a
        * default SceneJSX it places our top level ViewJSX and LayerJSX into for
        * a simple convenience.
        */}
      <ViewJSX
        name="main"
        {/** Use a View2D to comply with the deltav 2D system */}
        type={View2D}
        config={{
          {/** We use the camera we made */}
          camera: camera.current,
          background: [0, 0, 0, 1],
          clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
        }}
      />
      {/** Make our layer to render the CircleInstances */}
      <LayerJSX
        {/** The Layer should render the circle instances with a CircleLayer */}
        type={CircleLayer}
        {/** Hand our provider to the layer so the layer can react to changes */}
        providerRef={circleProvider}
        {/** Configure the layer via the CircleLayer props */}
        config={{
          /** This layer let's us specify which properties we want to animate! */
          animate: {
            /**
             * Specify the animation function for animating changes to the
             * "center" property on our circle instances.
             */
            center: AutoEasingMethod.easeInOutCubic(2000),
          },
        }}
      />
    </SurfaceJSX>
  );
});
```
