<template>
  <q-item>
    <q-item-section side>
      <q-btn
        flat
        :icon="unreadIcon"
        :loading="toggling"
        round
        @click="toggleStatus"
      />
    </q-item-section>
    <q-item-section>
      <q-item-label class="items-center row">
        <a
          class="text-body2 text-primary"
          :class="{ 'text-secondary': isRead }"
          href="#"
          @click.prevent="openContent"
        >
          {{ pangu(modelValue.title) }}
        </a>
        <q-btn
          flat
          icon="open_in_new"
          round
          size="sm"
          @click.prevent="openInNew"
        />
      </q-item-label>
      <q-item-label caption class="q-gutter-xs row">
        <div class="items-center q-gutter-x-xs row">
          <q-avatar v-if="iconId" size="xs">
            <img :src="`/api/miniflux/icon/${iconId}`" />
          </q-avatar>
          <div>{{ pangu(modelValue.feed.title) }}</div>
        </div>
        <div class="items-center q-gutter-x-xs row">
          <q-icon name="folder" />
          <div>{{ pangu(modelValue.feed.category.title) }}</div>
        </div>
        <div class="items-center q-gutter-x-xs row">
          <q-icon name="calendar_today" />
          <div>{{ ago(modelValue.published_at) }}</div>
        </div>
      </q-item-label>
    </q-item-section>
  </q-item>
  <q-dialog
    v-model="showContent"
    full-height
    full-width
    position="right"
    @before-show="loadContent()"
  >
    <q-card>
      <q-card-section class="items-center q-pb-none row">
        <div class="text-h6">
          <NuxtLink
            class="text-primary"
            external
            target="_blank"
            :to="modelValue.url"
          >
            {{ modelValue.title }}
          </NuxtLink>
        </div>
        <q-space />
        <q-btn
          v-if="!fullContent"
          dense
          flat
          icon="download"
          round
          @click="loadFullContent"
        />
        <q-btn v-else dense flat icon="undo" round @click="fullContent = ''" />
        <q-btn v-close-popup dense flat icon="close" round />
      </q-card-section>
      <q-card-section class="column q-gutter-xs row-sm">
        <div class="items-center q-gutter-x-xs row">
          <q-avatar v-if="iconId" size="xs">
            <img :src="`/api/miniflux/icon/${iconId}`" />
          </q-avatar>
          <div>{{ pangu(modelValue.feed.title) }}</div>
        </div>
        <div class="items-center q-gutter-x-xs row">
          <q-icon name="folder" />
          <div>{{ pangu(modelValue.feed.category.title) }}</div>
        </div>
        <div class="items-center q-gutter-x-xs row">
          <q-icon name="calendar_today" />
          <div>{{ ago(modelValue.published_at) }}</div>
        </div>
      </q-card-section>
      <q-card-section>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-if="!fullContent" class="my-content" v-html="content" />
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-else class="my-content" v-html="fullContent" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import type { MinifluxCompactEntry } from "~/server/trpc/routers/miniflux";

const { $client } = useNuxtApp();

const content = ref("");
const fullContent = ref("");
const showContent = ref(false);
const toggling = ref(false);

const model = defineModel<MinifluxCompactEntry>({ required: true });

const iconId = computed(() => model.value.feed.icon?.icon_id || "");
const isRead = computed(() => model.value.status === "read");
const unreadIcon = computed(() => (isRead.value ? "drafts" : "email"));

const contentFetched = useAsyncData(
  `entry:${model.value.id}:content`,
  () => $client.miniflux.getContent.query(model.value.id),
  { immediate: false, server: false },
);
const fullContentFetched = useAsyncData(
  `entry:${model.value.id}:full-content`,
  () => $client.miniflux.getFullContent.query(model.value.id),
  { immediate: false, server: false },
);

async function loadContent() {
  if (content.value) return;
  await contentFetched.execute();
  content.value = contentFetched.data.value?.content || "";
}

async function loadFullContent() {
  if (fullContent.value) return;
  await fullContentFetched.execute();
  fullContent.value = fullContentFetched.data.value?.content || "";
}

async function markAsRead() {
  await updateStatus("read");
  model.value.status = "read";
}

function openContent() {
  showContent.value = true;
  void markAsRead();
}

function openInNew() {
  window.open(model.value.url, "_blank", "noopener,noreferrer");
  void markAsRead();
}

async function toggleStatus() {
  const nextStatus = isRead.value ? "unread" : "read";
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

<style lang="scss">
.my-content {
  $h6-font-size: 1rem;
  $scale-factor: 1.2;
  $line-height-multiplier: 1.2;

  @mixin heading-size($level) {
    $font-size: $h6-font-size * pow($scale-factor, 6 - $level);
    font-size: $font-size;
    line-height: $font-size * $line-height-multiplier;
  }

  h1 {
    @include heading-size(1);
  }

  h2 {
    @include heading-size(2);
  }

  h3 {
    @include heading-size(3);
  }

  h4 {
    @include heading-size(4);
  }

  h5 {
    @include heading-size(5);
  }

  h6 {
    @include heading-size(6);
  }

  img {
    max-width: 100%;
  }
}
</style>
