<script setup lang="ts">
import type { MinifluxEntry } from "@/types";

import { useClipboard } from "@vueuse/core";

const model = defineModel<MinifluxEntry>();

function useToggleRead() {
  const status = ref("idle");
  const execute = async () => {
    try {
      status.value = "pending";
      const nextStatus = model.value.status === "unread" ? "read" : "unread";
      await $fetch("/api/miniflux/entry", {
        method: "POST",
        body: { op: "toggle-read", id: model.value.id, status: nextStatus },
      });
      model.value.status = nextStatus;
      status.value = "success";
    } catch (err) {
      console.error("failed to toggle read", err);
      status.value = "error";
    }
  };
  return { status, execute };
}
const { status: toggleReadStatus, execute: executeToggleRead } =
  useToggleRead();

function useSave() {
  const { status, execute } = useFetch("/api/miniflux/entry", {
    method: "POST",
    body: { op: "save", id: model.value.id },
    immediate: false,
  });
  return { status, execute };
}
const { status: saveStatus, execute: executeSave } = useSave();

function useSummarize() {
  const { data, status, execute } = useFetch("/api/kagi/summarize", {
    method: "POST",
    body: { url: model.value.url },
    immediate: false,
  });
  return { data, status, execute };
}
const {
  data: summarizeData,
  status: summarizeStatus,
  execute: executeSummarize,
} = useSummarize();

const copyable = computed(
  () =>
    `${model.value.title}\n\n${model.value.url}\n\n${summarizeData.value.summary}`,
);
const { copy, copied } = useClipboard({ source: copyable });
</script>

<template>
  <div>
    <div>
      <small>actions</small>
      {{}}
      <span v-if="summarizeStatus === 'pending'">summarizing...</span>
      <span v-else-if="summarizeStatus === 'success'">summarized!</span>
      <span v-else>
        <a href="#" @click.prevent="executeSummarize()">summarize</a>
        {{}}
        <span v-if="summarizeStatus === 'error'">failed!</span>
      </span>
      |
      <span v-if="saveStatus === 'pending'">saving...</span>
      <span v-else-if="saveStatus === 'success'">saved!</span>
      <span v-else>
        <a href="#" @click.prevent="executeSave()">save</a>
        {{}}
        <span v-if="saveStatus === 'error'">failed!</span>
      </span>
      |
      <span v-if="toggleReadStatus === 'pending'">marking...</span>
      <span v-else>
        <a href="#" @click.prevent="executeToggleRead()">
          mark as {{ model.status === "unread" ? "read" : "unread" }}
        </a>
        {{}}
        <span v-if="toggleReadStatus === 'error'">failed!</span>
      </span>
    </div>
    <div v-if="summarizeData">
      <pre><code>{{ model.title }}

{{ model.url }}

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
