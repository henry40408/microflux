<template>
  <div>
    <header>
      <NavBar />
      <h1>linkding</h1>
    </header>
    <main>
      <fieldset>
        <legend>actions</legend>
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
      </fieldset>
      <NewBookmark @add="fetched.execute" />
      <BaseSearch v-model="q" />
      <p>
        <strong>{{ count }}</strong> bookmarks
      </p>
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
const route = useRoute();
const q = ref(route.query.q?.toString() || "");
const debouncedQ = refDebounced(q, 500);
watch(debouncedQ, async () => {
  await navigateTo({ query: { q: debouncedQ.value || undefined } });
});

const { $client } = useNuxtApp();
const fetched = await useAsyncData(
  "bookmarks",
  () => $client.linkding.getBookmarks.query({ q: debouncedQ.value }),
  { watch: [debouncedQ] },
);
const bookmarks = computed(() => fetched.data.value?.results || []);
const count = computed(() => fetched.data.value?.count || 0);
useHead({
  title: () => `(${count.value || ""}) linkding`,
});
</script>

<style scoped></style>
