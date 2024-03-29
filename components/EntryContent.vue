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
    <div v-if="opened" class="content" v-html="content" />
    <slot />
  </details>
</template>

<style scoped>
.content {
  margin: 0 0 0.6rem;
}
</style>
