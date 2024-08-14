<script setup lang="ts">
import type { LinkdingBookmarkResponse } from "~/types";

const query = toRef(useRoute(), "query");

const q = ref(query.value.q?.toString());
watch(q, async () => {
  await navigateTo({ query: { q: q.value || undefined } });
});

const requestPath = computed(() =>
  q.value ? `/api/linkding/bookmarks?q=${q.value}` : "/api/linkding/bookmarks",
);
const { data, status, error, execute } =
  await useFetch<LinkdingBookmarkResponse>(requestPath);
const count = computed(() => data.value?.count || 0);
const title = computed(() => `(${count.value}) linkding`);
useHead({ title });

const bookmarks = computed(() => data.value?.results || []);
</script>

<template>
  <div>
    <div space-y-2 text-right md:text-left>
      <NavBar />
      <div items-center space-y-2 md:flex md:space-x-2 md:space-y-0>
        <div space-x-2>
          <small>actions</small>
          <MyButton
            :pending="status === 'pending'"
            :error="error"
            @click="execute"
            >reload</MyButton
          >
        </div>
        <MySearch v-model="q" />
        <div>{{ count }} entries</div>
      </div>
    </div>
    <div>
      <MyBookmark
        v-for="(bookmark, index) in bookmarks"
        :key="bookmark.id"
        v-model="bookmarks[index]"
        @delete="execute()"
      />
    </div>
  </div>
</template>
