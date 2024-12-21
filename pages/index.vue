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
        <q-toolbar-title>unread entries</q-toolbar-title>
        <q-btn
          dense
          flat
          icon="filter_list"
          round
          @click="rightDrawerOpen = !rightDrawerOpen"
        />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered show-if-above side="left">
      <!-- empty -->
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
                  filled
                  label="category"
                  :options="filteredCategoryOptions"
                  use-input
                  @filter="filterCategory"
                >
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
                  filled
                  label="feed"
                  :options="filteredFeedOptions"
                  use-input
                  @filter="filterFeed"
                >
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
        <q-list separator>
          <RSSEntry
            v-for="(entry, index) in entries"
            :key="entry.id"
            v-model="entries[index]"
          />
          <q-inner-loading :showing="fetching" />
        </q-list>
        <q-page-sticky :offset="[16, 16]">
          <q-btn
            color="secondary"
            fab
            icon="refresh"
            :loading="fetching"
            @click="fetched.execute()"
          />
        </q-page-sticky>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import lodash from "lodash";
import type { QSelect } from "quasar";

const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);
const selectedCategoryId = ref(null);
const selectedFeedId = ref(null);

const { $client } = useNuxtApp();

const fetched = useAsyncData("entres", () =>
  $client.miniflux.getEntries.query({}),
);
const fetching = computed(() => fetched.status.value === "pending");
const entries = computed(() => fetched.data.value?.entries || []);
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
const filteredCategoryOptions = ref<{ value: number; label: string }[]>();
const total = computed(() => fetched.data.value?.total || 0);
useHead({
  title: () => `(${total.value}) unread entries`,
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
</script>

<style scoped></style>
