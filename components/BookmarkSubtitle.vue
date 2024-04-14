<script setup lang="ts">
import type { PartialLinkdingBookmark } from "~/types";

const model = defineModel<PartialLinkdingBookmark>({ required: true });
</script>

<template>
  <div mb-2>
    <small text-gray-400>{{ model.url }}</small>
  </div>
</template>
