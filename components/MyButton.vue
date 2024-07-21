<script setup lang="ts">
import { useInterval } from "@vueuse/core";

defineProps<{ loading?: boolean }>();

defineEmits<{ click: [] }>();

const counter = useInterval(300);
const label = computed(() => {
  const l = 3;
  const s = [];
  for (let i = 0; i < l; i += 1) {
    s.push((counter.value - i) % l === 0 ? ":" : ".");
  }
  return s.join("");
});
</script>

<template>
  <div>
    [
    <a v-if="!loading" href="#" @click.prevent="$emit('click')"><slot /></a>
    <span v-if="loading">{{ label }}</span>
    ]
  </div>
</template>
