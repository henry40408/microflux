<script setup lang="ts">
import type { LinkdingBookmark } from "@/types";

import { useClipboard } from "@vueuse/core";

const model = defineModel<LinkdingBookmark>();

defineProps<{
  enableNext: boolean;
}>();

const emit = defineEmits<{
  deleted: [ids: number[]];
  deleteAndNext: [ids: number[]];
}>();

const copyable = computed(
  () =>
    `${getLinkdingTitle(model.value)}\n\n${model.value.url}\n\n${summarizeData.value.summary}`,
);
const { copy, copied } = useClipboard({ source: "" });

const { status: deleteStatus, refresh: executeDelete } = await useLazyFetch(
  "/api/linkding/bookmark",
  {
    key: `delete-${model.value.id}`,
    method: "POST",
    body: { op: "delete", id: model.value.id },
    immediate: false,
  },
);

const {
  data: summarizeData,
  status: summarizeStatus,
  refresh: executeSummarize,
} = await useLazyFetch("/api/kagi/summarize", {
  key: `summarize-${model.value.id}`,
  method: "POST",
  body: { url: model.value.url },
  immediate: false,
});

function useReadability() {
  const { data, status, execute } = useFetch("/api/miniflux/readability", {
    method: "POST",
    body: { url: model.value.url },
    immediate: false,
  });
  return { data, status, execute };
}
const {
  data: readabilityData,
  status: readabilityStatus,
  execute: executeReadability,
} = useReadability();

async function onDelete() {
  await executeDelete();
  emit("deleted", [model.value.id]);
}

async function onDeleteAndNext() {
  await executeDelete();
  emit("deleteAndNext", [model.value.id]);
}
</script>

<template>
  <div pb-2 text-right md:flex md:space-x-2 md:text-left>
    <div>
      <small>actions</small>
    </div>
    <div>
      <span v-if="readabilityStatus === 'pending'">reading...</span>
      <span v-else-if="readabilityStatus === 'success'">readable!</span>
      <a v-else href="#" @click.prevent="executeReadability">
        readability
        <span v-if="readabilityStatus === 'error'">failed!</span>
      </a>
    </div>
    <div>
      <span v-if="summarizeStatus === 'pending'">summarizing...</span>
      <span v-else-if="summarizeStatus === 'success'">summarized!</span>
      <a v-else href="#" @click.prevent="executeSummarize">
        summarize
        <span v-if="summarizeStatus === 'error'" pl-1>failed!</span>
      </a>
    </div>
    <div>
      <span v-if="deleteStatus === 'pending'">deleting...</span>
      <span v-else>
        <Confirm @confirmed="onDelete()">delete</Confirm>
        <span v-if="deleteStatus === 'error'" pl-1>failed!</span>
      </span>
    </div>
    <div v-if="enableNext">
      <span v-if="deleteStatus === 'pending'">deleting...</span>
      <span v-else>
        <Confirm @confirmed="onDeleteAndNext()">delete and next</Confirm>
        <span v-if="deleteStatus === 'error'" pl-1>failed!</span>
      </span>
    </div>
  </div>
  <div v-if="readabilityData">
    <h3 mb-2 mt-0>
      readable ({{ formatNumber(readabilityData.length) }} chars)
    </h3>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div px-2 v-html="readabilityData.content" />
  </div>
  <div>
    <div v-if="summarizeData">
      <pre><code text-wrap>{{ getLinkdingTitle(model) }}

{{ model.url }}

{{ summarizeData.summary }}</code></pre>
      <div text-right md:text-left>
        <div>
          <small pr-2>token usage</small>
          <span>{{ summarizeData.tokens }}</span>
        </div>
        <div>
          <small pr-2>summary actions</small>
          <span v-if="copied">copied!</span>
          <span v-else>
            <a href="#" @click.prevent="copy(copyable)">copy</a>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
