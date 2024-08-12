<script setup lang="ts">
import type { LinkdingBookmarkResponse } from "~/types";

const params = useUrlSearchParams("history");

const q = ref(params.q || "");
watch(q, (next) => {
  params.q = next;
  if (!next) delete params.q;
});

const requestPath = computed(
  () => `/api/linkding/bookmarks?q=${q.value || ""}`,
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
            :loading="status === 'pending'"
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
