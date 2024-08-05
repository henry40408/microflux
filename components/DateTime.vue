<script setup lang="ts">
import { formatISO9075 } from "date-fns";

const props = defineProps<{ datetime: string }>();

const [absolute, toggle] = useToggle(false);
</script>

<template>
  <a href="#" @click.prevent="toggle()">
    <time v-if="!absolute" :datetime="props.datetime">{{
      ago(props.datetime)
    }}</time>
    <time v-if="absolute" :datetime="props.datetime">{{
      formatISO9075(new Date(props.datetime))
    }}</time>
  </a>
</template>
