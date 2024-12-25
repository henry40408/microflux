<template>
  <q-item>
    <q-item-section side>
      <q-btn
        :color="unreadColor"
        flat
        :icon="unreadIcon"
        :loading="toggling"
        round
        @click="toggleStatus"
      />
    </q-item-section>
    <q-item-section>
      <q-item-label>
        <a :class="titleClass" href="#" @click.prevent="openContent">
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
      <q-item-label caption>
        <q-chip
          clickable
          size="sm"
          @click="$emit('selectFeed', String(modelValue.feed.id))"
        >
          <q-avatar v-if="iconId">
            <img :src="`/api/miniflux/icon/${iconId}`" />
          </q-avatar>
          {{ pangu(modelValue.feed.title) }}
        </q-chip>
        <q-chip
          clickable
          icon="folder"
          size="sm"
          @click="$emit('selectCategory', String(modelValue.feed.category.id))"
        >
          {{ pangu(modelValue.feed.category.title) }}
        </q-chip>
        <q-chip icon="calendar_today" size="sm">
          {{ ago(modelValue.published_at) }}
        </q-chip>
      </q-item-label>
    </q-item-section>
  </q-item>
  <q-dialog
    v-model="showContent"
    full-height
    position="right"
    @before-show="loadContent()"
  >
    <q-card>
      <q-card-section class="items-center q-pb-none row">
        <q-space />
        <q-btn
          dense
          flat
          icon="save"
          :loading="loading"
          round
          @click="saved.execute()"
        />
        <q-btn
          v-if="!summary"
          dense
          flat
          icon="bolt"
          :loading="summarizing"
          round
          @click="summarized.execute()"
        />
        <q-btn
          v-else
          dense
          flat
          icon="undo"
          round
          @click="summarized.clear()"
        />
        <q-btn
          v-if="!fullContent"
          dense
          flat
          icon="download"
          :loading="loading"
          round
          @click="loadFullContent"
        />
        <q-btn v-else dense flat icon="undo" round @click="fullContent = ''" />
        <q-btn v-close-popup dense flat icon="close" round />
      </q-card-section>
      <q-card-section class="items-center q-pb-none row">
        <NuxtLink
          class="text-h5"
          :class="titleClass"
          external
          target="_blank"
          :to="modelValue.url"
        >
          {{ modelValue.title }}
        </NuxtLink>
      </q-card-section>
      <q-card-section class="column q-gutter-xs row-sm">
        <q-chip>
          <q-avatar v-if="iconId">
            <img :src="`/api/miniflux/icon/${iconId}`" />
          </q-avatar>
          {{ pangu(modelValue.feed.title) }}
        </q-chip>
        <q-chip icon="folder">
          {{ pangu(modelValue.feed.category.title) }}
        </q-chip>
        <q-chip icon="calendar_today">
          {{ ago(modelValue.published_at) }}
        </q-chip>
      </q-card-section>
      <q-card-section v-if="copySource" class="my-max-width">
        <div class="q-mb-md text-h6">Summary</div>
        <div>
          <pre class="my-text-wrap q-pa-md">{{ copySource }}</pre>
        </div>
        <div class="row">
          <q-space />
          <q-btn flat icon="content_copy" @click="copy()" />
        </div>
      </q-card-section>
      <q-card-section class="my-max-width">
        <div class="q-mb-md text-h6">Content</div>
        <!-- eslint-disable vue/no-v-html -->
        <div
          v-if="!fullContent"
          class="my-content text-body1"
          v-html="content"
        />
        <!-- eslint-enable vue/no-v-html -->
        <!-- eslint-disable vue/no-v-html -->
        <div v-else class="my-content text-body1" v-html="fullContent" />
        <!-- eslint-enable vue/no-v-html -->
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useQuasar } from "quasar";

import type { MinifluxCompactEntry } from "~/server/trpc/routers/miniflux";

const $q = useQuasar();
const { $client } = useNuxtApp();

const content = ref("");
const fullContent = ref("");
const showContent = ref(false);
const toggling = ref(false);

const model = defineModel<MinifluxCompactEntry>({ required: true });
defineEmits<{
  selectCategory: [id: string];
  selectFeed: [id: string];
}>();

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
const saved = useAsyncData(
  `entry:${model.value.id}:save`,
  () => $client.miniflux.saveEntry.mutate(model.value.id),
  { immediate: false, server: false },
);
const summarized = useSummary(model.value.url);
const summarizing = computed(() => summarized.status.value === "pending");
const summary = computed(
  () => summarized.data.value?.[0].output_data.markdown || "",
);
const unreadColor = computed(() =>
  summary.value ? "positive" : $q.dark.isActive ? "white" : "dark",
);
const titleClass = computed(() =>
  $q.dark.isActive ? "text-white" : "text-dark",
);
const copySource = computed(() =>
  summary.value
    ? `${model.value.title}

${summarized.data.value?.[1].url}

${pangu(summary.value)}`
    : "",
);
const { copy, copied } = useClipboard({ source: copySource });
watch(
  () => copied.value,
  (next, prev) => {
    if (next && !prev)
      $q.notify({
        color: "positive",
        icon: "info",
        message: "Copied!",
        position: "top",
      });
  },
);

async function loadContent() {
  if (content.value) return;
  try {
    await contentFetched.execute();
    content.value = contentFetched.data.value?.content || "";
  } catch (err) {
    addError(err);
  }
}

async function loadFullContent() {
  if (fullContent.value) return;
  try {
    await fullContentFetched.execute();
    fullContent.value = fullContentFetched.data.value?.content || "";
  } catch (err) {
    addError(err);
  }
}

async function markAsRead() {
  try {
    await updateStatus("read");
    model.value.status = "read";
  } catch (err) {
    addError(err);
  }
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
  try {
    const nextStatus = isRead.value ? "unread" : "read";
    await updateStatus(nextStatus);
    model.value.status = nextStatus;
  } catch (err) {
    addError(err);
  }
}

async function updateStatus(status: "read" | "unread") {
  try {
    toggling.value = true;
    await $client.miniflux.updateEntries.mutate({
      entryIds: [model.value.id],
      status,
    });
  } catch (err) {
    addError(err);
  } finally {
    toggling.value = false;
  }
}

const loading = computed(() =>
  [
    contentFetched.status.value,
    fullContentFetched.status.value,
    saved.status.value,
  ].includes("pending"),
);

watch(
  () => [
    contentFetched.error.value,
    fullContentFetched.error.value,
    saved.error.value,
    summarized.error.value,
  ],
  (errors) => {
    for (const error of errors) {
      if (error) addError(error);
    }
  },
);
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

  a,
  a:visited {
    color: black;
    @media (prefers-color-scheme: dark) {
      color: white;
    }
  }
}

.my-max-width {
  max-width: 100vw;
}

.my-text-wrap {
  text-wrap: wrap;
}
</style>
