<template>
  <details ref="contentRef" @toggle="openExpandable">
    <summary>{{ !fullContent ? "content" : "full content" }}</summary>
    <div v-if="pending"><BaseSpinner /></div>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-if="!fullContent" v-html="content" />
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-if="fullContent" v-html="fullContent" />
    <div>
      <BaseButton @click="closeExpandable">collapse</BaseButton>
      {{ " " }}
      <RSSEntryToggleStatus v-model="model" @click="toggleStatus" />
      {{ " " }}
      <BaseButton
        :clear="downloaded.clear"
        :error="downloaded.error"
        :status="downloaded.status.value"
        @click="download"
        >download<template #clear>reset content</template></BaseButton
      >
      {{ " " }}
      <RSSEntrySave v-model="model" />
    </div>
  </details>
</template>

<script setup lang="ts">
import type { MinifluxCompactEntry } from "~/server/trpc/routers/miniflux";

const contentRef = ref<null | HTMLElement>();

const model = defineModel<MinifluxCompactEntry>({ required: true });
watch(
  () => model.value.status,
  (next) => {
    if (next === "read") contentRef.value?.removeAttribute("open");
  },
);

const emit = defineEmits<{ toggleStatus: [read: string] }>();

const { $client } = useNuxtApp();
const fetched = useAsyncData(
  `entry-${model.value.id}-content`,
  () => $client.miniflux.getContent.query(model.value.id),
  { server: false, immediate: false },
);
const content = computed(() => fetched.data.value?.content || "");
const pending = computed(() => fetched.status.value === "pending");

const downloaded = useAsyncData(
  `entry-${model.value.id}-download`,
  () => $client.miniflux.getFullContent.query(model.value.id),
  { server: false, immediate: false },
);
const fullContent = computed(() => downloaded.data.value?.content || "");

function closeExpandable() {
  contentRef.value?.removeAttribute("open");
}

async function download() {
  await downloaded.execute();
  contentRef.value?.scrollIntoView();
}

async function openExpandable() {
  if (fetched.status.value === "success") return;
  await fetched.execute();
}

function toggleStatus(status: string) {
  emit("toggleStatus", status);
}
</script>

<style scoped></style>
