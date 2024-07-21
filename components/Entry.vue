<script setup lang="ts">
const model = defineModel<MinifluxCompactEntry>();

const { data, error, status, execute } = await useFetch(
  `/api/entries/${model.value.id}`,
  { immediate: false, server: false },
);

async function onDetailsToggle() {
  if (data.value) return;
  await execute();
}
</script>

<template>
  <div>
    <div>
      <a :href="modelValue.url" target="_blank">{{ modelValue.title }}</a> #{{
        modelValue.id
      }}
    </div>
    <div>
      {{ modelValue.feed.title }} / {{ modelValue.feed.category.title }}
    </div>
    <div>
      <details @toggle="onDetailsToggle">
        <summary>content</summary>
        <span v-if="status === 'pending'">...</span>
        <span v-if="status === 'error'">{{ error }}</span>
        <span v-if="data" v-html="data.content"></span>
      </details>
    </div>
  </div>
</template>
