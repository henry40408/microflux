<script setup lang="ts">
import localforage from "localforage";

const actionsRef = ref<null | HTMLElement>();

const query = toRef(useRoute(), "query");
const selectedCategoryId = computed(() => query.value.categoryId?.toString());
const selectedFeedId = computed(() => query.value.feedId?.toString());

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
  if (entries.value.length > 0) {
    actionsRef.value?.scrollIntoView();
  }
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

function clearCache() {
  localforage.clear();
}
</script>

<template>
  <div>
    <header>
      <NavBar />
      <h1>miniflux</h1>
    </header>
    <main>
      <ul ref="actionsRef">
        <li>
          <BaseButton
            :error="fetched.error"
            :status="fetched.status.value"
            @click="fetched.refresh"
            >reload</BaseButton
          >
        </li>
        <li v-if="selectedCategory">
          filtered by category <strong>{{ selectedCategory?.title }}</strong>
          {{ " " }}
          <BaseButton @click="resetCategory">reset</BaseButton>
        </li>
        <li v-if="selectedFeed">
          filtered by feed <strong>{{ selectedFeed?.title }}</strong>
          {{ " " }}
          <BaseButton @click="resetFeed">reset</BaseButton>
        </li>
      </ul>
      <RSSEntryOutlines v-model="entries" />
      <p>
        <strong>{{ unreadEntries.length }}</strong> on page,
        <strong>{{ total }}</strong> total
      </p>
      <div v-for="(entry, index) in entries" :key="entry.id">
        <RSSEntry v-model="entries[index]" />
      </div>
      <p>actions</p>
      <ul>
        <li>
          <BaseButton
            :error="fetched.error"
            :status="fetched.status.value"
            @click="fetched.refresh"
            >reload</BaseButton
          >
        </li>
        <li v-if="shouldMarkAllAsRead">
          <RSSMarkAllAsRead
            :entry-ids="unreadEntryIds"
            @confirm="fetched.refresh"
          />
        </li>
      </ul>
    </main>
    <footer>
      <AppVersion />
      <div>
        actions: <BaseConfirm @confirm="clearCache">clear cache</BaseConfirm>
      </div>
    </footer>
  </div>
</template>
