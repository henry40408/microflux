<script setup lang="ts">
const actionsRef = ref<null | HTMLElement>();

const query = toRef(useRoute(), "query");
const categoryId = computed(() => query.value.categoryId?.toString() || "");
const feedId = computed(() => query.value.feedId?.toString() || "");
watch(
  () => `${categoryId.value}|${feedId.value}`,
  (next, prev) => {
    if (next !== prev) actionsRef.value?.scrollIntoView();
  },
);

const { $client } = useNuxtApp();
const fetched = useAsyncData(
  "entries",
  () =>
    $client.miniflux.getEntries.query({
      categoryId: categoryId.value,
      feedId: feedId.value,
    }),
  { watch: [categoryId, feedId] },
);
const entries = computed(() => fetched.data.value?.entries || []);
const unreadEntries = computed(
  () => entries.value.filter((e) => e.status === "unread") || [],
);
const selectedCategory = computed(
  () =>
    entries.value.find(
      (e) => e.feed.category?.id.toString() === categoryId.value,
    )?.feed.category,
);
const selectedFeed = computed(
  () => entries.value.find((e) => e.feed.id.toString() === feedId.value)?.feed,
);
useHead({
  title: () => `(${unreadEntries.value.length}) miniflux`,
});

async function resetFeed() {
  const categoryId = parseQuery().get("categoryId");
  await navigateTo({ query: { categoryId, feedId: null } });
}
async function resetCategory() {
  const feedId = parseQuery().get("feedId");
  await navigateTo({ query: { categoryId: null, feedId } });
}
</script>

<template>
  <div>
    <header>
      <NavBar />
      <h1>miniflux</h1>
    </header>
    <main>
      <h2 ref="actionsRef">actions</h2>
      <ul>
        <li>
          <BaseButton
            :error="fetched.error"
            :status="fetched.status.value"
            @click="fetched.execute"
            >reload</BaseButton
          >
        </li>
        <li v-if="selectedCategory">
          filtered by category {{ selectedCategory?.title }}
          <BaseButton @click="resetCategory">reset</BaseButton>
        </li>
        <li v-if="selectedFeed">
          filtered by feed {{ selectedFeed?.title }}
          <BaseButton @click="resetFeed">reset</BaseButton>
        </li>
      </ul>
      <h2>outlines</h2>
      <h2>{{ unreadEntries.length }} entries</h2>
      <div v-for="(entry, index) in entries" :key="entry.id">
        <RSSEntry v-model="entries[index]" />
      </div>
    </main>
  </div>
</template>
