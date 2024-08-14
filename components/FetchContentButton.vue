<script setup lang="ts">
const model = defineModel<string>({ required: true });
const props = defineProps<{ id: number }>();

const emit = defineEmits<{ click: [] }>();

const fetched = await useLazyFetch(
  `/api/miniflux/entries/${props.id}/fetch-content`,
  { immediate: false, server: false },
);

async function onClick() {
  await fetched.execute();
  model.value = fetched.data.value?.content || "";
  emit("click");
}
</script>

<template>
  <MyButton
    :done="fetched.status.value === 'success'"
    :error="fetched.error.value"
    :loading="fetched.status.value === 'pending'"
    @click="onClick"
    >download</MyButton
  >
</template>
