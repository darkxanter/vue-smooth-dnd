<template>
  <div class="card-scene">
    <draggable-container
      orientation="horizontal"
      drag-handle-selector=".column-drag-handle"
      :drop-placeholder="upperDropPlaceholderOptions"
      @drag-start="(e) => log('drag start', e)"
      @drop="onColumnDrop"
    >
      <draggable-item v-for="column in scene.children" :key="column.id">
        <div :class="column.props.className">
          <div class="card-column-header">
            <span class="column-drag-handle">&#x2630;</span>
            {{ column.name }}
          </div>
          <draggable-container
            group-name="col"
            :get-child-payload="getCardPayload(column.id)"
            drag-class="card-ghost"
            drop-class="card-ghost-drop"
            :drop-placeholder="dropPlaceholderOptions"
            @drop="(e) => onCardDrop(column.id, e)"
            @drag-start="(e) => log('drag start', e)"
            @drag-end="(e) => log('drag end', e)"
          >
            <draggable-item v-for="card in column.children" :key="card.id">
              <div :class="card.props.className" :style="card.props.style">
                <p>{{ card.data }}</p>
              </div>
            </draggable-item>
          </draggable-container>
        </div>
      </draggable-item>
    </draggable-container>
  </div>
</template>

<script setup lang="ts">
import { DraggableContainer, DraggableItem, type DraggableContainerProps } from '../../lib'
import type { DropResult } from 'smooth-dnd'
import { ref } from 'vue'

// cspell:disable
const lorem = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`
const columnNames = ['Lorem', 'Ipsum', 'Consectetur', 'Eiusmod']

const cardColors = [
  'azure',
  'beige',
  'bisque',
  'blanchedalmond',
  'burlywood',
  'cornsilk',
  'gainsboro',
  'ghostwhite',
  'ivory',
  'khaki',
]
const pickColor = () => {
  const rand = Math.floor(Math.random() * 10)
  return cardColors[rand]
}
const scene = ref({
  type: 'container',
  props: {
    orientation: 'horizontal',
  },
  children: Array.from({ length: 5 }, (_, i) => ({
    id: `column${i}`,
    type: 'container',
    name: columnNames[i],
    props: {
      orientation: 'vertical',
      className: 'card-container',
    },
    children: Array.from({ length: +(Math.random() * 10).toFixed() + 5 }, (_, j) => ({
      type: 'draggable',
      id: `${i}${j}`,
      props: {
        className: 'card',
        style: { backgroundColor: pickColor() },
      },
      data: lorem.slice(0, Math.floor(Math.random() * 150) + 30),
    })),
  })),
})

const upperDropPlaceholderOptions: DraggableContainerProps['dropPlaceholder'] = {
  className: 'cards-drop-preview',
  animationDuration: 150,
  showOnTop: true,
}
const dropPlaceholderOptions: DraggableContainerProps['dropPlaceholder'] = {
  className: 'drop-preview',
  animationDuration: 150,
  showOnTop: true,
}

const applyDrag = (arr: any[], dropResult: DropResult) => {
  const { removedIndex, addedIndex, payload } = dropResult
  if (removedIndex === null && addedIndex === null) {
    return arr
  }

  const result = [...arr]
  let itemToAdd = payload

  if (removedIndex !== null) {
    itemToAdd = result.splice(removedIndex, 1)[0]
  }

  if (addedIndex !== null) {
    result.splice(addedIndex, 0, itemToAdd)
  }

  return result
}

function onColumnDrop(dropResult: DropResult) {
  scene.value.children = applyDrag(scene.value.children, dropResult)
}

function onCardDrop(columnId: string, dropResult: DropResult) {
  if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
    const column = scene.value.children.filter((p) => p.id === columnId)[0]
    const columnIndex = scene.value.children.indexOf(column)
    const newColumn = Object.assign({}, column)
    newColumn.children = applyDrag(newColumn.children, dropResult)
    scene.value.children.splice(columnIndex, 1, newColumn)
  }
}
function getCardPayload(columnId: string) {
  return (index: number) => {
    return scene.value.children.filter((p) => p.id === columnId)[0].children[index]
  }
}

function log(...params: any[]) {
  console.log(...params)
}
</script>

<style>
.board {
  padding: 50px;
}
</style>
