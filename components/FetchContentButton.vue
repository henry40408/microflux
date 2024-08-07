<script setup lang="ts">
const model = defineModel<string>({ required: true });
const props = defineProps<{ id: number }>();

const emit = defineEmits<{ click: [] }>();

const { data, status, error, execute } = await useLazyFetch(
  `/api/entries/${props.id}/fetch-content`,
  { immediate: false, server: false },
);

async function onClick() {
  await execute();
  model.value = data.value?.content || "";
  emit("click");
}
</script>

<template>
  <MyButton
    :done="!!data"
    :error="error"
    :loading="status === 'pending'"
    @click="onClick"
    >download</MyButton
  >
</template>
