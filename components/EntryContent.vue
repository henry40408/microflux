<script setup lang="ts">
import { useToggle } from "@vueuse/core";

defineProps({
  content: { type: String, required: true },
});

const [opened, toggle] = useToggle(false);
</script>

<template>
  <details :open="opened">
    <summary @click.prevent="toggle()">content</summary>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-if="opened" class="content" v-html="content" />
    <slot />
    <a href="#" @click.prevent="toggle(false)">collapse</a>
  </details>
</template>

<style scoped>
.content {
  margin: 0 0 0.6rem;
}
</style>
