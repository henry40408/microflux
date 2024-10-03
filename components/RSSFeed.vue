<template>
  <div>
    <div v-if="editing">
      <form @submit.prevent="submit">
        <fieldset>
          <legend>edit {{ model.title }}</legend>
          <p><BaseButton @click="cancel">cancel</BaseButton></p>
          <label :for="feedTitleId">title</label>
          <input :id="feedTitleId" v-model="feedTitle" type="text" />
          <label :for="feedUrlId">title</label>
          <input :id="feedUrlId" v-model="feedUrl" type="text" />
          <label :for="feedCategoryId">category</label>
          <select :id="feedCategoryId" v-model="feedCategory">
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.title }}
            </option>
          </select>
          <input type="submit" value="update" :disabled="!shouldUpdate" />
          <div v-if="updated.error">{{ updated.error }}</div>
        </fieldset>
      </form>
    </div>
    <div v-if="!editing">
      <h2>
        <NuxtLink :to="model.site_url">{{ model.title }}</NuxtLink>
        ({{ unread }}/{{ read }})
      </h2>
      <p>
        category: {{ model.category.title }}, feed URL:
        <code>{{ model.feed_url }}</code>
      </p>
      <p>
        <BaseButton @click="toggleEdit(true)">edit</BaseButton>,
        <BaseConfirm
          once
          :error="deleted.error"
          :status="deleted.status.value"
          @confirm="doDelete"
          >delete</BaseConfirm
        >
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  MinifluxCompactCategory,
  MinifluxCompactFeed,
} from "~/server/trpc/routers/miniflux";

const model = defineModel<MinifluxCompactFeed>({ required: true });

const props = defineProps<{
  categories: MinifluxCompactCategory[];
  read: number;
  unread: number;
}>();

const emit = defineEmits<{
  deleted: [id: number];
}>();

const feedCategoryId = useId();
const feedCategory = ref(model.value.category.id);
const feedTitle = ref(model.value.title);
const feedTitleId = useId();
const feedUrl = ref(model.value.feed_url);
const feedUrlId = useId();
const [editing, toggleEdit] = useToggle(false);

const { $client } = useNuxtApp();
const updated = useAsyncData(
  `update-feed:${model.value.id}`,
  () =>
    $client.miniflux.updateFeed.mutate({
      id: model.value.id,
      categoryId: feedCategory.value,
      title: feedTitle.value,
      feedUrl: feedUrl.value,
    }),
  { immediate: false, server: false },
);
const deleted = useAsyncData(
  `delete-feed:${model.value.id}`,
  () => $client.miniflux.deleteFeed.mutate(model.value.id),
  { immediate: false, server: false },
);
const pending = computed(
  () =>
    updated.status.value === "pending" || deleted.status.value === "pending",
);
const shouldUpdate = computed(
  () => !!feedTitle.value && !!feedUrl.value && !pending.value,
);

async function doDelete() {
  await deleted.execute();
  emit("deleted", model.value.id);
}

async function submit() {
  updated.clear();
  await updated.execute();
  await nextTick();
  if (updated.status.value === "success") {
    const c = props.categories.find((c) => c.id === feedCategory.value);
    if (c) model.value.category = c;

    model.value.title = feedTitle.value;
    model.value.feed_url = feedUrl.value;
    toggleEdit(false);
  }
}

async function cancel() {
  feedCategory.value = model.value.category.id;
  feedTitle.value = model.value.title;
  feedUrl.value = model.value.feed_url;
  toggleEdit(false);
}
</script>

<style scoped></style>
