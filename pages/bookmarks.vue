<template>
  <div>
    <header>
      <NavBar />
      <h1>bookmarks</h1>
    </header>
    <main>
      <NewBookmark @add="fetched.execute" />
      <BaseSearch v-model="q" />
      <details>
        <summary>tags</summary>
        <div>
          <span v-for="(tag, index) in tags" :key="tag.id">
            <BaseButton @click="filterByTag(tag.name)">
              {{ tag.name }}
            </BaseButton>
            <span v-if="index !== tags.length - 1">, </span>
          </span>
        </div>
      </details>
      <RandomBookmarks />
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
      <p>
        <b>{{ count }}</b> bookmarks
      </p>
      <div v-for="(bookmark, index) in bookmarks" :key="bookmark.id">
        <AppBookmark
          v-model="bookmarks[index]"
          @deleted="fetched.execute()"
          @filter-by-tag="filterByTag"
        />
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
  "bookmarks-tags",
  async () => ({
    bookmarks: await $client.linkding.getBookmarks.query({
      q: debouncedQ.value,
    }),
    tags: await $client.linkding.getTags.query(),
  }),
  { watch: [debouncedQ] },
);
const bookmarks = computed(() => fetched.data.value?.bookmarks.results || []);
const count = computed(() => fetched.data.value?.bookmarks.count || 0);
const tags = computed(() => fetched.data.value?.tags.results || []);
useHead({
  title: () => `(${count.value}) linkding`,
});

function filterByTag(tag: string) {
  const nq = `#${tag}`;
  if (q.value.indexOf(nq) >= 0) return;
  q.value = `${q.value} ${nq}`;
}
</script>

<style scoped></style>
