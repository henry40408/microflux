<template>
  <q-item>
    <q-item-section side>
      <q-btn
        dense
        flat
        :icon="unreadIcon"
        :loading="toggling"
        round
        size="sm"
        @click="toggleStatus"
      />
    </q-item-section>
    <q-item-section>
      <q-item-label>
        {{ pangu(modelValue.title) }}
        <q-btn
          dense
          flat
          icon="open_in_new"
          size="xs"
          @click.prevent="openInNew"
        />
      </q-item-label>
      <q-item-label caption>
        <q-avatar v-if="iconId" size="xs">
          <img :src="`/api/miniflux/icon/${iconId}`" />
        </q-avatar>
        {{ pangu(modelValue.feed.title) }}
        <q-icon name="folder" />
        {{ pangu(modelValue.feed.category.title) }}
        <q-icon name="calendar_today" />
        {{ ago(modelValue.published_at) }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import type { MinifluxCompactEntry } from "~/server/trpc/routers/miniflux";

const { $client } = useNuxtApp();

const toggling = ref(false);

const model = defineModel<MinifluxCompactEntry>({ required: true });

const iconId = computed(() => model.value.feed.icon?.icon_id || "");
const unreadIcon = computed(() =>
  model.value.status === "unread" ? "email" : "drafts",
);

async function markAsRead() {
  await updateStatus("read");
  model.value.status = "read";
}

function openInNew() {
  window.open(model.value.url, "_blank", "noopener,noreferrer");
  void markAsRead();
}

async function toggleStatus() {
  const nextStatus = model.value.status === "unread" ? "read" : "unread";
  await updateStatus(nextStatus);
  model.value.status = nextStatus;
}

async function updateStatus(status: "read" | "unread") {
  try {
    toggling.value = true;
    await $client.miniflux.updateEntries.mutate({
      entryIds: [model.value.id],
      status,
    });
  } catch (err) {
    console.error(err);
  } finally {
    toggling.value = false;
  }
}
</script>

<style scoped></style>
