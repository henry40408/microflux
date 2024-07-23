<script setup lang="ts">
import { logEvent } from "histoire/client";
import MyConfirm from "../components/MyConfirm.vue";
</script>

<template>
  <Story>
    <MyConfirm @confirm="logEvent('confirm', $event)">delete</MyConfirm>
    <MyConfirm repeated @confirm="logEvent('confirm', $event)"
      >repeated delete</MyConfirm
    >
  </Story>
</template>
