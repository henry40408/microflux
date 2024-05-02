<script setup lang="ts">
import { useClipboard, useLocalStorage } from "@vueuse/core";
import type { PartialMinifluxEntry } from "@/types";

const model = defineModel<PartialMinifluxEntry>({ required: true });
const targetEmoji = computed(() =>
  model.value.status === "read" ? "&#x1F4E9;" : "&#x2705;",
);
const targetStatus = computed(() =>
  model.value.status === "read" ? "unread" : "read",
);
const url = computed(() => model.value.url);

const rbs = useLocalStorage("readability-before-summarization", false);

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
  const status = ref("idle");
  const execute = async () => {
    try {
      status.value = "pending";
      await $fetch("/api/miniflux/entry", {
        method: "POST",
        body: { op: "save", id: model.value.id },
      });
      status.value = "success";
    } catch (err) {
      console.error("failed to save entry", err);
      status.value = "error";
    }
  };
  return { status, execute };
}
const { status: saveStatus, execute: executeSave } = useSave();

const {
  data: summarizeData,
  status: summarizeStatus,
  execute: executeSummarize,
  seconds: summarizeSeconds,
} = useSummarize(url, rbs);

const copyable = computed(() => {
  if (!summarizeData.value) return "";
  return `${model.value.title}\n\n${model.value.url}\n\n${summarizeData.value.summary}`;
});
const { copy, copied } = useClipboard({ source: copyable });
</script>

<template>
  <div>
    <div space-y-2 text-right md:flex md:space-x-2 md:space-y-0>
      <div><small>actions</small></div>
      <div
        flex
        flex-col-reverse
        space-y-2
        space-y-reverse
        text-right
        md:flex
        md:flex-row
        md:space-x-2
        md:space-y-0
      >
        <div>
          <span v-if="toggleReadStatus === 'pending'">marking...</span>
          <span v-else>
            <a
              href="#"
              :class="{ 'text-gray-400': model.status === 'read' }"
              @click.prevent="executeToggleRead()"
            >
              <!-- eslint-disable-next-line vue/no-v-html -->
              <span v-html="targetEmoji" />mark as {{ targetStatus }}
            </a>
            <span v-if="toggleReadStatus === 'error'" pl-1>failed!</span>
          </span>
        </div>
        <div>
          <span v-if="saveStatus === 'pending'">saving...</span>
          <span v-else-if="saveStatus === 'success'">saved!</span>
          <span v-else>
            <a href="#" @click.prevent="executeSave()">&#x1F4BE;save</a>
            <span v-if="saveStatus === 'error'" pl-1>failed!</span>
          </span>
        </div>
        <div>
          <span v-if="summarizeStatus === 'pending'">
            summarizing... {{ summarizeSeconds }}s
          </span>
          <span v-else-if="summarizeStatus === 'success'">
            summarized in {{ summarizeSeconds }}s!
          </span>
          <span v-else>
            <ConfirmButton @confirmed="executeSummarize()">
              &#x1F4D1;summarize
            </ConfirmButton>
            <span v-if="summarizeStatus === 'error'" pl-1>failed!</span>
          </span>
        </div>
      </div>
    </div>
    <div v-if="summarizeData">
      <pre><code text-wrap>{{ model.title }}

{{ model.url }}

{{ summarizeData.summary }}</code></pre>
      <div space-y-2 text-right md:flex md:space-x-2 md:space-y-0 md:text-left>
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
