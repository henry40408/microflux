<script setup lang="ts">
import { formatISO9075 } from "date-fns";

const props = defineProps<{ datetime: string }>();

const [absolute, setAbsolute] = useToggle(false);
</script>

<template>
  <a href="#" @click.prevent="setAbsolute()">
    <ClientOnly>
      <time v-if="!absolute" :datetime="props.datetime">{{
        ago(props.datetime)
      }}</time>
      <time v-if="absolute" :datetime="props.datetime">{{
        formatISO9075(new Date(props.datetime))
      }}</time>
      <template #fallback>
        <time :datetime="props.datetime">{{ props.datetime }}</time>
      </template>
    </ClientOnly>
  </a>
</template>
