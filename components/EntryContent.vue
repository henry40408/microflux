<script setup lang="ts">
import { secondsToMilliseconds } from "date-fns";

import type { MinifluxCompactEntry } from "../server/api/miniflux/entries.get";

const model = defineModel<MinifluxCompactEntry>({ required: true });
const emit = defineEmits<{ "toggle-status": [state: string] }>();

const expandableRef = ref<HTMLDetailsElement | null>(null);
watch(
  () => model.value.status,
  (next) => {
    if (next === "read") expandableRef.value?.removeAttribute("open");
  },
);
const fullContent = ref("");
const fullContentRef = ref<HTMLElement | null>(null);

const { data, error, status, execute } = await useLazyFetch(
  `/api/miniflux/entries/${model.value.id}`,
  {
    key: `entry-content-${model.value.id}`,
    immediate: false,
    server: false,
    timeout: secondsToMilliseconds(30),
  },
);

async function onDetailsToggle() {
  if (data.value) return;
  await execute();
}

function onFetchContent() {
  fullContentRef.value?.scrollIntoView();
}

function onToggleStatus(s: string) {
  if (s === "read") {
    expandableRef.value?.removeAttribute("open");
    emit("toggle-status", s);
  }
}
</script>

<template>
  <details ref="expandableRef" @toggle="onDetailsToggle">
    <summary>content</summary>
    <div>
      <div ref="fullContentRef" mb-4>
        <div v-if="!fullContent">
          <span v-if="status === 'pending'">...</span>
          <span v-if="status === 'error'">{{ error }}</span>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-if="data" v-html="data.content" />
        </div>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-if="fullContent" v-html="fullContent" />
      </div>
      <div class="my-controls">
        <ToggleStatusButton v-model="model" @toggle-status="onToggleStatus" />
        <FetchContentButton
          :id="modelValue.id"
          v-model="fullContent"
          @click="onFetchContent"
        />
      </div>
    </div>
  </details>
</template>
