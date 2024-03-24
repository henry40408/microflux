<template>
  <div v-if="loading">loading...</div>
  <div v-else>
    <a href="#" @click.prevent="markAsRead">mark as read</a>
    |
    <span v-if="saved">Done!</span>
    <span v-else>
      <a href="#" @click.prevent="save">save</a>
    </span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  id: number,
});
const emit = defineEmits<{
  markAsRead: [id: number];
}>();

const loading = ref(false);
const saved = ref(false);

async function markAsRead() {
  try {
    loading.value = true;
    await $fetch("/api/entry", {
      method: "POST",
      body: JSON.stringify({ op: "mark-as-read", id: props.id }),
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
      body: JSON.stringify({ op: "save", id: props.id }),
    });
    saved.value = true;
  } catch (err) {
    //empty
  }
}
</script>
