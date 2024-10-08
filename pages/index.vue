<template>
  <div>
    <header>
      <NavBar />
      <h1>unread entries</h1>
    </header>
    <main>
      <fieldset ref="actionsRef">
        <legend>actions</legend>
        <ul>
          <li>
            <BaseButton
              :error="fetched.error"
              :status="fetched.status.value"
              @click="fetched.refresh"
              >reload</BaseButton
            >
          </li>
          <li v-if="selectedCategory">
            filtered by category <b>{{ selectedCategory?.title }}</b>
            {{ " " }}
            <BaseButton @click="resetCategory">reset</BaseButton>
          </li>
          <li v-if="selectedFeed">
            filtered by feed <b>{{ selectedFeed?.title }}</b>
            {{ " " }}
            <BaseButton @click="resetFeed">reset</BaseButton>
          </li>
        </ul>
      </fieldset>
      <RSSEntryOutlines v-model="entries" />
      <p>
        <b>{{ unreadEntries.length }}</b> on page, <b>{{ total }}</b> total
      </p>
      <div v-for="(entry, index) in entries" :key="entry.id">
        <RSSEntry v-model="entries[index]" />
      </div>
      <p v-if="entries.length <= 0">
        <i>no entries</i>
      </p>
      <fieldset>
        <legend>actions</legend>
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
      </fieldset>
    </main>
    <footer>
      <AppVersion />
    </footer>
  </div>
</template>

<script setup lang="ts">
const actionsRef = ref<null | HTMLElement>();

const route = useRoute();
const query = toRef(route, "query");
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
      (e) => e.feed.category.id.toString() === selectedCategoryId.value,
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
  const categoryId = route.query.categoryId;
  await navigateTo({ query: { categoryId, feedId: undefined } });
}
async function resetCategory() {
  const feedId = route.query.feedId;
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
</script>

<style scoped></style>
