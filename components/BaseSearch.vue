<script setup lang="ts">
const model = defineModel<string | undefined>({ required: true });

const queryString = ref(model.value);

const search = () => {
  model.value = queryString.value?.toString().trim();
};
const debouncedSearch = useDebounceFn(search, 300);
watch(queryString, () => {
  debouncedSearch();
});

function resetQuery() {
  queryString.value = "";
}
</script>

<template>
  <div flex flex-col items-end md:flex-row md:items-center md:space-x-2>
    <input v-model="queryString" type="text" placeholder="search" mx-0 p-2 />
    <a v-if="queryString" block href="#" @click.prevent="resetQuery">reset</a>
  </div>
</template>
