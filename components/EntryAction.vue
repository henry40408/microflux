<script setup lang="ts">
import { useClipboard } from "@vueuse/core";

interface Entry {
  id: number;
  title: string;
  url: string;
}

const props = defineProps<{ entry: Entry }>();

const emit = defineEmits<{
  markAsRead: [ids: number[]];
}>();

const loading = ref(false);
const summarizing = ref(false);
const saved = ref(false);

const summary = ref("");
const tokens = ref(0);

const copyable = computed(
  () => `${props.entry.title}\n\n${props.entry.url}\n\n${summary.value}`,
);
const { copy, copied } = useClipboard({ source: "" });

async function onMarkAsReadClick() {
  try {
    loading.value = true;
    await $fetch("/api/entry", {
      method: "POST",
      body: { op: "mark-as-read", id: props.entry.id },
    });
    emit("markAsRead", [props.entry.id]);
  } catch (err) {
    console.error("failed to mark the entry as read", err);
  } finally {
    loading.value = false;
  }
}

async function onSaveClick() {
  try {
    await $fetch("/api/entry", {
      method: "POST",
      body: { op: "save", id: model.id },
    });
    saved.value = true;
  } catch (err) {
    console.error("failed to save the entry", err);
  }
}

async function onSummarizeClick() {
  try {
    summarizing.value = true;
    const data = await $fetch("/api/summarize", {
      method: "POST",
      body: { url: model.url },
    });
    summary.value = data.summary;
    tokens.value = data.tokens;
  } catch (err) {
    console.error("failed to summarize the entry", err);
  } finally {
    summarizing.value = false;
  }
}
</script>

<template>
  <div>
    <div v-if="loading">loading...</div>
    <div v-else>
      <small>actions</small>
      {{}}
      <a href="#" @click.prevent="onMarkAsReadClick">mark as read</a>
      |
      <span v-if="saved">done!</span>
      <span v-else>
        <a href="#" @click.prevent="onSaveClick">save</a>
      </span>
      |
      <span v-if="summarizing">summarizing...</span>
      <span v-if="!summarizing && !summary">
        <a href="#" @click.prevent="onSummarizeClick">summarize</a>
      </span>
      <span v-if="summary">summarized!</span>
    </div>
    <div v-if="summary">
      <pre><code class="summary">{{ title }}

{{ url }}

{{ summary }}</code></pre>
      <small>token usage </small>
      <span>{{ tokens }}</span>
      <small> summary actions </small>
      <span v-if="copied">copied!</span>
      <span v-else>
        <a href="#" @click.prevent="copy(copyable)">copy</a>
      </span>
    </div>
  </div>
</template>

<style scoped>
.summary {
  text-wrap: wrap;
}
</style>
