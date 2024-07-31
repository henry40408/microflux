<script setup lang="ts">
import type { LinkdingBookmarkResponse } from "~/types";

const { data, status, error, execute } =
  await useFetch<LinkdingBookmarkResponse>("/api/linkding/bookmarks");
const count = computed(() => data.value?.count || 0);
const title = computed(() => `(${count.value}) linkding`);
useHead({ title });

const bookmarks = computed(() => data.value?.results || []);
</script>

<template>
  <div>
    <div space-y-2 text-right md:text-left>
      <NavBar />
      <div space-x-2>
        <small>actions</small>
        <MyButton
          :loading="status === 'pending'"
          :error="error"
          @click="execute"
          >reload</MyButton
        >
      </div>
      <div>{{ count }} entries</div>
    </div>
    <div>
      <Bookmark
        v-for="(bookmark, index) in bookmarks"
        :key="bookmark.id"
        v-model="bookmarks[index]"
        @delete="execute()"
      />
    </div>
  </div>
</template>
