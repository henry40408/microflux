<script setup lang="ts">
import { logEvent } from "histoire/client";
import MyButton from "../components/MyButton.vue";

const loading = ref(false);

async function load() {
  logEvent("click", {});
  loading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 3000));
  loading.value = false;
  logEvent("loaded", {});
}
</script>

<template>
  <Story>
    <MyButton @click="logEvent('click', $event)">button</MyButton>
    <MyButton :loading="loading" @click="load">async button</MyButton>
  </Story>
</template>
