<template>
  <div>
    <header>
      <NavBar />
      <h1>linkding</h1>
    </header>
    <main>
      <h2>actions</h2>
      <ul>
        <li>
          <BaseButton
            :error="fetched.error"
            :status="fetched.status.value"
            @click="fetched.execute"
            >reload</BaseButton
          >
        </li>
      </ul>
      <h2>add bookmark</h2>
      <NewBookmark @add="fetched.execute" />
      <h2>{{ count }} bookmarks</h2>
      <div v-for="(bookmark, index) in bookmarks" :key="bookmark.id">
        <AppBookmark v-model="bookmarks[index]" @deleted="fetched.execute()" />
      </div>
    </main>
    <footer>
      <AppVersion />
    </footer>
  </div>
</template>

<script setup lang="ts">
const q = ref("");

const { $client } = useNuxtApp();
const fetched = await useAsyncData(
  "bookmarks",
  () => $client.linkding.getBookmarks.query({ q: q.value }),
  { watch: [q] },
);
const bookmarks = computed(() => fetched.data.value?.results || []);
const count = computed(() => fetched.data.value?.count || 0);
useHead({
  title: () => `(${count.value || ""}) linkding`,
});
</script>

<style scoped></style>
