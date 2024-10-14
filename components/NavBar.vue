<template>
  <ClientOnly>
    <details v-if="isMobile">
      <summary>nav</summary>
      <NavBarList />
    </details>
    <fieldset v-else>
      <legend>nav</legend>
      <NavBarList />
    </fieldset>
    <template #fallback>
      <fieldset>
        <legend>nav</legend>
        <NavBarList />
      </fieldset>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { breakpointsTailwind } from "@vueuse/core";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = computed(() => breakpoints.isSmaller("md"));
</script>

<style scoped></style>
