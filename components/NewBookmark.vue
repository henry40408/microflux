<template>
  <form @submit.prevent="add">
    <fieldset>
      <legend>new bookmark</legend>
      <input v-model="url" type="url" placeholder="URL" />
      <input type="submit" :value="addLabel" :disabled="!shouldAdd" />
      <div v-if="added.error">{{ added.error }}</div>
    </fieldset>
  </form>
</template>

<script setup lang="ts">
const emit = defineEmits<{ add: [] }>();

const url = ref("");

const { $client } = useNuxtApp();
const added = useAsyncData(
  "add-bookmark",
  () => $client.linkding.addBookmark.mutate({ url: url.value }),
  { immediate: false, server: false },
);
const shouldAdd = computed(
  () => !!url.value && added.status.value !== "pending",
);
const addLabel = computed(() =>
  added.status.value === "pending" ? "..." : "add",
);

async function add() {
  await added.execute();
  url.value = "";
  emit("add");
}
</script>

<style scoped></style>
