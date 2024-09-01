<template>
  <BaseConfirm :status="fetched.status.value" @confirm="confirm">
    mark {{ entryIds.length }} as read
  </BaseConfirm>
</template>

<script setup lang="ts">
const props = defineProps<{ entryIds: number[] }>();

const emit = defineEmits<{ confirm: [] }>();

const { $client } = useNuxtApp();
const fetched = useAsyncData(
  "mark-all-as-read",
  () =>
    $client.miniflux.updateEntries.mutate({
      entryIds: props.entryIds,
      status: "read",
    }),
  { immediate: false, server: false },
);

async function confirm() {
  await fetched.execute();
  emit("confirm");
}
</script>

<style scoped></style>
