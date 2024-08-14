<script setup lang="ts">
const model = defineModel<string>({ required: true });
const props = defineProps<{ id: number }>();

const emit = defineEmits<{ click: [] }>();

const fetched = await useLazyFetch(
  `/api/miniflux/entries/${props.id}/fetch-content`,
  { key: `fetch-content-${props.id}`, immediate: false, server: false },
);

async function onCancel() {
  fetched.clear();
  model.value = "";
}

async function onClick() {
  await fetched.execute();
  model.value = fetched.data.value?.content || "";
  emit("click");
}
</script>

<template>
  <MyButton
    :clear="onCancel"
    :done="fetched.status.value === 'success'"
    :error="fetched.error.value"
    :pending="fetched.status.value === 'pending'"
    @click="onClick"
    >download</MyButton
  >
</template>
