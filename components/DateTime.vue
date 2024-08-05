<script setup lang="ts">
import { useToggle } from "@vueuse/core";

const props = defineProps<{ datetime: string }>();

const [absolute, toggle] = useToggle(false);
</script>

<template>
  <a href="#" @click.prevent="toggle()">
    <time v-if="!absolute" :datetime="props.datetime">{{
      ago(props.datetime)
    }}</time>
    <time v-if="absolute" :datetime="props.datetime">{{ props.datetime }}</time>
  </a>
</template>
