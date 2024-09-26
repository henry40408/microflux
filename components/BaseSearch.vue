<template>
  <form>
    <div>
      <label :for="id">search</label>
      <input :id="id" v-model="model" placeholder="keyword..." />
    </div>
  </form>
</template>

<script setup lang="ts">
const model = defineModel<string>();

const id = useId();
</script>

<style scoped></style>
