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
    timeout: 30000,
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
    <div text-right space-y-2 md:flex md:space-x-2 md:space-y-0>
      <div><small>actions</small></div>
      <div>
        <span v-if="toggleReadStatus === 'pending'">marking...</span>
        <span v-else>
          <a
            href="#"
            :class="{ 'text-gray-400': model.status === 'read' }"
            @click.prevent="executeToggleRead()"
          >
            mark as {{ model.status === "unread" ? "read" : "unread" }}
          </a>
          <span v-if="toggleReadStatus === 'error'" pl-1>failed!</span>
        </span>
      </div>
      <div>
        <span v-if="saveStatus === 'pending'">saving...</span>
        <span v-else-if="saveStatus === 'success'">saved!</span>
        <span v-else>
          <a href="#" @click.prevent="executeSave()">save</a>
          <span v-if="saveStatus === 'error'" pl-1>failed!</span>
        </span>
      </div>
      <div>
        <span v-if="summarizeStatus === 'pending'">summarizing...</span>
        <span v-else-if="summarizeStatus === 'success'">summarized!</span>
        <span v-else>
          <a href="#" @click.prevent="executeSummarize()">summarize</a>
          <span v-if="summarizeStatus === 'error'" pl-1>failed!</span>
        </span>
      </div>
    </div>
    <div v-if="summarizeData">
      <pre><code text-wrap>{{ model.title }}

{{ model.url }}

{{ summarizeData.summary }}</code></pre>
      <div text-right md:text-left md:flex md:space-x-1>
        <div>
          <small pr-1>token usage</small>
          <span>{{ summarizeData.tokens }}</span>
        </div>
        <div>
          <small>summary actions</small>
        </div>
        <div>
          <span v-if="copied">copied!</span>
          <span v-else>
            <a href="#" @click.prevent="copy(copyable)">copy</a>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
