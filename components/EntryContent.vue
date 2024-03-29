<script setup lang="ts">
defineProps({
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
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-if="opened" v-html="content" />
    <slot />
  </details>
</template>
