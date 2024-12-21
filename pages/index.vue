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

const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);

const { $client } = useNuxtApp();

const fetched = useAsyncData("entres", () =>
  $client.miniflux.getEntries.query({}),
);
const fetching = computed(() => fetched.status.value === "pending");
const entries = computed(() => fetched.data.value?.entries || []);
const feeds = computed(() =>
  lodash.uniqBy(
    entries.value.map((e) => e.feed),
    "id",
  ),
);
const categories = computed(() =>
  lodash.uniqBy(
    feeds.value.map((f) => f.category),
    "id",
  ),
);
const total = computed(() => fetched.data.value?.total || 0);
useHead({
  title: () => `(${total.value}) unread entries`,
});
</script>

<style scoped></style>
