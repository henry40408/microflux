<script setup lang="ts">
import type { LinkdingBookmark } from "@/types";

import { useClipboard } from "@vueuse/core";

const model = defineModel<LinkdingBookmark>();
const url = computed(() => model.value.url);

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
  data: readabilityData,
  status: readabilityStatus,
  execute: executeReadability,
} = useReadability(url);

const {
  data: summarizeData,
  status: summarizeStatus,
  execute: executeSummarize,
} = useSummarize(url);

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
        <span v-if="enableNext">
          (<Confirm @confirmed="onDeleteAndNext()">and next</Confirm>)
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
    <div v-if="readabilityData">
      <h3 my-4>readable ({{ formatNumber(readabilityData.length) }} chars)</h3>
      <div border-1 border-dashed border-black dark:border-white px-2>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="readabilityData.content" />
      </div>
    </div>
  </div>
</template>
