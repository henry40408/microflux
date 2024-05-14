<script setup lang="ts">
import pangu from "pangu";
import { useElementVisibility } from "@vueuse/core";
import type { CompactMinifluxEntry } from "~/types";

const entryRef = ref(null);

const { readOnScroll } = useOptions();
const props = defineProps<{ scrollingDown: boolean }>();

const model = defineModel<CompactMinifluxEntry>({ required: true });
const emit = defineEmits<{
  categoryClick: [id: number];
  contentCollapsed: [id: number];
  feedClick: [id: number];
  setModelRef: [el: HTMLElement];
}>();

async function markAsRead() {
  try {
    await $fetch("/api/miniflux/entry", {
      method: "POST",
      body: { op: "toggle-read", id: model.value.id, status: "read" },
    });
    model.value.status = "read";
  } catch (err) {
    console.error("failed to mark as read", err);
  }
}

const target = ref(null);
const isVisible = useElementVisibility(target);
watch(isVisible, (next, prev) => {
  if (
    readOnScroll.value &&
    props.scrollingDown &&
    !next && // invisible
    prev && // visible
    model.value.status === "unread"
  ) {
    markAsRead();
  }
});

onMounted(() => {
  if (entryRef.value) {
    emit("setModelRef", entryRef.value);
  }
});
</script>

<template>
  <div ref="target">
    <h2 ref="entryRef">
      <a
        :class="{ 'text-gray-400': model.status === 'read' }"
        :href="model.url"
        target="_blank"
        rel="nofollow noopener"
      >
        {{ pangu.spacing(model.title) }}
        <small text-gray-400> #{{ model.id }}</small>
      </a>
    </h2>
    <div
      pb-2
      space-y-2
      text-right
      md:flex
      md:flex-wrap
      md:space-y-0
      md:text-nowrap
    >
      <div md:mr-2>
        <small pr-2>feed</small>
        <a href="#" @click.prevent="emit('feedClick', model.feed.id)">
          {{ model.feed.title }}
        </a>
      </div>
      <div md:mr-2>
        <small pr-2>category</small>
        <a
          href="#"
          @click.prevent="emit('categoryClick', model.feed.category.id)"
        >
          {{ model.feed.category.title }}
        </a>
      </div>
    </div>
    <EntryAction v-model="model" />
    <EntryContent
      v-model="model"
      @collapsed="emit('contentCollapsed', model.id)"
    >
      <EntryAction v-model="model" in-content pb-2 />
    </EntryContent>
  </div>
</template>
