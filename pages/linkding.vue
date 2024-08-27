<script setup lang="ts">
const query = toRef(useRoute(), "query");

const q = ref(query.value.q?.toString());
watch(q, async () => {
  await navigateTo({ query: { q: q.value || undefined } });
});

const { $client } = useNuxtApp();
const fetched = await useAsyncData(
  `bookmarks-${q.value}`,
  () => $client.linkding.getBookmarks.query({ q: q.value }),
  { watch: [q] },
);
const count = computed(() => fetched.data.value?.count || 0);
const title = computed(() => `(${count.value}) linkding`);
useHead({ title });

const bookmarks = computed(() => fetched.data.value?.results || []);
</script>

<template>
  <div>
    <div space-y-2 text-right md:text-left>
      <NavBar />
      <div items-center space-y-2 md:flex md:space-x-2 md:space-y-0>
        <MyButton
          :pending="fetched.status.value === 'pending'"
          :error="fetched.error.value"
          @click="fetched.execute"
          >🔄 reload</MyButton
        >
        <MySearch v-model="q" />
        <div>{{ count }} entries</div>
      </div>
    </div>
    <div>
      <MyBookmark
        v-for="(bookmark, index) in bookmarks"
        :key="bookmark.id"
        v-model="bookmarks[index]"
        @delete="fetched.execute()"
      />
    </div>
  </div>
</template>
