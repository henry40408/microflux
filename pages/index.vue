<script setup lang="ts">
const { data } =
  await useFetch<MinifluxGetFeedCompactEntriesResponse>("/api/entries");
</script>

<template>
  <div>
    <Entry
      v-for="(entry, index) in data.entries"
      :key="entry.id"
      v-model="data.entries[index]"
    />
  </div>
</template>
