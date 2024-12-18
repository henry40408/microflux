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
            <q-item-section>{{ total }} entries</q-item-section>
          </q-item>
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
const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);

const { $client } = useNuxtApp();

const fetched = useAsyncData("entres", () =>
  $client.miniflux.getEntries.query({}),
);
const fetching = computed(() => fetched.status.value === "pending");
const entries = computed(() => fetched.data.value?.entries || []);
const total = computed(() => fetched.data.value?.total || 0);
useHead({
  title: () => `(${total.value}) unread entries`,
});
</script>

<style scoped></style>
