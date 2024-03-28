<script setup lang="ts">
const props = defineProps({
  content: { type: String, required: true },
});

const opened = ref(false);

function toggle(e) {
  if (e.newState !== "open") return;
  if (opened.value) return;
  opened.value = true;
}
</script>

<template>
  <details @toggle="toggle">
    <summary>content</summary>
    <div v-if="opened" v-html="props.content"></div>
    <slot></slot>
  </details>
</template>
