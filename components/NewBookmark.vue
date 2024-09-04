<template>
  <form @submit.prevent="add">
    <div>
      <input v-model="url" type="url" placeholder="URL" />
    </div>
    <div>
      <button :disabled="disabled">&plus; add</button>
    </div>
    <div v-if="added.error">{{ added.error }}</div>
  </form>
</template>

<script setup lang="ts">
const emit = defineEmits<{ add: [] }>();

const url = ref("");
const disabled = computed(() => !url.value || added.status.value === "pending");

const { $client } = useNuxtApp();
const added = useAsyncData(
  "add-bookmark",
  () => $client.linkding.addBookmark.mutate({ url: url.value }),
  { immediate: false, server: false },
);

async function add() {
  await added.execute();
  url.value = "";
  emit("add");
}
</script>

<style scoped></style>
