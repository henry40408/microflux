<script setup lang="ts">
const { $client } = useNuxtApp();
const fetched = useAsyncData("entries", () =>
  $client.miniflux.getEntries.query({}),
);
const entries = computed(() => fetched.data.value?.entries || []);
const unreadEntries = computed(
  () => entries.value.filter((e) => e.status === "unread") || [],
);
useHead({
  title: `(${unreadEntries.value.length}) miniflux`,
});
</script>

<template>
  <div>
    <header>
      <NavBar />
      <h1>miniflux</h1>
    </header>
    <main>
      <h2>actions</h2>
      <ul>
        <li>
          <BaseButton
            :error="fetched.error"
            :status="fetched.status.value"
            @click="fetched.execute"
            >reload</BaseButton
          >
        </li>
      </ul>
      <h2>outlines</h2>
      <h2>entries</h2>
      <div v-for="(entry, index) in entries" :key="entry.id">
        <RSSEntry v-model="entries[index]" />
      </div>
    </main>
  </div>
</template>
