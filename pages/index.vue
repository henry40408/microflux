<script setup lang="ts">
import type {
  MinifluxCompactCategory,
  MinifluxCompactEntry,
} from "~/server/trpc/routers/miniflux";

const toolbarRef = ref<HTMLElement | null>(null);
const q = ref("");

const query = toRef(useRoute(), "query");
const categoryId = computed(() => query.value.categoryId?.toString());
const feedId = computed(() => query.value.feedId?.toString());

const { $client } = useNuxtApp();
const { data, error, status, execute } = await useAsyncData(
  "entries",
  () =>
    $client.miniflux.getEntries.query({
      categoryId: categoryId.value,
      feedId: feedId.value,
    }),
  { watch: [categoryId, feedId] },
);

const entries = computed(
  () =>
    data.value?.entries.filter((e) => {
      return q.value
        ? e.title.toLowerCase().includes(q.value.toLowerCase())
        : true;
    }) || [],
);
watch(entries, async (next) => {
  toolbarRef.value?.scrollIntoView(true);
  await handleEmptyEntries(next);
});
const count = computed(
  () => entries.value.filter((e) => e.status === "unread").length,
);
const title = computed(() => `(${count.value}) miniflux`);
useHead({ title });

const entryIds = computed(() =>
  entries.value.filter((e) => e.status === "unread").map((e) => e.id),
);
const feeds = computed(
  () =>
    Object.values(
      Object.fromEntries(entries.value.map((e) => [e.feed.id, e.feed])),
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
  const { feedId } = query.value;
  if (!feedId) return null;
  return feeds.value.find((f) => `${f.id}` === feedId);
});
const selectedCategory = computed(() => {
  const { categoryId } = query.value;
  if (!categoryId) return null;
  return categories.value.find((c) => `${c.id}` === categoryId);
});

async function handleEmptyEntries(next: MinifluxCompactEntry[]) {
  const { categoryId, feedId } = query.value;
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
handleEmptyEntries(entries.value);

async function setCategoryId(categoryId: number | undefined) {
  const q = { ...query.value };
  if (!categoryId) {
    delete q.categoryId;
  } else {
    q.categoryId = categoryId.toString();
  }
  await navigateTo({ query: q });
}

async function setFeedId(feedId: number | undefined) {
  const q = { ...query.value };
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
        ref="toolbarRef"
        space-y-2
        text-right
        items-center
        md:text-left
        md:flex
        md:flex-wrap
        md:space-x-2
        md:space-y-0
      >
        <div space-x-2 items-end>
          <small>actions</small>
          <MyButton
            :error="error"
            :pending="status === 'pending'"
            @click="execute"
            >🔄 reload</MyButton
          >
        </div>
        <MySearch v-model="q" />
        <div>{{ count }} entries</div>
        <div v-if="selectedFeed" space-x-2>
          <span>📡</span>
          <span>{{ selectedFeed.title }}</span>
          <MyButton @click="setFeedId(undefined)">reset</MyButton>
        </div>
        <div v-if="selectedCategory" space-x-2>
          <span>📁</span>
          <span>{{ selectedCategory.title }}</span>
          <MyButton @click="setCategoryId(undefined)">reset</MyButton>
        </div>
      </div>
    </div>
    <div v-if="data">
      <MyOutlines
        v-model="data"
        @click-feed="setFeedId"
        @click-category="setCategoryId"
      />
      <MyEntry
        v-for="(entry, index) in entries"
        :key="entry.id"
        v-model="entries[index]"
        @click-category="setCategoryId"
        @click-feed="setFeedId"
      />
      <em v-if="status !== 'pending' && entries.length <= 0" block mb-4>
        (empty)
      </em>
    </div>
    <div class="my-controls">
      <MyButton :error="error" :pending="status === 'pending'" @click="execute"
        >🔄 reload</MyButton
      >
      <MarkAllAsReadButton
        v-if="status !== 'pending' && count > 0"
        :entry-ids="entryIds"
        @mark-all-as-read="execute"
      />
    </div>
  </div>
</template>
