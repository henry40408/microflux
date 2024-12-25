<template>
  <ClientOnly>
    <template #fallback>
      <PagePlaceholder />
    </template>
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
            <q-item-section :class="textClass">Unread entries</q-item-section>
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
              <q-item-section>
                {{ formatNumber(feeds.length) }} feeds
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-icon name="folder" />
              </q-item-section>
              <q-item-section>
                {{ formatNumber(categories.length) }} categories
              </q-item-section>
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
                    <template #selected>{{
                      selectedFeed?.label || ""
                    }}</template>
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
              <template v-for="(group, date) in entriesByDate" :key="date">
                <q-item-label header>{{ date }}</q-item-label>
                <RSSEntry
                  v-for="(entry, index) in group"
                  :key="entry.id"
                  v-model="group[index]"
                  @select-category="(id) => (selectedCategoryId = id)"
                  @select-feed="(id) => (selectedFeedId = id)"
                />
              </template>
              <q-item
                v-if="!loading && !entries.length"
                class="text-grey text-italic"
              >
                no entries
              </q-item>
              <q-inner-loading :showing="loading" />
            </q-list>
          </q-pull-to-refresh>
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
                icon="refresh"
                label="Refresh"
                label-position="left"
                @click="fetched.execute()"
              />
              <q-fab-action
                color="secondary"
                external-label
                icon="done_all"
                label="Mark all as done"
                label-position="left"
                @click="marking = true"
              />
              <q-fab-action
                v-if="errors.length > 0"
                color="negative"
                external-label
                icon="error_outline"
                label="Show errors"
                label-position="left"
                @click="showingErrors = true"
              />
            </q-fab>
            <q-dialog v-model="showingErrors">
              <q-card>
                <q-card-section>
                  <q-list separator>
                    <q-item v-for="e in errors" :key="e.id">
                      <q-item-section>
                        <q-item-label>{{ e.error }}</q-item-label>
                        <q-item-label caption>{{ e.timestamp }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item v-if="errors.length <= 0">
                      <q-item-section class="text-grey text-italic">
                        no errors
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
                <q-card-actions align="right">
                  <q-btn flat label="Clear" @click="clearErrors()" />
                  <q-btn flat label="Dismiss" @click="showingErrors = false" />
                </q-card-actions>
              </q-card>
            </q-dialog>
            <q-dialog v-model="marking">
              <q-card>
                <q-card-section>Mark all as done?</q-card-section>
                <q-card-actions align="right">
                  <q-btn flat label="Cancel" @click="marking = false" />
                  <q-btn
                    color="negative"
                    label="Yes"
                    :loading="loading"
                    @click="markAllAsDone"
                  />
                  <q-btn
                    color="negative"
                    label="Yes and refresh"
                    :loading="loading"
                    @click="markAllAsDoneAndRefresh"
                  />
                </q-card-actions>
              </q-card>
            </q-dialog>
          </q-page-sticky>
        </q-page>
      </q-page-container>
    </q-layout>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useRouteQuery } from "@vueuse/router";
import { format } from "date-fns";
import lodash from "lodash";
import { useQuasar } from "quasar";

import { clearErrors, errors } from "~/utils/add-error";
import type { MinifluxCompactEntry } from "~/server/trpc/routers/miniflux";

const $q = useQuasar();

const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);
const marking = ref(false);
const showingErrors = ref(false);
const textClass = computed(() =>
  $q.dark.isActive ? "text-white" : "text-dark",
);

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
const entriesByDate = computed(() =>
  lodash(entries.value)
    .groupBy((e) => format(new Date(e.published_at), "yyyy-MM-dd"))
    .value(),
);
watch(
  () => entries.value,
  async (next) => {
    await handleEmptyEnties(next);
  },
);

async function handleEmptyEnties(
  _entries: Ref<MinifluxCompactEntry[]> | MinifluxCompactEntry[],
) {
  const entries = toValue(_entries);
  if (entries.length <= 0) {
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
}

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

const markedAllAsRead = useAsyncData(
  "mark-all-as-read",
  () =>
    $client.miniflux.updateEntries.mutate({
      entryIds: entries.value.map((e) => e.id),
      status: "read",
    }),
  { immediate: false, server: false },
);
async function markAllAsDone() {
  try {
    await markedAllAsRead.execute();
    for (let i = 0; i < entries.value.length; i += 1) {
      entries.value[i].status = "read";
    }
  } catch (err) {
    addError(err);
  } finally {
    marking.value = false;
  }
}

async function markAllAsDoneAndRefresh() {
  try {
    await markAllAsDone();
    await fetched.execute();
  } catch (err) {
    addError(err);
  }
}

async function refreshEntries(done: () => void) {
  try {
    await fetched.execute();
  } catch (err) {
    addError(err);
  } finally {
    done();
  }
}

const loading = computed(() =>
  [fetched.status.value, markedAllAsRead.status.value].includes("pending"),
);

watch(
  () => [fetched.error.value, markedAllAsRead.error.value],
  (errors) => {
    for (const error of errors) {
      if (error) addError(error);
    }
  },
);
</script>

<style scoped></style>
