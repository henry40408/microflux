<script setup lang="ts">
const props = defineProps<{ entryIds: number[] }>();

const emit = defineEmits(["mark-all-as-read"]);

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
  emit("mark-all-as-read");
}
</script>

<template>
  <MyConfirm
    repeated
    :error="fetched.error.value"
    :loading="fetched.status.value === 'pending'"
    @confirm="onClick"
    >✅ mark {{ props.entryIds.length }} as read</MyConfirm
  >
</template>
