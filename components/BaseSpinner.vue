<script setup lang="ts">
const counter = useInterval(500);
const loadingLabel = computed(() => {
  const icons = ["⌛", "⏳"];
  return icons[counter.value % icons.length];
});
</script>

<template>
  <span>{{ loadingLabel }}</span>
</template>

<style scoped></style>
