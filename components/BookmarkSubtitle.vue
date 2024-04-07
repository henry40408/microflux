<script setup lang="ts">
import type { LinkdingBookmark } from "~/types";

const model = defineModel<LinkdingBookmark>({ required: true });
</script>

<template>
  <div mb-2>
    <small text-gray-400>{{ model.url }}</small>
  </div>
</template>
