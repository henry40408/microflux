<script setup lang="ts">
import { useClipboard } from "@vueuse/core";

const props = defineProps({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
});
const emit = defineEmits<{
  markAsRead: [id: number];
  open: [id: number];
}>();

const loading = ref(false);
const summarizing = ref(false);
const saved = ref(false);

const summary = ref("");
const tokens = ref(0);

const copyable = computed(
  () => `${props.title}\n\n${props.url}\n\n${summary.value}`,
);
const { copy, copied } = useClipboard({ source: "" });

async function onMarkAsReadClick() {
  try {
    loading.value = true;
    await $fetch("/api/entry", {
      method: "POST",
      body: { op: "mark-as-read", id: props.id },
    });
    emit("markAsRead", props.id);
  } catch (err) {
    //empty
  } finally {
    loading.value = false;
  }
}

async function onSaveClick() {
  try {
    await $fetch("/api/entry", {
      method: "POST",
      body: { op: "save", id: props.id },
    });
    saved.value = true;
  } catch (err) {
    //empty
  }
}

async function onSummarizeClick() {
  try {
    summarizing.value = true;
    const data = await $fetch("/api/summarize", {
      method: "POST",
      body: { url: props.url },
    });
    summary.value = data.summary;
    tokens.value = data.tokens;
  } catch (err) {
    // empty
  } finally {
    summarizing.value = false;
  }
}

function onOpen() {
  emit("open", props.id);
}
</script>

<template>
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
    |
    <a :href="props.url" target="_blank" rel="nofollow" @click="onOpen">open</a>
  </div>
  <div v-if="summary">
    <pre><code class="summary">{{ props.title }}

{{ props.url }}

{{ summary }}</code></pre>
    <small>token usage </small>
    <span>{{ tokens }}</span>
    <small> summary actions </small>
    <span v-if="copied">copied!</span>
    <span v-else>
      <a href="#" @click.prevent="copy(copyable)">copy</a>
    </span>
  </div>
</template>

<style scoped>
.summary {
  text-wrap: wrap;
}
</style>
