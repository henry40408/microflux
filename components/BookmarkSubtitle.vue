<script setup lang="ts">
import type { CompactLinkdingBookmark } from "~/types";

const model = defineModel<CompactLinkdingBookmark>({ required: true });
</script>

<template>
  <div mb-2>
    <small text-gray-400>{{ model.url }}</small>
  </div>
</template>
