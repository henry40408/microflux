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
    <div v-if="opened" v-html="content" />
    <slot />
    <a href="#" @click.prevent="toggle(false)">collapse</a>
  </details>
</template>
