<template>
  <div>
    <p>git commit: {{ runtimeConfig.public.gitCommitHash }}</p>
  </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig();
</script>

<style scoped></style>
