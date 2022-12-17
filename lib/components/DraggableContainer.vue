<template>
  <component :is="tag" ref="containerRef"> <slot /> </component>
</template>

<script lang="ts" setup>
/* eslint-disable vue/require-default-prop */

import { onMounted, onUnmounted, ref, watch } from 'vue'
import { smoothDnD, dropHandlers, type SmoothDnD, type ContainerOptions, type DropPlaceholderOptions } from 'smooth-dnd'
import { omitUndefined } from '../utils/omitUndefined'

export interface DropResult<T = any> {
  removedIndex: number | null
  addedIndex: number | null
  payload?: T
  element?: HTMLElement
}

export interface DragStartParams<T = any> {
  isSource: boolean
  payload: T
  willAcceptDrop: boolean
}

export interface DragEndParams<T = any> {
  isSource: boolean
  payload: T
  willAcceptDrop: boolean
}

export interface DraggableContainerProps {
  /**
   * Tag name or the node definition to render the root element of the `DraggableContainer`.
   *
   * @default div
   * */
  tag?: string

  /**
   * Property to describe weather the dragging item will be moved or copied
   * to target container. Can be **move** or **copy** or **drop-zone** or **contain**.
   *
   * @default move
   */
  behavior?: 'move' | 'copy' | 'drop-zone' | 'contain'
  /**
   * `DraggableItem` can be moved between the containers having the same group names.
   * If not set container will not accept drags from outside.
   * This behavior can be overridden by **shouldAcceptDrop** function. See below.
   */
  groupName?: string
  /**
   * Orientation of the container. Can be **horizontal** or **vertical**.
   *
   * @default vertical
   */
  orientation?: 'vertical' | 'horizontal'
  /**
   * Css selector to test for enabling dragging.
   * If not given item can be grabbed from anywhere in its boundaries.
   */
  dragHandleSelector?: string
  /**
   * Css selector to prevent dragging.
   * Can be useful when you have form elements or selectable text somewhere inside your draggable item.
   * It has a precedence over **dragHandleSelector**.
   */
  nonDragAreaSelector?: string
  /**
   * Time in milliseconds. Delay to start dragging after item is pressed.
   * Moving cursor before the delay more than 5px will cancel dragging.
   *
   * @default 0 (200 for touch devices)
   */
  dragBeginDelay?: number
  /**
   * Animation duration in milliseconds.
   * To be consistent this animation duration will be applied to both drop and reorder animations.
   *
   * @default 250
   */
  animationDuration?: number
  /**
   * First scrollable parent will scroll automatically if dragging item is close to boundaries.
   *
   * @default true
   */
  autoScrollEnabled?: boolean
  /**
   * Locks the movement axis of the dragging.
   * Possible values are **x**, **y** or **undefined**.
   */
  lockAxis?: 'x' | 'y'
  /**
   * Class to be added to the ghost item being dragged.
   * The class will be added after it's added to the DOM
   * so any transition in the class will be applied as intended.
   */
  dragClass?: string
  /**
   * Class to be added to the ghost item just before the drop animation begins.
   */
  dropClass?: string
  /**
   * When set true onDrop will be called with a removedIndex
   * if you drop element out of any relevant container
   */
  removeOnDropOut?: boolean
  /**
   * Options for drop placeholder. **className**, **animationDuration**, **showOnTop**
   */
  dropPlaceholder?: DropPlaceholderOptions
  /**
   * The function to be called to get the payload object to be passed onDrop function.
   *
   * @param index index of the child item
   * @returns payload
   */
  getChildPayload?: (index: number) => any
  /**
   * The function to be called by all containers before drag starts
   * to determine the containers to which the drop is possible.
   * Setting this function will override the group-name property
   * and only the return value of this function will be taken into account.
   *
   * @param sourceContainerOptions options of the source container. (parent container of the dragged item)
   * @param payload the payload object retrieved by calling `getChildPayload` function
   */
  shouldAcceptDrop?: (sourceContainerOptions: ContainerOptions, payload: any) => boolean
  /**
   * The function to be called by the target container to which the dragged item will be dropped.
   * Sometimes dragged item's dimensions are not suitable with the target container
   * and dropping animation can be weird. So it can be disabled by returning **false**.
   * If not set drop animations are enabled.
   *
   * @param sourceContainerOptions options of the source container. (parent container of the dragged item)
   * @param payload the payload object retrieved by calling `getChildPayload` function
   */
  shouldAnimateDrop?: (sourceContainerOptions: ContainerOptions, payload: any) => boolean
  /**
   * The function to be called to get the element that the dragged ghost will be appended.
   * Default parent element is the container itself.
   * The ghost element is positioned as 'fixed' and appended to given parent element.
   * But if any ancestor of container has a transform property,
   * ghost element will be positioned relative to that element which breaks the calculations.
   * Thats why if you have any transformed parent element of Containers you should set this property
   * so that it returns any element that has not transformed parent element.
   *
   * @readonly Any DOM element that the ghost will be appended in
   */
  getGhostParent?: () => HTMLElement
}

export interface DraggableContainerEvents {
  /**
   * Event to be emitted by all containers on drag start.
   */
  onDragStart: (payload: DragStartParams) => void
  /**
   * The function to be called by all containers on drag end. Called before `drop` event.
   */
  onDragEnd: (payload: DragEndParams) => void
  /**
   * The event to be emitted by the relevant container whenever a dragged item enters its boundaries while dragging.
   */
  onDragEnter: () => void
  /**
   * The event to be emitted by the relevant container whenever a dragged item leaves its boundaries while dragging.
   */
  onDragLeave: () => void
  /**
   * The event to be emitted by any relevant container when drop is over. (After drop animation ends).
   * Source container and any container that could accept drop is considered relevant.
   */
  onDrop: (payload: DropResult) => void
  /**
   * The function to be called by the container which is being drag over, when the index of possible drop position
   * changed in container. Basically it is called each time the draggable items in a container slides
   * for opening a space for dragged item. **dropResult** is the only parameter passed to the function
   * which contains the following properties.
   */
  onDropReady: (payload: DropResult) => void
}

const props = withDefaults(defineProps<DraggableContainerProps>(), {
  tag: 'div',
})

const emit = defineEmits<{
  (e: 'drag-start', payload: DragStartParams): void
  (e: 'drag-end', payload: DragEndParams): void
  (e: 'drag-enter'): void
  (e: 'drag-leave'): void
  (e: 'drop', payload: DropResult): void
  (e: 'drop-ready', payload: DropResult): void
}>()

const containerRef = ref<HTMLElement>()
let dnd: SmoothDnD | null = null

smoothDnD.dropHandler = dropHandlers.reactDropHandler().handler
smoothDnD.wrapChild = false

function init() {
  const el = containerRef.value
  if (!el) {
    return
  }
  const options: ContainerOptions = {
    behaviour: props.behavior,
    groupName: props.groupName,
    orientation: props.orientation,
    dragHandleSelector: props.dragHandleSelector,
    nonDragAreaSelector: props.nonDragAreaSelector,
    dragBeginDelay: props.dragBeginDelay,
    animationDuration: props.animationDuration,
    autoScrollEnabled: props.autoScrollEnabled,
    lockAxis: props.lockAxis,
    dragClass: props.dragClass,
    dropClass: props.dropClass,
    removeOnDropOut: props.removeOnDropOut,
    dropPlaceholder: props.dropPlaceholder,

    getChildPayload: props.getChildPayload,
    shouldAnimateDrop: props.shouldAnimateDrop,
    shouldAcceptDrop: props.shouldAcceptDrop,
    getGhostParent: props.getGhostParent,

    onDragStart: (params) => emit('drag-start', params),
    onDragEnd: (params) => emit('drag-end', params),
    onDragEnter: () => emit('drag-enter'),
    onDragLeave: () => emit('drag-leave'),
    onDrop: (params) => emit('drop', params),
    onDropReady: (params) => emit('drop-ready', params),
  }
  dnd?.dispose()
  dnd = smoothDnD(el, omitUndefined(options))
}

onMounted(() => {
  init()
})

watch([props, containerRef], () => {
  init()
})

onUnmounted(() => {
  dnd?.dispose()
})
</script>
