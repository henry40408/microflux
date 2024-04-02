<script setup lang="ts">
import type { LinkdingBookmark } from "@/types";

import { useClipboard } from "@vueuse/core";

const props = defineProps<{
  bookmark: LinkdingBookmark;
}>();

const emit = defineEmits<{
  deleted: [ids: number[]];
}>();

const copyable = computed(
  () =>
    `${getTitle(props.bookmark)}\n\n${props.bookmark.url}\n\n${summarizeData.value.summary}`,
);
const { copy, copied } = useClipboard({ source: "" });

const { status: deleteStatus, refresh: executeDelete } = await useLazyFetch(
  "/api/linkding/bookmark",
  {
    key: `delete-${props.bookmark.id}`,
    method: "POST",
    body: { op: "delete", id: props.bookmark.id },
    immediate: false,
    transform: (r) => {
      emit("deleted", [props.bookmark.id]);
      return r;
    },
  },
);

const {
  data: summarizeData,
  status: summarizeStatus,
  refresh: executeSummarize,
} = await useLazyFetch("/api/kagi/summarize", {
  key: `summarize-${props.bookmark.id}`,
  method: "POST",
  body: { url: props.bookmark.url },
  immediate: false,
});

function getTitle(bookmark) {
  return bookmark.title || bookmark.website_title;
}
</script>

<template>
  <div class="actions">
    <small>actions</small>
    {{}}
    <span v-if="deleteStatus === 'pending'">deleting...</span>
    <span v-else-if="deleteStatus === 'error'">failed!</span>
    <span v-else>
      <Confirm @confirmed="executeDelete">delete</Confirm>
    </span>
    |
    <span v-if="summarizeStatus === 'pending'">summarizing...</span>
    <span v-else-if="summarizeStatus === 'error'">
      <a href="#" @click.prevent="executeSummarize">failed, try again</a>
    </span>
    <span v-else-if="summarizeStatus === 'success'">summarized!</span>
    <a v-else href="#" @click.prevent="executeSummarize">summarize</a>
    <div v-if="summarizeData">
      <pre><code class="summary">{{ getTitle(bookmark) }}

{{ bookmark.url }}

{{ summarizeData.summary }}</code></pre>
      <small>token usage</small>
      {{}}
      <span>{{ summarizeData.tokens }}</span>
      {{}}
      <small>summary actions</small>
      {{}}
      <span v-if="copied">copied!</span>
      <span v-else>
        <a href="#" @click.prevent="copy(copyable)">copy</a>
      </span>
    </div>
  </div>
</template>

<style scoped>
.summary {
  text-wrap: wrap;
}

.actions {
  @media (max-width: 640px) {
    text-align: right;
  }
  .summary {
    text-align: left;
  }
}
</style>
