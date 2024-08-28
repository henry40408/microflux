<script setup lang="ts">
const queryParams = toRef(useRoute(), "query");

const queryString = ref(queryParams.value.q?.toString());
watch(queryString, async () => {
  await navigateTo({ query: { q: queryString.value || undefined } });
});

const { $client } = useNuxtApp();
const fetched = await useAsyncData(
  `bookmarks-${queryString.value}`,
  () => $client.linkding.getBookmarks.query({ q: queryString.value }),
  { watch: [queryString] },
);
const count = computed(() => fetched.data.value?.count || 0);
const title = computed(() => `(${count.value}) linkding`);
useHead({ title });

const bookmarks = computed(() => fetched.data.value?.results || []);
</script>

<template>
  <div space-y-2>
    <div space-y-2 text-right md:text-left>
      <NavBar />
      <div items-center space-y-2 md:flex md:space-x-2 md:space-y-0>
        <BaseButton
          :pending="fetched.status.value === 'pending'"
          :error="fetched.error.value"
          @click="fetched.execute"
          >🔄 reload</BaseButton
        >
        <BaseSearch v-model="queryString" />
        <div>{{ count }} entries</div>
      </div>
    </div>
    <AppBookmarkAddForm @add="fetched.refresh()" />
    <div>
      <AppBookmark
        v-for="(bookmark, index) in bookmarks"
        :key="bookmark.id"
        v-model="bookmarks[index]"
        @delete="fetched.execute()"
      />
    </div>
  </div>
</template>
