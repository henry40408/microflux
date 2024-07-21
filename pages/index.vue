<script setup lang="ts">
const { data, status, execute } =
  await useFetch<MinifluxGetFeedCompactEntriesResponse>("/api/entries");
</script>

<template>
  <div>
    <div>
      <MyButton :loading="status === 'pending'" @click="execute"
        >reload</MyButton
      >
    </div>
    <div>
      <Entry
        v-for="(entry, index) in data.entries"
        :key="entry.id"
        v-model="data.entries[index]"
      />
    </div>
  </div>
</template>
