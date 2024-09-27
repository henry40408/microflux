<template>
  <span>
    <BaseConfirm @confirm="clearCache">clear icons</BaseConfirm>
  </span>
</template>

<script setup lang="ts">
import localforage from "localforage";

function clearCache() {
  localforage.clear();
}
</script>

<style scoped></style>
