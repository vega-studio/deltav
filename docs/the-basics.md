# The Basics
---

DeltaV requires at minimum the following to get something to render to the screen:

- A container HTMLElement
- A Surface
- A Scene
- A View with a Camera
- A Layer
- Some data (Instance and InstanceProvider)

As a web developer you should be familiar with HTML and basic DOM manipulation. If not: You need to know how too use it.

## The Surface
---

The Surface is the base part of the framework for DeltaV. Everything is built on top of it as a foundation.

It ranges from simple and easy, to deep and complex depending how much involvement you need to make your project a
success.

For now, let's take a look at simple and easy using the convenience of the included "BasicSurface":

```javascript
import { BasicSurface } from 'deltav';

const el = document.createElement('div');
document.body.appendChild(el);

const container = new BasicSurface({
  container: el,
  providers: {},
  cameras: {},
  eventManagers: () => ({}),
  pipeline: () => ({})
});
```

Congratulations! You made a surface that is ready to render stuff into your page!

`NOTE: It's wise to give your HTML element some valid dimensions. For testing and playing, I recommend filling the screen with the element`

## The Scene

Now that we have a Surface to work with: let's continue by setting up our next item of interest: The Scene!

Our scene by itself does not render anything still, it's essentially a container stuff can be placed inside of then
viewed.

```javascript
import { BasicSurface } from 'deltav';

const el = document.createElement('div');
document.body.appendChild(el);

const container = new BasicSurface({
  container: el,
  providers: {},
  cameras: {},
  eventManagers: () => ({}),
  pipeline: () => ({})
});
```
