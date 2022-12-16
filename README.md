# Vue Smooth DnD

Vue 3 Wrapper of smooth-dnd library.

A fast and lightweight drag&drop, sortable library for Vue.js with many configuration options covering many d&d scenarios.

This library consists wrapper Vue.js components over [smooth-dnd](https://github.com/kutlugsahin/smooth-dnd) library.

> NOTE: This is a Vue 3 wrapper over [smooth-dnd](https://github.com/kutlugsahin/smooth-dnd) library. It's a fork of the [vue2 wrapper](https://github.com/kutlugsahin/vue-smooth-dnd).

## Installation

```shell
npm i vue-smooth-dnd
```

## Usage

### Vue

```jsx
<template>
  <div>
    <div class="simple-page">
        <draggable-container @drop="onDrop">
          <draggable-item v-for="item in items" :key="item.id">
            <div class="draggable-item">
              {{item.data}}
            </div>
          </Draggable>
        </Container>
    </div>
  </div>
</template>

<script>
import { DraggableContainer, DraggableItem } from "@xanter/vue-smooth-dnd";

export default {
  name: "Simple",
  components: { Container, Draggable },
  data() {
    return {
      items: Array.from({ length: 50 }, (_, i) => ({ id: i, data: "Draggable " + i }))
    };
  },
  methods: {
    onDrop(dropResult) {
      this.items = this.applyDrag(this.items, dropResult);
    },
    applyDrag(arr, dragResult) {
      const { removedIndex, addedIndex, payload } = dragResult
      if (removedIndex === null && addedIndex === null) return arr

      const result = [...arr]
      let itemToAdd = payload

      if (removedIndex !== null) {
        temToAdd = result.splice(removedIndex, 1)[0]
      }

      if (addedIndex !== null) {
        result.splice(addedIndex, 0, itemToAdd)
      }

      return result
    }
  }
};
</script>
```

## API: DraggableContainer

Component that contains the draggable elements or components. Each of its children should be wrapped by `DraggableItem` component

## Properties

Properties define the visual behaviour of the library:

| Property                |           Type            |            Default            | Description                                                                                                                                                                                                      |
| ----------------------- | :-----------------------: | :---------------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| :orientation            |          string           |          `vertical`           | Orientation of the container. Can be **horizontal** or **vertical**.                                                                                                                                             |
| :behaviour              |          string           |            `move`             | Property to describe weather the dragging item will be moved or copied to target container. Can be **move** or **copy** or **drop-zone** or **contain**.                                                         |
| :tag                    | string or NodeDescription |             `div`             | Tag name or the node definition to render the root element of the `DraggableContainer`.                                                                                                                          |
| :group-name             |          string           |          `undefined`          | DraggableItem can be moved between the containers having the same group names. If not set container will not accept drags from outside. This behaviour can be overriden by shouldAcceptDrop function. See below. |
| :lock-axis              |          string           |          `undefined`          | Locks the movement axis of the dragging. Possible values are **x**, **y** or **undefined**.                                                                                                                      |
| :drag-handle-selector   |          string           |          `undefined`          | Css selector to test for enabling dragging. If not given item can be grabbed from anywhere in its boundaries.                                                                                                    |
| :non-drag-area-selector |          string           |          `undefined`          | Css selector to prevent dragging. Can be useful when you have form elements or selectable text somewhere inside your draggable item. It has a precedence over **dragHandleSelector**.                            |
| :drag-begin-delay       |          number           | `0` (`200` for touch devices) | Time in milisecond. Delay to start dragging after item is pressed. Moving cursor before the delay more than 5px will cancel dragging.                                                                            |
| :animation-duration     |          number           |             `250`             | Animation duration in milisecond. To be consistent this animation duration will be applied to both drop and reorder animations.                                                                                  |
| :auto-scroll-enabled    |          boolean          |            `true`             | First scrollable parent will scroll automatically if dragging item is close to boundaries.                                                                                                                       |
| :drag-class             |          string           |          `undefined`          | Class to be added to the ghost item being dragged. The class will be added after it's added to the DOM so any transition in the class will be applied as intended.                                               |
| :drop-class             |          string           |          `undefined`          | Class to be added to the ghost item just before the drop animation begins.                                                                                                                                       |
| :remove-on-drop-out     |          boolean          |          `undefined`          | When set true onDrop will be called with a removedIndex if you drop element out of any relevant container                                                                                                        |
| :drop-placeholder       |      boolean,object       |          `undefined`          | Options for drop placeholder. **className**, **animationDuration**, **showOnTop**                                                                                                                                |

## Lifecycle

The lifecycle of a drag is both described, and can be controlled, by a series of [callbacks](#callbacks) and [events](#events), which are illustrated below for a example **containing 3 containers**:

```
Mouse     Calls  Callback / Event       Parameters              Notes

down   o                                                        Initial click

move   o                                                        Initial drag
       |
       |         get-child-payload()    index                   Function should return payload
       |
       |   3 x   should-accept-drop()   srcOptions, payload     Fired for all containers
       |
       |   3 x   drag-start             dragResult              Fired for all containers
       |
       |         drag-enter
       v

move   o                                                        Drag over containers
       |
       |   n x   drag-leave                                     Fired as draggable leaves container
       |   n x   drag-enter                                     Fired as draggable enters container
       v

up     o                                                        Finish drag

                 should-animate-drop()  srcOptions, payload     Fires once for dropped container

           3 x   drag-end               dragResult              Fired for all containers

           n x   drop                   dropResult              Fired only for droppable containers
```

Note that `should-accept-drop` is fired before every `drag-start`, and before every `drag-end`, but has been omitted here for clarity.

The `dragResult` parameter has the format:

```js
dragResult: {
    payload,
    isSource,
    willAcceptDrop,
}
```

The `dropResult` parameter has the format:

```js
dropResult: {
    addedIndex,
    removedIndex,
    payload,
    droppedElement,
}
```

Note that additional parameters can be passed to callbacks and event handlers by writing an interim handler _inline_ in the markup:

```jsx
<div v-for="(items, index) in groups"
  <draggable-container group-name="column"
    :should-accept-drop="(src, payload) => getShouldAcceptDrop(index, src, payload)"
    >
    ...
  </draggable-container>
</div>
```

This can provide handler functions context-sensitive data, such as the loop index or current item.

## Callbacks

Callbacks provide additional logic and checks before and during user interaction.

### `get-child-payload()`

The function to be called to get the payload object to be passed **onDrop** function.

```jsx
<draggable-container :get-child-payload="getChildPayload">
```

```ts
getChildPayload (index) {
  return {
    // generate custom payload data here
  }
}
```

#### Parameters

-   **index** : `number` : index of the child item

#### Returns

-   **payload** : `object`

### `should-accept-drop()`

The function to be called by all containers before drag starts to determine the containers to which the drop is possible. Setting this function will override the **group-name** property and only the return value of this function will be taken into account.

```jsx
<draggable-container :should-accept-drop="shouldAcceptDrop">
```

```ts
shouldAcceptDrop (sourceContainerOptions, payload) {
  return true;
}
```

#### Parameters

-   **sourceContainerOptions** : `object` : options of the source container. (parent container of the dragged item)
-   **payload** : `object` : the payload object retrieved by calling [get-child-payload](#get-child-payload) function.

#### Returns

-   **boolean** : **true / false**

### `should-animate-drop()`

The function to be called by the target container to which the dragged item will be dropped.
Sometimes dragged item's dimensions are not suitable with the target container and dropping animation can be wierd. So it can be disabled by returning **false**. If not set drop animations are enabled.

```jsx
<draggable-container :should-animate-drop="shouldAnimateDrop">
```

```ts
shouldAnimateDrop (sourceContainerOptions, payload) {
  return false;
}
```

#### Parameters

-   **sourceContainerOptions** : `object` : options of the source container. (parent container of the dragged item)
-   **payload** : `object` : the payload object retrieved by calling [get-child-payload](#get-child-payload) function.

#### Returns

-   **boolean** : **true / false**

### `get-ghost-parent()`

The function to be called to get the element that the dragged ghost will be appended. Default parent element is the container itself.
The ghost element is positioned as 'fixed' and appended to given parent element.
But if any anchestor of container has a transform property, ghost element will be positioned relative to that element which breaks the calculations. Thats why if you have any transformed parent element of Containers you should set this property so that it returns any element that has not transformed parent element.

```jsx
<draggable-container :get-ghost-parent="getGhostParent">
```

```ts
getGhostParent() {
  // i.e return document.body;
}
```

#### Returns

-   **Element** : **Any DOM element that the ghost will be appended in**

---

## Events

Events may call user-defined handlers at particular points in the drag-and-drop lifecycle.

### `@drag-start`

Event to be emitted by all containers on drag start.

```jsx
<draggable-container @drag-start="onDragStart">
```

```ts
onDragStart (dragResult) {
  const { isSource, payload, willAcceptDrop } = dragResult
}
```

#### Parameters

-   **dragResult** : `object`

    -   **payload** : `object` : the payload object that is returned by [get-child-payload](#get-child-payload). It will be undefined in case get-child-payload is not set.
    -   **isSource** : `boolean` : true if it is called by the container which drag starts from otherwise false.
    -   **willAcceptDrop** : `boolean` : true if the dragged item can be dropped into the container, otherwise false.

### `@drag-end`

The function to be called by all containers on drag end. Called before [drop](#drop) event.

```jsx
<Container @drag-end="onDragEnd">
```

```ts
onDragEnd (dragResult) {
  const { isSource, payload, willAcceptDrop } = dragResult
}
```

#### Parameters

-   **dragResult** : `object`

    -   **isSource** : `boolean` : true if it is called by the container which drag starts from, otherwise false.
    -   **payload** : `object` : the payload object that is returned by [get-child-payload](#get-child-payload) function. It will be undefined in case get-child-payload is not set.
    -   **willAcceptDrop** : `boolean` : true if the dragged item can be dropped into the container, otherwise false.

### `@drag-enter`

The event to be emitted by the relevant container whenever a dragged item enters its boundaries while dragging.

```jsx
<draggable-container @drag-enter="onDragEnter">
```

```ts
onDragEnter () {
  ...
}
```

### `@drag-leave`

The event to be emitted by the relevant container whenever a dragged item leaves its boundaries while dragging.

```jsx
<draggable-container @drag-leave="onDragLeave">
```

```ts
onDragLeave () {
  ...
}
```

### `@drop-ready`

The function to be called by the container which is being drag over, when the index of possible drop position changed in container. Basically it is called each time the draggables in a container slides for opening a space for dragged item. **dropResult** is the only parameter passed to the function which contains the following properties.

```jsx
<draggable-container @drop-ready="onDropReady">
```

```js
onDropReady(dropResult) {
  const { removedIndex, addedIndex, payload, element } = dropResult;
  ...
}
```

#### Parameters

-   **dropResult** : `object`
    -   **removedIndex** : `number` : index of the removed children. Will be `null` if no item is removed.
    -   **addedIndex** : `number` : index to add droppped item. Will be `null` if no item is added.
    -   **payload** : `object` : the payload object retrieved by calling _getChildPayload_ function.
    -   **element** : `DOMElement` : the DOM element that is moved

### `@drop`

The event to be emitted by any relevant container when drop is over. (After drop animation ends). Source container and any container that could accept drop is considered relevant.

```jsx
<draggable-container @drop="onDrop">
```

```ts
onDrop (dropResult) {
  const { removedIndex, addedIndex, payload, element } = dropResult;
  ...
}
```

#### Parameters

-   **dropResult** : `object`

    -   **removedIndex** : `number` : index of the removed child. Will be `null` if no item is removed.
    -   **addedIndex** : `number` : index to add dropped item. Will be `null` if no item is added.
    -   **payload** : `object` : the payload object retrieved by calling [get-child-payload](#get-child-payload) function.
    -   **droppedElement** : `DOMElement` : the DOM element that is moved

## API: DraggableItem

Wrapper component for `DraggableContainer`'s children. Every child element should be wrapped with **Draggable** component.

## Properties

### `tag`

Tag name or the node definition to render the root element of the `DraggableItem`.
Default value is 'div'.

```jsx
tag = 'tr'
```

#### possible values

-   string : The tag name of the root element to be created
