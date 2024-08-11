<script setup lang="ts">
import type { MinifluxCompactEntry } from "../server/api/miniflux/entries.get";

const model = defineModel<MinifluxCompactEntry>({ required: true });

defineEmits<{ clickCategory: [id: number]; clickFeed: [id: number] }>();

const isRead = computed(() => model.value.status === "read");

const entryTitle = ref<HTMLElement | null>(null);
const summary = ref("");
const source = computed(
  () => `${model.value.title}

${model.value.url}

${summary.value}`,
);
const { copy, copied } = useClipboard({ source });

function onToggleStatus(s: string) {
  if (s === "read") {
    entryTitle.value?.scrollIntoView();
  }
}
</script>

<template>
  <div space-y-2>
    <div ref="entryTitle">
      <EntryTitle v-model="model" />
    </div>
    <div space-y-2>
      <div
        space-y-2
        text-right
        md:flex
        md:items-center
        md:space-x-2
        md:space-y-0
      >
        <div space-x-1 items-center>
          <small>feed</small>
          <a href="#" @click.prevent="$emit('clickFeed', modelValue.feed.id)">{{
            modelValue.feed.title
          }}</a>
        </div>
        <div space-x-1 items-center>
          <small>category</small>
          <a
            href="#"
            @click.prevent="$emit('clickCategory', modelValue.feed.category.id)"
            >{{ modelValue.feed.category.title }}</a
          >
        </div>
        <div space-x-1 items-center>
          <small>published at</small>
          <DateTime :datetime="modelValue.published_at" />
        </div>
      </div>
      <div class="my-controls-with-label">
        <small block>actions</small>
        <div class="my-controls">
          <ToggleStatusButton v-model="model" />
          <SummarizeButton v-if="!isRead" v-model="summary" :url="model.url" />
          <SaveButton v-if="!isRead" v-model="model" />
        </div>
      </div>
    </div>
    <div v-if="!isRead && summary" space-y-2>
      <pre m-0><code text-wrap>{{ pangu(source) }}</code></pre>
      <MyButton block text-right md:text-left :done="copied" @click="copy">
        copy to clipboard<template #done>copied!</template>
      </MyButton>
    </div>
    <div>
      <EntryContent v-model="model" @toggle-status="onToggleStatus" />
    </div>
  </div>
</template>
