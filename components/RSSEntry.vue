<template>
  <v-card :loading="loading" class="mb-4">
    <template #prepend>
      <v-avatar
        v-if="model.feed.icon"
        size="24"
        :image="`/api/miniflux/icon/${model.feed.icon.icon_id}`"
      />
    </template>
    <template #title>
      <div class="text-subtitle-2">{{ model.feed.title }}</div>
    </template>
    <template #append>
      <v-btn
        flat
        :icon="modelValue.status === 'unread' ? 'mdi-check' : 'mdi-undo'"
        @click="toggleStatus"
      />
      <v-btn
        :href="model.url"
        flat
        icon="mdi-open-in-new"
        rel="noopener noreferrer"
        target="_blank"
      />
    </template>
    <template #text>
      <div
        class="mb-4 text-h5"
        :class="{ 'text-disabled': modelValue.status === 'read' }"
      >
        {{ model.title }}
      </div>
      <div class="d-flex flex-wrap ga-2">
        <v-chip size="small" prepend-icon="mdi-calendar-blank">
          {{ ago(model.published_at) }}
        </v-chip>
        <v-chip size="small" prepend-icon="mdi-rss">
          {{ model.feed.title }}
        </v-chip>
        <v-chip size="small" prepend-icon="mdi-folder">
          {{ model.feed.category.title }}
        </v-chip>
      </div>
    </template>
    <v-card-actions>
      <v-btn @click.prevent="loadContent">read</v-btn>
    </v-card-actions>
    <v-expand-transition v-model="content">
      <div v-if="content">
        <v-divider />
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="ma-4 my-content" v-html="content" />
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup lang="ts">
import type { MinifluxCompactEntry } from "~/server/trpc/routers/miniflux";

const model = defineModel<MinifluxCompactEntry>({ required: true });

const { $client } = useNuxtApp();
const contentFetched = useAsyncData(
  `entry:${model.value.id}:content`,
  () => $client.miniflux.getContent.query(model.value.id),
  { immediate: false, server: false },
);
const content = computed(() => contentFetched.data.value?.content || "");

async function loadContent() {
  await contentFetched.execute();
}

const statusToggled = useAsyncData(
  `entry:${model.value.id}:status`,
  () =>
    $client.miniflux.updateEntries.mutate({
      entryIds: [model.value.id],
      status: model.value.status === "unread" ? "read" : "unread",
    }),
  { immediate: false, server: false },
);
async function toggleStatus() {
  const nextStatus = model.value.status === "unread" ? "read" : "unread";
  await statusToggled.execute();
  model.value.status = nextStatus;
}

const loading = computed(() =>
  [contentFetched.status.value, statusToggled.status.value].includes("pending"),
);
</script>

<style>
.my-content img {
  width: 100%;
}
</style>
