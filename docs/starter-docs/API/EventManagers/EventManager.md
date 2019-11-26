# EventManger

EventManger is a class that can be extended by other classes. Its methods can be overridden to respond to events.

## Methods

**get surface()**

Allows an event manager to access its governing surface.

**getProjection(viewId: string): BaseProjection<any> | null**

Retrieves the projections for the view specified by the provided viewId

**getView(viewId: string): View<IViewProps> | null**

Retrieves the actual view for the view specified by the provided viewId

**getViewScreenBounds(viewId: string): Bounds<View<IViewProps>> | null**

Retrieves teh screen bounds for the view specified byt the provide viewId

**setUserInputManager(mouseManager: UserInputEventManger)**

Used internally which provides the parent MouseEventManager via the param mouseManager for this EventManager.

## Events

All the events are abstract, they should be extended when needed.

**handleMouseDown(e: IMouseInteraction): void**

(abstract) Handles mouse down event

**handleMouseUp(e: IMouseInteraction): void**

(abstract) Handles mouse up event

**handleMouseOver(e: IMouseInteraction): void**

(abstract) Handles mouse over event

**handleMouseOut(e: IMouseInteraction): void**

(abstract) Handles mouse out event

**handleMouseMove(e: IMouseInteraction): void**

(abstract) Handles mouse move event

**handleClick(e: IMouseInteraction): void**

(abstract) Handles mouse click event

**handleDrag(e: IMouseInteraction): void**

(abstract) Handles mouse drag event

**handleWheel(e: IMouseInteraction): void**

(abstract) Handles mouse wheel event

**handleTouchDown(e: ITouchInteraction): void**

(abstract) Handles when a touch first interacts with the screen

**handleTouchUp(e: ITouchInteraction): void**

(abstract) Handles when a touch is no longer interacting with the screen

**handleTouchOut(e: ITouchInteraction): void**

(abstract) Handles when an existing touch slides off of it's start view

**handleTouchCancelled(e: ITouchInteraction): void**

(abstract) Handles when the system nukes your touch whether you like it or not. Some examples of when this 'might' happen:

  Hand gestures in iOS Safari that causes the window to be closed or open up multitasking in some fashion.

  Basically, more and more convenience gestures in the OS has more and more potential to kill your touches.

  So make sure you are using this

**handleTouchDrag(e: ITouchInteraction): void**

(abstract) Handles when a touch is dragged across the screen

**handleTap(e: ITouchInteraction): void**

(abstract) Handles when a touch has tapped the screen quickly

**handleDoubleTap(e: ITouchInteraction): void**

(abstract) Handles when a touch double taps quickly on the screen

**handleLongTouch(e: ITouchInteraction): void**

(abstract) Handles when a touch is left in a location for an extended period of time

**handleLongTap(e: ITouchInteraction): void**

(abstract) Handles when a touch taps a location with a lengthy delay

**handlePinch(e: ITouchInteraction): void**

(abstract) Handles when multiple touches converge toward each other

**handleSpread(e: ITouchInteraction): void**

(abstract) Handles when multiple touches spread away from each other

**handleTouchRotate(e: ITouchInteraction): void**

(abstract) Handles when multiple touches rotate about a point

**handleSwipe(e: ITouchInteraction): void**

(abstract) Handles when a single touch or multiple touches swipe quickly in a direction
