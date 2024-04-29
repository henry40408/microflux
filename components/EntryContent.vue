<script setup lang="ts">
import { useToggle, useLocalStorage } from "@vueuse/core";

import type { PartialMinifluxEntry } from "~/types";

const rdbContent = useLocalStorage("readability-content", "content");

const model = defineModel<PartialMinifluxEntry>({ required: true });
const url = computed(() => model.value.url);

const emit = defineEmits<{
  collapsed: [id: number];
}>();

const [opened, toggle] = useToggle(false);

const {
  data: rdbData,
  status: readabilityStatus,
  execute: executeReadability,
} = useReadability(url);

function useReadAndCollapse() {
  const status = ref("idle");
  const execute = async () => {
    try {
      status.value = "pending";
      await $fetch("/api/miniflux/entry", {
        method: "POST",
        body: { op: "toggle-read", id: model.value.id, status: "read" },
      });
      onCollapse();
      model.value.status = "read";
      status.value = "success";
    } catch (err) {
      console.error("failed to mark as read and collapse", err);
      status.value = "error";
    }
  };
  return { status, execute };
}
const { status: readAndCollapseStatus, execute: executeReadAndCollapse } =
  useReadAndCollapse();

function onCollapse() {
  toggle(false);
  emit("collapsed", model.value.id);
}
</script>

<template>
  <details :open="opened">
    <summary @click.prevent="toggle()">content</summary>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-if="opened" pb-2 v-html="model.content" />
    <div v-if="rdbData">
      <h3 my-2>readable ({{ formatNumber(rdbData.length) }} chars)</h3>
      <div border-1 border-dashed border-black mb-2 p-2 dark:border-white>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-if="rdbContent === 'content'" v-html="rdbData.content" />
        <span v-if="rdbContent === 'textContent'">
          {{ rdbData.textContent }}
        </span>
      </div>
    </div>
    <slot />
    <div
      flex
      flex-col-reverse
      space-y-2
      space-y-reverse
      text-right
      md:flex-row
      md:space-x-2
      md:space-y-0
      md:text-left
    >
      <div>
        <a href="#" @click.prevent="onCollapse()">&#x1F53C;collapse</a>
        (<span>
          <span v-if="readAndCollapseStatus === 'pending'">marking..</span>
          <a v-else href="#" @click.prevent="executeReadAndCollapse"
            >and &#x2705;mark as read</a
          ></span
        >)
      </div>
      <div>
        <span v-if="readabilityStatus === 'pending'">reading...</span>
        <span v-else-if="readabilityStatus === 'success'">readable!</span>
        <span v-else>
          <a href="#" @click.prevent="executeReadability">
            &#x1F4D6;readability
          </a>
          <span v-if="readabilityStatus === 'error'" pl-1>failed!</span>
        </span>
      </div>
    </div>
  </details>
</template>
