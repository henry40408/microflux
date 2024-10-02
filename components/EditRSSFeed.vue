<template>
  <div>
    <div v-if="!editable">
      <h2>
        <NuxtLink :to="feed.site_url" target="_blank">{{
          feed.title
        }}</NuxtLink>
        ({{ unread }}/{{ read }})
      </h2>
      <div>
        <small>feed URL: {{ feed.feed_url }}</small>
      </div>
      <p>
        <a href="#" @click.prevent="toggleEdit()">edit</a>,
        <DeleteRSSFeed :feed="feed" @deleted="$emit('deleted')" />
      </p>
      <p>
        <RSSCategorySelect
          :feed-id="feed.id"
          :categories="categories"
          :selected-category="feed.category"
        />
      </p>
    </div>
    <div v-if="editable">
      <form @submit.prevent="submit">
        <p>
          <a href="#" @click.prevent="cancel">cancel</a>
        </p>
        <label>title</label>
        <input v-model="feedTitle" />
        <label>feed url</label>
        <input v-model="feedUrl" />
        <input type="submit" value="update" :disabled="!valid" />
        <div v-if="updated.error">{{ updated.error }}</div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  MinifluxCompactCategory,
  MinifluxCompactFeed,
} from "~/server/trpc/routers/miniflux";

const emit = defineEmits<{
  deleted: [];
  updated: [];
}>();

const props = defineProps<{
  categories: MinifluxCompactCategory[];
  feed: MinifluxCompactFeed;
  read: number;
  unread: number;
}>();

const [editable, toggleEdit] = useToggle(false);
const feedTitle = ref(props.feed.title);
const feedUrl = ref(props.feed.feed_url);
const valid = computed(() => !!feedTitle.value && !!feedUrl.value);

const { $client } = useNuxtApp();
const updated = useAsyncData(
  `update-feed:${props.feed.id}`,
  () =>
    $client.miniflux.updateFeed.mutate({
      id: props.feed.id,
      title: feedTitle.value,
      feedUrl: feedUrl.value,
    }),
  { immediate: false, server: false },
);

async function cancel() {
  feedTitle.value = props.feed.title;
  feedUrl.value = props.feed.feed_url;
}

async function submit() {
  await updated.execute();
  toggleEdit(false);
  emit("updated");
}
</script>

<style scoped></style>
