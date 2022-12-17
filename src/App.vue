<script setup lang="ts">
import CardBoard from './components/CardBoard.vue'

// type Status = 'new' | 'in-progress' | 'done'

// type KanbanItem = {
//   id: number
//   name: string
//   status: Status
// }

// const items = ref<KanbanItem[]>(
//   Array.from({ length: 5 }, (_, i) => ({
//     id: i,
//     name: `Item ${i}`,
//     status: 'new',
//   })),
// )

// const itemsByStatus = computed(() =>
//   items.value.reduce(
//     (acc, item) => {
//       acc[item.status].push(item)
//       return acc
//     },
//     {
//       'new': [],
//       'in-progress': [],
//       'done': [],
//     } as Record<Status, KanbanItem[]>,
//   ),
// )
</script>

<template>
  <main>
    <card-board />
    <!-- <simple-example /> -->
    <!-- <div class="board">
      <draggable-container
        v-for="[status, items] in Object.entries(itemsByStatus)"
        :key="status"
        class="column"
        group-name="items-by-status"
      >
        <draggable-item v-for="item in items" :key="item.id">
          <div class="item">
            {{ item.name }}
          </div>
        </draggable-item>
      </draggable-container>
    </div>
    <hr />
    <ul>
      <li v-for="item in items" :key="item.id">{{ item.name }} - {{ item.status }}</li>
    </ul> -->
  </main>
</template>

<style scoped>
.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 500px;
  grid-gap: 16px;
}

.column {
  display: grid;
  grid-template-columns: 1fr;
  grid-auto-rows: min-content;
  grid-gap: 16px;
  padding: 16px;
  border: 1px solid black;
}

.item {
  padding: 16px;
  background: rgb(243, 243, 243);
}
</style>
