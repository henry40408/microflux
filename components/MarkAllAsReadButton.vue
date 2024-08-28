<script setup lang="ts">
const props = defineProps<{ entryIds: number[] }>();

const emit = defineEmits<{ markAllAsRead: [] }>();

const { $client } = useNuxtApp();
const fetched = await useAsyncData(
  "mark-all-as-read",
  () =>
    $client.miniflux.updateEntries.mutate({
      entryIds: props.entryIds,
      status: "read",
    }),
  { immediate: false, server: false },
);

async function onClick() {
  await fetched.execute();
  emit("markAllAsRead");
}
</script>

<template>
  <BaseConfirm
    repeated
    :error="fetched.error.value"
    :loading="fetched.status.value === 'pending'"
    @confirm="onClick"
    >✅ mark {{ props.entryIds.length }} as read</BaseConfirm
  >
</template>
