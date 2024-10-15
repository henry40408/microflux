<template>
  <details>
    <summary>random bookmarks</summary>
    <form @submit.prevent="execute()">
      <p>
        <label :for="quantityId">quantity</label>
        <input :id="quantityId" v-model="quantity" type="number" min="1" />
      </p>
      <div>
        <label>options</label>
      </div>
      <div>
        <input :id="revisitId" v-model="revisit" type="checkbox" />
        <label :for="revisitId">revisit</label>
      </div>
      <p>
        <input type="submit" :value="shuffleLabel" :disabled="!shouldSubmit" />
      </p>
      <div v-if="error">{{ error }}</div>
    </form>
    <div v-for="(bookmark, index) in bookmarks" :key="bookmark.id">
      <AppBookmark v-model="bookmarks[index]" />
    </div>
  </details>
</template>

<script setup lang="ts">
const quantityId = useId();
const revisitId = useId();

const quantity = ref(3);
const revisit = ref(false);

const { $client } = useNuxtApp();
const { data, error, status, execute } = useAsyncData(
  "random-bookmarks",
  () => $client.linkding.getRandomBookmarks.query({ quantity: quantity.value }),
  { immediate: false, server: false },
);
const shouldSubmit = computed(() => status.value !== "pending");
const shuffleLabel = computed(() => (shouldSubmit.value ? "shuffle" : "..."));
const bookmarks = computed(() => data.value || []);
</script>

<style scoped></style>
