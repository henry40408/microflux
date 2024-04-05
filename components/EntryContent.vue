<script setup lang="ts">
import { useToggle } from "@vueuse/core";

import type { MinifluxEntry } from "~/types";

const model = defineModel<MinifluxEntry>();
const url = computed(() => model.value.url);

const [opened, toggle] = useToggle(false);

const {
  data: readabilityData,
  status: readabilityStatus,
  execute: executeReadability,
} = useReadability(url);
</script>

<template>
  <details :open="opened">
    <summary @click.prevent="toggle()">content</summary>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-if="opened" pb-2 v-html="model.content" />
    <div v-if="readabilityData">
      <h3 my-2>readable ({{ formatNumber(readabilityData.length) }} chars)</h3>
      <div border-1 border-dashed border-black p-2 dark:border-white>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="readabilityData.content" />
      </div>
    </div>
    <slot />
    <div text-right space-y-2 md:flex md:space-x-2 md:space-y-0 md:text-left>
      <div>
        <span v-if="readabilityStatus === 'pending'">reading...</span>
        <span v-else-if="readabilityStatus === 'success'">readable!</span>
        <span v-else>
          <a href="#" @click.prevent="executeReadability">readability</a>
          <span v-if="readabilityStatus === 'error'" pl-1>failed!</span>
        </span>
      </div>
      <div>
        <a href="#" @click.prevent="toggle(false)">collapse</a>
      </div>
    </div>
  </details>
</template>
