<script setup lang="ts">
import type { MinifluxCompactEntry } from "~/server/trpc/routers/miniflux";

const model = defineModel<MinifluxCompactEntry>({ required: true });
const isRead = computed(() => model.value.status === "read");

const { $client } = useNuxtApp();
const fetched = await useAsyncData(
  `mark-as-read-${model.value.id}`,
  () =>
    $client.miniflux.updateEntries.mutate({
      entryIds: [model.value.id],
      status: "read",
    }),
  { immediate: false, server: false },
);

async function onClick() {
  await fetched.execute();
  model.value.status = "read";
}
</script>

<template>
  <div>
    <h3 space-x-2>
      <a
        :class="{ 'text-slate-500': isRead }"
        :href="modelValue.url"
        rel="noreferrer noopener"
        target="_blank"
        @click="onClick"
        >{{ pangu(modelValue.title) }}</a
      >
      <small>#{{ modelValue.id }}</small>
    </h3>
  </div>
</template>
