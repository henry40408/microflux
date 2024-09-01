<template>
  <a href="#" @click.prevent="toggle()">
    <span v-if="!absolute">{{ ago(datetime) }}</span>
    <span v-if="absolute">{{ datetime }}</span></a
  >
</template>

<script setup lang="ts">
const [absolute, toggle] = useToggle(false);

defineProps<{ datetime: string }>();
</script>

<style scoped></style>
