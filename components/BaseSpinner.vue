<template>
  {{ label }}
</template>

<script setup lang="ts">
const counter = useInterval(500);

const labels = [":..", ".:.", "..:"];
const label = computed(() => labels[counter.value % labels.length]);
</script>

<style scoped></style>
