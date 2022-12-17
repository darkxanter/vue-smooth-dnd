<template>
  <div class="page">
    <draggable-container v-bind="draggableOptions" @drop-ready="onDropReady" @drop="onDrop">
      <draggable-item v-for="item in items" :key="item.id">
        <div class="draggable-item">{{ item.name }}</div>
      </draggable-item>
    </draggable-container>
  </div>
</template>

<script lang="ts" setup>
import {
  DraggableContainer,
  DraggableItem,
  type DraggableContainerEvents,
  type DraggableContainerProps,
} from '../../lib'
import { ref } from 'vue'

type Item = {
  id: number
  name: string
}

const items = ref<Item[]>(
  Array.from({ length: 5 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
  })),
)

const draggableOptions: DraggableContainerProps = {
  removeOnDropOut: false,
  getGhostParent: () => document.body,
}

const onDrop: DraggableContainerEvents['onDrop'] = (dropResult) => {
  console.log('onDrop', dropResult)
  const { removedIndex, addedIndex } = dropResult
  if (removedIndex === null && addedIndex === null) {
    return
  }
  let itemToAdd: Item | undefined

  if (removedIndex !== null) {
    itemToAdd = items.value.splice(removedIndex, 1)[0]
  }

  if (addedIndex !== null && itemToAdd) {
    items.value.splice(addedIndex, 0, itemToAdd)
  }
}

const onDropReady: DraggableContainerEvents['onDropReady'] = (payload) => {
  console.log('onDropReady', payload)
}
</script>

<style scoped>
.page {
  max-width: 500px;
  margin: 50px auto;
  border: 1px solid black;
  min-height: 600px;
}
</style>
