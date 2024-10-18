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
            <BaseButton @click="removeQuery('categoryId')">reset</BaseButton>
          </li>
          <li v-if="selectedFeed">
            filtered by feed <b>{{ selectedFeed?.title }}</b>
            {{ " " }}
            <BaseButton @click="removeQuery('feedId')">reset</BaseButton>
          </li>
          <li v-if="selectedDate">
            filtered by date <b>{{ selectedDate }}</b>
            {{ " " }}
            <BaseButton @click="removeQuery('date')">reset</BaseButton>
          </li>
        </ul>
      </fieldset>
      <RSSEntryOutlines
        v-model="entries"
        :date="selectedDate"
        @select-category="(id) => setQuery('categoryId', id)"
        @select-date="(date) => setQuery('date', date)"
        @select-feed="(id) => setQuery('feedId', id)"
      />
      <p>
        <b>{{ unreadEntries.length }}</b> on page, <b>{{ total }}</b> total
      </p>
      <div v-for="(entry, index) in entries" :key="entry.id">
        <RSSEntry
          v-model="entries[index]"
          @select-category="(id) => setQuery('categoryId', id)"
          @select-feed="(id) => setQuery('feedId', id)"
        />
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
import { endOfDay, getUnixTime, parseISO, startOfDay } from "date-fns";

const actionsRef = ref<null | HTMLElement>();

const route = useRoute();
const query = toRef(route, "query");
const selectedCategoryId = computed(() => query.value.categoryId?.toString());
const selectedDate = computed(() => query.value.date?.toString());
const selectedFeedId = computed(() => query.value.feedId?.toString());

const publishedAfter = computed(() =>
  selectedDate.value
    ? getUnixTime(startOfDay(parseISO(selectedDate.value))) - 1
    : undefined,
);
const publishedBefore = computed(() =>
  selectedDate.value
    ? getUnixTime(endOfDay(parseISO(selectedDate.value)))
    : undefined,
);

const { $client } = useNuxtApp();
const fetched = await useAsyncData(
  "entries",
  () =>
    $client.miniflux.getEntries.query({
      categoryId: selectedCategoryId.value,
      feedId: selectedFeedId.value,
      publishedAfter: publishedAfter.value,
      publishedBefore: publishedBefore.value,
    }),
  { watch: [selectedCategoryId, selectedFeedId, selectedDate] },
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

async function setQuery(name: string, value: unknown) {
  await navigateTo({
    query: {
      ...route.query,
      [name]: value === undefined ? undefined : `${value}`,
    },
  });
}

async function removeQuery(name: string) {
  await navigateTo({ query: { ...route.query, [name]: undefined } });
}

async function handleEmptyEntries() {
  const count = entries.value.length;
  const date = selectedDate.value;
  const categoryId = selectedCategoryId.value;
  const feedId = selectedFeedId.value;
  if (date && count <= 0) {
    await removeQuery("date");
    return;
  }
  if (feedId && count <= 0) {
    await removeQuery("feedId");
    return;
  }
  if (categoryId && count <= 0) {
    await removeQuery("categoryId");
    return;
  }
}
handleEmptyEntries();
</script>

<style scoped></style>
