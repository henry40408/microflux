<script setup lang="ts">
const actionsRef = ref<null | HTMLElement>();

const query = toRef(useRoute(), "query");
const selectedCategoryId = computed(
  () => query.value.categoryId?.toString() || "",
);
const selectedFeedId = computed(() => query.value.feedId?.toString() || "");
watch(
  () => `${selectedCategoryId.value}|${selectedFeedId.value}`,
  (next, prev) => {
    if (next !== prev) actionsRef.value?.scrollIntoView();
  },
);

const { $client } = useNuxtApp();
const fetched = await useAsyncData(
  "entries",
  () =>
    $client.miniflux.getEntries.query({
      categoryId: selectedCategoryId.value,
      feedId: selectedFeedId.value,
    }),
  { watch: [selectedCategoryId, selectedFeedId] },
);

const total = computed(() => fetched.data.value?.total || 0);
const entries = computed(() => fetched.data.value?.entries || []);
watch(entries, async () => {
  await handleEmptyEntries();
});

const selectedCategory = computed(
  () =>
    entries.value.find(
      (e) => e.feed.category?.id.toString() === selectedCategoryId.value,
    )?.feed.category,
);
const selectedFeed = computed(
  () =>
    entries.value.find((e) => e.feed.id.toString() === selectedFeedId.value)
      ?.feed,
);

const unreadEntries = computed(
  () => entries.value.filter((e) => e.status === "unread") || [],
);
const unreadEntryIds = computed(() => unreadEntries.value.map((e) => e.id));
useHead({
  title: () => `(${unreadEntries.value.length}) miniflux`,
});
const shouldMarkAllAsRead = computed(
  () => fetched.status.value !== "pending" && unreadEntryIds.value.length > 0,
);

async function resetFeed() {
  const categoryId = parseQuery().get("categoryId") || undefined;
  await navigateTo({ query: { categoryId, feedId: undefined } });
}
async function resetCategory() {
  const feedId = parseQuery().get("feedId") || undefined;
  await navigateTo({ query: { categoryId: undefined, feedId } });
}

async function handleEmptyEntries() {
  const count = entries.value.length;
  const categoryId = selectedCategoryId.value;
  const feedId = selectedFeedId.value;
  if (feedId && count <= 0) {
    await navigateTo({ query: { categoryId } });
    return;
  }
  if (categoryId && count <= 0) {
    await navigateTo({ query: {} });
    return;
  }
}
handleEmptyEntries();

async function onReload() {
  await fetched.refresh();
  actionsRef.value?.scrollIntoView();
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
            @click="onReload"
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
      <RSSEntryOutlines v-model="entries" />
      <h2>{{ unreadEntries.length }} on page, {{ total }} total</h2>
      <div v-for="(entry, index) in entries" :key="entry.id">
        <RSSEntry v-model="entries[index]" />
      </div>
      <h2>actions</h2>
      <ul>
        <li>
          <BaseButton
            :error="fetched.error"
            :status="fetched.status.value"
            @click="onReload"
            >reload</BaseButton
          >
        </li>
        <li v-if="shouldMarkAllAsRead">
          <RSSMarkAllAsRead :entry-ids="unreadEntryIds" @confirm="onReload" />
        </li>
      </ul>
    </main>
    <footer>
      <AppVersion />
    </footer>
  </div>
</template>
