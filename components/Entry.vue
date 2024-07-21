<script setup lang="ts">
const route = useRoute();
const model = defineModel<MinifluxCompactEntry>();

const { data, error, status, execute } = await useFetch(
  `/api/entries/${model.value.id}`,
  { immediate: false, server: false },
);

async function onDetailsToggle() {
  if (data.value) return;
  await execute();
}

async function setCategoryId(categoryId: number) {
  const { feedId } = route.query;
  await navigateTo({ query: { categoryId, feedId } });
}

async function setFeedId(feedId: number) {
  const { categoryId } = route.query;
  await navigateTo({ query: { categoryId, feedId } });
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
      <a href="#" @click.prevent="setFeedId(modelValue.feed.id)">{{
        modelValue.feed.title
      }}</a>
      /
      <a href="#" @click.prevent="setCategoryId(modelValue.feed.category.id)">{{
        modelValue.feed.category.title
      }}</a>
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
