<script setup lang="ts">
import { secondsToMilliseconds } from "date-fns";

const props = defineProps<{ entryIds: number[] }>();

const emit = defineEmits(["mark-all-as-read"]);

const body = computed(() => ({
  entryIds: props.entryIds,
  status: "read",
}));
const { status, error, execute } = await useLazyFetch("/api/entries", {
  method: "PUT",
  body,
  immediate: false,
  server: false,
  timeout: secondsToMilliseconds(30),
  watch: false,
});

async function onClick() {
  await execute();
  emit("mark-all-as-read");
}
</script>

<template>
  <MyConfirm
    repeated
    :error="error"
    :loading="status === 'pending'"
    @confirm="onClick"
    >mark {{ props.entryIds.length }} as read</MyConfirm
  >
</template>
