<script setup lang="ts">
import type { PartialLinkdingBookmark } from "~/types";

const model = defineModel<PartialLinkdingBookmark>({ required: true });
</script>

<template>
  <div pb-2>
    <small pr-2>added</small>
    <ClientOnly>
      <span>{{ formatDate(model.date_added) }}</span>
    </ClientOnly>
  </div>
</template>
