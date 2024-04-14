<script setup lang="ts">
import type { PartialLinkdingBookmark } from "~/types";

const model = defineModel<PartialLinkdingBookmark>({ required: true });
</script>

<template>
  <div>
    <blockquote v-if="getLinkdingDescription(model)" my-4>
      {{ getLinkdingDescription(model) }}
    </blockquote>
    <div v-else mb-4 />
  </div>
</template>
