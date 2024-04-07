<script setup lang="ts">
import type { LinkdingBookmark } from "~/types";

const model = defineModel<LinkdingBookmark>({ required: true });
</script>

<template>
  <h2 m-0>
    <a :href="model.url" target="_blank" rel="nofollow noopener">
      {{ getLinkdingTitle(model) }}
      <small text-gray-400>#{{ model.id }}</small>
    </a>
  </h2>
</template>
