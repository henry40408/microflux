<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-primary text-white" elevated>
      <q-toolbar>
        <q-btn
          dense
          flat
          icon="menu"
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
        />
        <q-avatar>
          <q-icon name="rss_feed" />
        </q-avatar>
        <q-toolbar-title>Unread entries</q-toolbar-title>
        <q-btn
          dense
          flat
          icon="menu"
          round
          @click="rightDrawerOpen = !rightDrawerOpen"
        />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered show-if-above side="left">
      <q-list padding>
        <q-item-label header>Navigation</q-item-label>
        <q-item v-ripple clickable to="/">
          <q-item-section side>
            <q-avatar>
              <q-icon name="rss_feed" />
            </q-avatar>
          </q-item-section>
          <q-item-section>Unread entries</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-drawer v-model="rightDrawerOpen" bordered show-if-above side="right">
      <q-scroll-area class="fit">
        <q-list>
          <q-item-label header>Statistics</q-item-label>
          <q-item>
            <q-item-section avatar>
              <q-icon name="numbers" />
            </q-item-section>
            <q-item-section>{{ formatNumber(total) }} entries</q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="rss_feed" />
            </q-item-section>
            <q-item-section
              >{{ formatNumber(feeds.length) }} feeds</q-item-section
            >
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon name="folder" />
            </q-item-section>
            <q-item-section
              >{{ formatNumber(categories.length) }} categories</q-item-section
            >
          </q-item>
          <q-separator />
          <q-item-label header>Filters</q-item-label>
          <q-list>
            <q-item>
              <q-item-section>
                <q-select
                  v-model="selectedCategoryId"
                  clearable
                  emit-value
                  label="Category"
                  map-options
                  :options="filteredCategoryOptions"
                  use-input
                  @filter="filterCategory"
                >
                  <template #selected>
                    {{ selectedCategory?.label || "" }}
                  </template>
                  <template #option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-badge>{{ scope.opt.count }}</q-badge>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-select
                  v-model="selectedFeedId"
                  clearable
                  emit-value
                  label="Feed"
                  map-options
                  :options="filteredFeedOptions"
                  use-input
                  @filter="filterFeed"
                >
                  <template #selected>{{ selectedFeed?.label || "" }}</template>
                  <template #option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-badge>{{ scope.opt.count }}</q-badge>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </q-item-section>
            </q-item>
          </q-list>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page padding>
        <q-pull-to-refresh @refresh="refreshEntries">
          <q-list separator>
            <RSSEntry
              v-for="(entry, index) in entries"
              :key="entry.id"
              v-model="entries[index]"
              @select-category="(id) => (selectedCategoryId = id)"
              @select-feed="(id) => (selectedFeedId = id)"
            />
            <q-inner-loading :showing="loading" />
          </q-list>
        </q-pull-to-refresh>
        <div v-if="!entries.length" class="text-body1 text-grey text-italic">
          no entries
        </div>
        <q-page-sticky :offset="[16, 16]">
          <q-fab
            color="primary"
            direction="up"
            icon="keyboard_arrow_up"
            vertical-actions-align="right"
          >
            <q-fab-action
              color="secondary"
              external-label
              icon="done_all"
              label="Mark all as done"
              label-position="left"
              @click="marking = true"
            />
            <q-fab-action
              color="secondary"
              external-label
              icon="refresh"
              label="Refresh"
              label-position="left"
              @click="fetched.execute()"
            />
          </q-fab>
          <q-dialog v-model="marking">
            <q-card>
              <q-card-section>Mark all as done?</q-card-section>
              <q-card-actions align="right">
                <q-btn flat @click="marking = false">Cancel</q-btn>
                <q-btn color="negative" @click="markAllAsDone">Yes</q-btn>
                <q-btn color="negative" @click="markAllAsDoneAndRefresh">
                  Yes and refresh
                </q-btn>
              </q-card-actions>
            </q-card>
          </q-dialog>
        </q-page-sticky>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import lodash from "lodash";
import { useRouteQuery } from "@vueuse/router";

const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);
const marking = ref(false);
const selectedCategoryId = useRouteQuery("categoryId");
const selectedFeedId = useRouteQuery("feedId");

const { $client } = useNuxtApp();

const fetched = useAsyncData(
  "entries",
  () => {
    const categoryId = queryToString(selectedCategoryId);
    const feedId = queryToString(selectedFeedId);
    return $client.miniflux.getEntries.query({ categoryId, feedId });
  },
  { watch: [selectedCategoryId, selectedFeedId] },
);

const entries = computed(() => fetched.data.value?.entries || []);
watch(
  () => entries.value,
  async (next) => {
    if (next.length <= 0) {
      if (selectedFeedId.value) {
        selectedFeedId.value = null;
        await nextTick();
        return;
      }
      if (selectedCategoryId.value) {
        selectedCategoryId.value = null;
        await nextTick();
        return;
      }
    }
  },
);

const feeds = computed(() =>
  lodash(entries.value)
    .groupBy("feed.id")
    .map((entries) => ({ feed: entries[0].feed, count: entries.length }))
    .orderBy([(g) => g.count, (g) => g.feed.title], ["desc", "asc"])
    .value(),
);
const feedOptions = computed(() =>
  feeds.value.map((g) => ({
    value: g.feed.id,
    label: g.feed.title,
    count: g.count,
  })),
);
const selectedFeed = computed(() =>
  feedOptions.value.find((f) => String(f.value) === selectedFeedId.value),
);
const filteredFeedOptions = ref<{ value: number; label: string }[]>([]);
const categories = computed(() =>
  lodash(entries.value)
    .groupBy("feed.category.id")
    .map((entries) => ({
      category: entries[0].feed.category,
      count: entries.length,
    }))
    .orderBy([(g) => g.count, (g) => g.category.title], ["desc", "asc"])
    .value(),
);
const categoryOptions = computed(() =>
  categories.value.map((g) => ({
    value: g.category.id,
    label: g.category.title,
    count: g.count,
  })),
);
const selectedCategory = computed(() =>
  categoryOptions.value.find(
    (c) => String(c.value) === selectedCategoryId.value,
  ),
);
const filteredCategoryOptions = ref<{ value: number; label: string }[]>();
const total = computed(() => fetched.data.value?.total || 0);
useHead({
  title: () => `(${total.value}) Unread entries`,
});

function filterFeed(val: string, update: (callbackFn: () => void) => void) {
  if (val !== "") {
    update(() => {
      const needle = val.toLowerCase();
      filteredFeedOptions.value = feedOptions.value.filter((f) =>
        f.label.toLowerCase().includes(needle),
      );
    });
  } else {
    update(() => {
      filteredFeedOptions.value = feedOptions.value;
    });
  }
}

function filterCategory(val: string, update: (callbackFn: () => void) => void) {
  if (val !== "") {
    update(() => {
      const needle = val.toLowerCase();
      filteredCategoryOptions.value = categoryOptions.value.filter((f) =>
        f.label.toLowerCase().includes(needle),
      );
    });
  } else {
    update(() => {
      filteredCategoryOptions.value = categoryOptions.value;
    });
  }
}

async function markAllAsDone() {
  try {
    const entryIds = entries.value.map((e) => e.id);
    await $client.miniflux.updateEntries.mutate({ entryIds, status: "read" });
    for (let i = 0; i < entries.value.length; i += 1) {
      entries.value[i].status = "read";
    }
  } catch (err) {
    console.error(err);
  } finally {
    marking.value = false;
  }
}

async function markAllAsDoneAndRefresh() {
  await markAllAsDone();
  await fetched.execute();
}

async function refreshEntries(done: () => void) {
  await fetched.execute();
  done();
}

const loading = computed(() => [fetched.status.value].includes("pending"));
</script>

<style scoped></style>
