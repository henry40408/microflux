<script setup lang="ts">
import type { CompactLinkdingBookmark } from "~/types";

const model = defineModel<CompactLinkdingBookmark>({ required: true });
</script>

<template>
  <div pb-2>
    <small pr-2>added</small>
    <ClientOnly>
      <span>{{ formatDate(model.date_added) }}</span>
    </ClientOnly>
  </div>
</template>
