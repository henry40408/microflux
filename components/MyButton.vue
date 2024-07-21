<script setup lang="ts">
import { useInterval } from "@vueuse/core";

defineProps<{ done?: boolean; error?: unknown; loading?: boolean }>();

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
  <span class="uppercase">
    [
    <a v-if="!done && !loading" href="#" @click.prevent="$emit('click')"
      ><slot
    /></a>
    <span v-if="!done && loading">{{ " " }}{{ label }}</span>
    <span v-if="!done && error">{{ " " }}{{ error }}</span>
    <span v-if="done"><slot name="done">done!</slot></span>
    ]
  </span>
</template>
