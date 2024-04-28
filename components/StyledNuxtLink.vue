<script setup lang="ts">
defineProps<{ to: string }>();
</script>

<template>
  <NuxtLink :to="to" exact-active-class="text-black dark:text-white">
    <slot />
  </NuxtLink>
</template>
