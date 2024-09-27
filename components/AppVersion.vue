<template>
  <div>
    <p>
      git commit: <NuxtLink :to="url" target="_blank">{{ commit }}</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig();

const commit = computed(() => runtimeConfig.public.gitCommitHash);
const url = computed(
  () => `https://github.com/henry40408/microflux/commit/${commit.value}`,
);
</script>

<style scoped></style>
