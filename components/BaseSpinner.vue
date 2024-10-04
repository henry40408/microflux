<template>
  <ClientOnly>
    <span>
      {{ label }}
    </span>
  </ClientOnly>
</template>

<script setup lang="ts">
import spinners from "cli-spinners";

const spinner = spinners.dots;

const counter = useInterval(spinner.interval);

const label = computed(
  () => spinner.frames[counter.value % spinner.frames.length],
);
</script>
