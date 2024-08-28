<script setup lang="ts">
import type {
  MinifluxCompactCategory,
  MinifluxCompactEntry,
} from "~/server/trpc/routers/miniflux";

const actionsRef = ref<HTMLElement | null>(null);
const queryString = ref("");

const queryParams = toRef(useRoute(), "query");
const selectedCategoryId = computed(() =>
  queryParams.value.categoryId?.toString(),
);
const selectedFeedId = computed(() => queryParams.value.feedId?.toString());

const { $client } = useNuxtApp();
const { data, error, status, execute } = await useAsyncData(
  "entries",
  () =>
    $client.miniflux.getEntries.query({
      categoryId: selectedCategoryId.value,
      feedId: selectedFeedId.value,
    }),
  { watch: [selectedCategoryId, selectedFeedId] },
);

const filteredEntries = computed(
  () =>
    data.value?.entries.filter((e) => {
      return queryString.value
        ? e.title.toLowerCase().includes(queryString.value.toLowerCase())
        : true;
    }) || [],
);
watch(filteredEntries, async (next) => {
  actionsRef.value?.scrollIntoView(true);
  await handleEmptyEntries(next);
});
const unreadEntries = computed(() =>
  filteredEntries.value.filter((e) => e.status === "unread"),
);
const title = computed(() => `(${unreadEntries.value.length}) miniflux`);
useHead({ title });

const unreadEntryIds = computed(() => unreadEntries.value.map((e) => e.id));
const feeds = computed(
  () =>
    Object.values(
      Object.fromEntries(filteredEntries.value.map((e) => [e.feed.id, e.feed])),
    ) || [],
);
const categories = computed(
  () =>
    Object.values(
      Object.fromEntries(
        feeds.value
          .filter((f) => f.category)
          .map((f) => ({
            ...f,
            category: f.category as MinifluxCompactCategory,
          }))
          .map((f) => [f.category.id, f.category]),
      ),
    ) || [],
);
const selectedFeed = computed(() => {
  const { feedId } = queryParams.value;
  if (!feedId) return null;
  return feeds.value.find((f) => `${f.id}` === feedId);
});
const selectedCategory = computed(() => {
  const { categoryId } = queryParams.value;
  if (!categoryId) return null;
  return categories.value.find((c) => `${c.id}` === categoryId);
});

async function handleEmptyEntries(next: MinifluxCompactEntry[]) {
  const { categoryId, feedId } = queryParams.value;
  if (next.length <= 0 && categoryId && feedId) {
    await navigateTo({ query: { categoryId } });
    return;
  }
  if (next.length <= 0 && feedId) {
    await navigateTo({});
    return;
  }
  if (next.length <= 0 && categoryId) {
    await navigateTo({});
    return;
  }
}
handleEmptyEntries(filteredEntries.value);

async function setCategoryId(categoryId: number | undefined) {
  const q = { ...queryParams.value };
  if (!categoryId) {
    delete q.categoryId;
  } else {
    q.categoryId = categoryId.toString();
  }
  await navigateTo({ query: q });
}

async function setFeedId(feedId: number | undefined) {
  const q = { ...queryParams.value };
  if (!feedId) {
    delete q.feedId;
  } else {
    q.feedId = feedId.toString();
  }
  await navigateTo({ query: q });
}
</script>

<template>
  <div>
    <div space-y-2>
      <NavBar />
      <div
        ref="actionsRef"
        space-y-2
        text-right
        items-center
        md:text-left
        md:flex
        md:flex-wrap
        md:space-x-2
        md:space-y-0
      >
        <BaseButton
          :error="error"
          :pending="status === 'pending'"
          @click="execute"
          >🔄 reload</BaseButton
        >
        <BaseSearch v-model="queryString" />
        <div>{{ unreadEntries.length }} entries</div>
        <div v-if="selectedFeed" space-x-2>
          <span>📡</span>
          <span>{{ selectedFeed.title }}</span>
          <BaseButton @click="setFeedId(undefined)">reset</BaseButton>
        </div>
        <div v-if="selectedCategory" space-x-2>
          <span>📁</span>
          <span>{{ selectedCategory.title }}</span>
          <BaseButton @click="setCategoryId(undefined)">reset</BaseButton>
        </div>
      </div>
    </div>
    <div v-if="data">
      <AppEntryOutlines
        v-model="data"
        @click-feed="setFeedId"
        @click-category="setCategoryId"
      />
      <AppEntry
        v-for="(entry, index) in filteredEntries"
        :key="entry.id"
        v-model="filteredEntries[index]"
        @click-category="setCategoryId"
        @click-feed="setFeedId"
      />
      <em v-if="status !== 'pending' && filteredEntries.length <= 0" block mb-4>
        (empty)
      </em>
    </div>
    <div class="my-controls">
      <BaseButton
        :error="error"
        :pending="status === 'pending'"
        @click="execute"
        >🔄 reload</BaseButton
      >
      <MarkAllAsReadButton
        v-if="status !== 'pending' && unreadEntries.length > 0"
        :entry-ids="unreadEntryIds"
        @mark-all-as-read="execute"
      />
    </div>
  </div>
</template>
