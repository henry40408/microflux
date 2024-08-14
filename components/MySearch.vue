<script setup lang="ts">
const model = defineModel<string | undefined>({ required: true });

const q = ref(model.value);

const search = () => {
  model.value = q.value?.toString().trim();
};
const debouncedSearch = useDebounceFn(search, 300);
watch(q, () => {
  debouncedSearch();
});

function resetQuery() {
  q.value = "";
}
</script>

<template>
  <div flex flex-col items-end md:flex-row md:items-center md:space-x-2>
    <input v-model="q" type="text" placeholder="search" mx-0 p-2 />
    <a v-if="q" block href="#" @click.prevent="resetQuery">reset</a>
  </div>
</template>
