<script setup lang="ts">
const url = ref("");

const emit = defineEmits<{ add: [] }>();

const { $client } = useNuxtApp();
const fetched = await useAsyncData(
  "add-bookmark",
  () => $client.linkding.addBookmark.mutate({ url: url.value }),
  { immediate: false, server: false },
);
const submitDisabled = computed(
  () => url.value.length <= 0 || fetched.status.value === "pending",
);
async function handleSubmit() {
  await fetched.execute();
  url.value = "";
  emit("add");
}
</script>

<template>
  <form
    flex
    items-center
    space-x-2
    justify-end
    md:justify-start
    @submit.prevent="handleSubmit"
  >
    <input v-model="url" m-0 type="url" placeholder="URL" />
    <input m-0 type="submit" value="➕ add" :disabled="submitDisabled" />
    <div v-if="fetched.error">{{ fetched.error }}</div>
  </form>
</template>

<style scoped></style>
