<template>
  <form @submit.prevent="void 0">
    <fieldset>
      <legend>search</legend>
      <input v-model="model" placeholder="keyword..." />
      <a v-if="modelValue" href="#" @click.prevent="reset">reset</a>
    </fieldset>
  </form>
</template>

<script setup lang="ts">
const model = defineModel<string>();

function reset() {
  model.value = "";
}
</script>

<style scoped></style>
