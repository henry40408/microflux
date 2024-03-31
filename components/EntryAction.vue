<script setup lang="ts">
import type { MinifluxEntry } from "@/types";

import { useClipboard } from "@vueuse/core";

const props = defineProps<{ entry: MinifluxEntry }>();

const emit = defineEmits<{
  markAsRead: [ids: number[]];
}>();

const copyable = computed(
  () =>
    `${props.entry.title}\n\n${props.entry.url}\n\n${summarizeData.value.summary}`,
);
const { copy, copied } = useClipboard({ source: "" });

const { status: markAsReadStatus, refresh: executeMarkAsRead } =
  await useLazyFetch("/api/miniflux/entry", {
    key: `mark-${props.entry.id}-as-read`,
    method: "POST",
    body: { op: "mark-as-read", id: props.entry.id },
    immediate: false,
    transform: (r) => {
      emit("markAsRead", [props.entry.id]);
      return r;
    },
  });

const { status: saveStatus, refresh: executeSave } = await useLazyFetch(
  "/api/miniflux/entry",
  {
    key: `save-${props.entry.id}`,
    method: "POST",
    body: { op: "save", id: props.entry.id },
    immediate: false,
  },
);

const {
  data: summarizeData,
  status: summarizeStatus,
  refresh: executeSummarize,
} = await useLazyFetch("/api/kagi/summarize", {
  key: `summarize-${props.entry.id}`,
  method: "POST",
  body: { url: props.entry.url },
  immediate: false,
});
</script>

<template>
  <div>
    <div>
      <small>actions</small>
      {{}}
      <span v-if="markAsReadStatus === 'pending'">marking...</span>
      <span v-else-if="markAsReadStatus === 'error'">failed!</span>
      <span v-else-if="markAsReadStatus === 'success'">marked!</span>
      <a v-else href="#" @click.prevent="executeMarkAsRead">mark as read</a>
      |
      <span v-if="saveStatus === 'pending'">saving...</span>
      <span v-else-if="saveStatus === 'error'">failed!</span>
      <span v-else-if="saveStatus === 'success'">saved!</span>
      <span v-else>
        <a href="#" @click.prevent="executeSave">save</a>
      </span>
      |
      <span v-if="summarizeStatus === 'pending'">summarizing...</span>
      <span v-else-if="summarizeStatus === 'success'">summarized!</span>
      <span v-else>
        <a href="#" @click.prevent="executeSummarize">summarize</a>
        <span v-if="summarizeStatus === 'error'">
          {{}}
          <span>failed!</span>
        </span>
      </span>
    </div>
    <div v-if="summarizeData">
      <pre><code class="summary">{{ entry.title }}

{{ entry.url }}

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
</style>
