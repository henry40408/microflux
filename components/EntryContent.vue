<script setup lang="ts">
import { secondsToMilliseconds } from "date-fns";

import type { MinifluxCompactEntry } from "../server/api/miniflux/entries.get";

const model = defineModel<MinifluxCompactEntry>({ required: true });
const emit = defineEmits<{ "scroll-to-entry": [] }>();

const expandableRef = ref<HTMLDetailsElement | null>(null);
watch(
  () => model.value.status,
  (next) => {
    if (next === "read") expandableRef.value?.removeAttribute("open");
  },
);
const fullContent = ref("");
const fullContentRef = ref<HTMLElement | null>(null);

const fetched = await useLazyFetch(`/api/miniflux/entries/${model.value.id}`, {
  key: `entry-content-${model.value.id}`,
  immediate: false,
  server: false,
  timeout: secondsToMilliseconds(30),
});

function onCollapse() {
  expandableRef.value?.removeAttribute("open");
  emit("scroll-to-entry");
}

async function onDetailsToggle() {
  if (fetched.data.value) return;
  await fetched.execute();
}

function onFetchContent() {
  fullContentRef.value?.scrollIntoView();
}

function onToggleStatus(s: string) {
  if (s === "read") {
    expandableRef.value?.removeAttribute("open");
    emit("scroll-to-entry");
  }
}
</script>

<template>
  <details ref="expandableRef" @toggle="onDetailsToggle">
    <summary>content</summary>
    <div>
      <div ref="fullContentRef" mb-4>
        <div v-if="!fullContent">
          <span v-if="fetched.status.value === 'pending'">...</span>
          <span v-if="fetched.error">{{ fetched.error }}</span>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-if="fetched.data.value" v-html="fetched.data.value.content" />
        </div>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-if="fullContent" v-html="fullContent" />
      </div>
      <div class="my-controls">
        <MyButton @click="onCollapse">collapse</MyButton>
        <ToggleStatusButton v-model="model" @toggle-status="onToggleStatus" />
        <FetchContentButton
          :id="modelValue.id"
          v-model="fullContent"
          @fetch-content="onFetchContent"
        />
        <SaveButton v-model="model" />
      </div>
    </div>
  </details>
</template>
