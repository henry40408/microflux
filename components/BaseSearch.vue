<template>
  <form @submit.prevent="void 0">
    <div>
      <label :for="id">search</label>
      <input :id="id" v-model="model" placeholder="keyword..." />
      <a v-if="modelValue" href="#" @click.prevent="reset">reset</a>
    </div>
  </form>
</template>

<script setup lang="ts">
const model = defineModel<string>();

const id = useId();

function reset() {
  model.value = "";
}
</script>

<style scoped></style>
