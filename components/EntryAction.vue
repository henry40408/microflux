<template>
  <div v-if="loading">loading...</div>
  <div v-else>
    <a href="#" @click.prevent="markAsRead">mark as read</a>
    |
    <span v-if="saved">done!</span>
    <span v-else>
      <a href="#" @click.prevent="save">save</a>
    </span>
    |
    <span v-if="summarizing">summarizing...</span>
    <span v-if="!summarizing && !summary">
      <a href="#" @click.prevent="summarize">summarize</a>
    </span>
    <span v-if="summary">summarized!</span>
  </div>
  <div v-if="summary">
    <h3>summary</h3>
    <blockquote>{{ summary }}</blockquote>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  id: { type: Number, required: true },
  url: { type: String, required: true },
});
const emit = defineEmits<{
  markAsRead: [id: number];
}>();

const loading = ref(false);
const summarizing = ref(false);
const saved = ref(false);
const summary = ref("");

async function markAsRead() {
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

async function save() {
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

async function summarize() {
  try {
    summarizing.value = true;
    const data = await $fetch("/api/summarize", {
      method: "POST",
      body: { url: props.url },
    });
    summary.value = data.summary;
  } catch (err) {
    // empty
  } finally {
    summarizing.value = false;
  }
}
</script>
