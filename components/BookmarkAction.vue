<script setup lang="ts">
import type { LinkdingBookmark } from "@/types";

import { useClipboard, useLocalStorage } from "@vueuse/core";

const rdbContent = useLocalStorage("readability-content", "content");
const rbs = useLocalStorage("readability-before-summarization", false);

const model = defineModel<LinkdingBookmark>({ required: true });
const url = computed(() => model.value.url);

defineProps<{
  enableNext: boolean;
}>();

const emit = defineEmits<{
  deleted: [ids: number[]];
  deleteAndNext: [ids: number[]];
}>();

function useDelete() {
  const status = ref("idle");
  const execute = async () => {
    try {
      status.value = "pending";
      await $fetch("/api/linkding/bookmark", {
        method: "POST",
        body: { op: "delete", id: model.value.id },
      });
      status.value = "success";
    } catch (err) {
      console.error("failed to delete bookmark", err);
      status.value = "error";
    }
  };
  return { status, execute };
}
const { status: deleteStatus, execute: executeDelete } = useDelete();

const {
  data: rdbData,
  status: readabilityStatus,
  execute: executeReadability,
} = useReadability(url);

const {
  data: summarizeData,
  status: summarizeStatus,
  execute: executeSummarize,
  seconds: summarizeSeconds,
} = useSummarize(url, rbs);

const copyable = computed(() => {
  if (!summarizeData.value) return "";
  return `${getLinkdingTitle(model.value)}\n\n${model.value.url}\n\n${summarizeData.value.summary}`;
});
const { copy, copied } = useClipboard({ source: "" });

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
  <div space-y-2 text-right md:flex md:space-x-2 md:space-y-0 md:text-left>
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
      <span v-if="summarizeStatus === 'pending'">
        summarizing... {{ summarizeSeconds }}s
      </span>
      <span v-else-if="summarizeStatus === 'success'">
        summarized in {{ summarizeSeconds }}s!
      </span>
      <span v-else>
        <a href="#" @click.prevent="executeSummarize">summarize</a>
        <span v-if="summarizeStatus === 'error'" pl-1>failed!</span>
      </span>
    </div>
    <div>
      <span v-if="deleteStatus === 'pending'">deleting...</span>
      <span v-else>
        <ConfirmButton @confirmed="onDelete()">delete</ConfirmButton>
        <span v-if="enableNext">
          (<ConfirmButton @confirmed="onDeleteAndNext()">and next</ConfirmButton
          >)
        </span>
        <span v-if="deleteStatus === 'error'" pl-1>failed!</span>
      </span>
    </div>
  </div>
  <div>
    <div v-if="summarizeData">
      <pre><code text-wrap>{{ getLinkdingTitle(model) }}

{{ model.url }}

{{ summarizeData.summary }}</code></pre>
      <div text-right md:text-left>
        <div>
          <small pr-2>token usage</small>
          <span>{{ formatNumber(summarizeData.tokens) }}</span>
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
    <div v-if="rdbData">
      <h3 my-4>readable ({{ formatNumber(rdbData.length) }} chars)</h3>
      <div border-1 border-dashed border-black dark:border-white p-2>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-if="rdbContent === 'content'" v-html="rdbData.content" />
        <span v-if="rdbContent === 'textContent'">
          {{ rdbData.textContent }}
        </span>
      </div>
    </div>
  </div>
</template>
