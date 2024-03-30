<script setup lang="ts">
import { useClipboard } from "@vueuse/core";

interface Bookmark {
  url: string;
}

const props = defineProps<{
  bookmark: Bookmark;
}>();

const copyable = computed(
  () =>
    `${getTitle(props.bookmark)}\n\n${props.bookmark.url}\n\n${summarizeData.value.summary}`,
);
const { copy, copied } = useClipboard({ source: "" });

const {
  data: summarizeData,
  status: summarizeStatus,
  refresh: executeSummarize,
} = await useLazyFetch("/api/kagi/summarize", {
  method: "POST",
  body: { url: props.bookmark.url },
  immediate: false,
});

function getTitle(bookmark) {
  return bookmark.title || bookmark.website_title;
}
</script>

<template>
  <div>
    <small>actions</small>
    {{}}
    <span v-if="summarizeStatus === 'pending'">summarizing...</span>
    <span v-else-if="summarizeStatus === 'error'">failed!</span>
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
</style>
