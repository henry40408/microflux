<script setup lang="ts">
import type { MinifluxCompactEntry } from "~/server/trpc/routers/miniflux";

const model = defineModel<MinifluxCompactEntry>({ required: true });

defineEmits<{ clickCategory: [id: number]; clickFeed: [id: number] }>();

const entryTitle = ref<HTMLElement | null>(null);

const summary = useSummarize(model.value.url);
const source = computed(
  () =>
    `${model.value.title}

${summary.data.value?.finalUrl || ""}

${pangu(summary.data.value?.summary || "")}`,
);
const { copy, copied } = useClipboard({ source });

function onScrollToEntry() {
  entryTitle.value?.scrollIntoView();
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
          <MyButton
            :clear="summary.clear"
            :done="summary.done.value"
            :error="summary.error"
            :pending="summary.pending.value"
            @click="summary.execute"
            >summarize<template #clear>reset summary</template></MyButton
          >
          <SaveButton v-model="model" />
        </div>
      </div>
    </div>
    <div v-if="summary.done.value" space-y-2>
      <pre m-0><code text-wrap>{{ source }}</code></pre>
      <MyButton block text-right md:text-left :done="copied" @click="copy">
        copy to clipboard<template #clear>copied!</template>
      </MyButton>
    </div>
    <div>
      <EntryContent v-model="model" @scroll-to-entry="onScrollToEntry" />
    </div>
  </div>
</template>
