<template>
  <component :is="tag" :class="constants.wrapperClass">
    <slot />
  </component>
</template>

<script lang="ts" setup>
import { constants } from "smooth-dnd";

withDefaults(
  defineProps<{
    /**
     * Tag
     * @default div
     * */
    tag?: string;
  }>(),
  {
    tag: "div",
  }
);
</script>
