<template>
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
      <q-btn color="secondary" fab icon="refresh" @click="fetched.execute()" />
    </q-page-sticky>
  </q-page>
</template>

<script setup lang="ts">
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
