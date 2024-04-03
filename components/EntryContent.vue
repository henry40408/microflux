<script setup lang="ts">
import { useToggle } from "@vueuse/core";

const content = defineModel<string>("content");
const url = defineModel<string>("url");

const [opened, toggle] = useToggle(false);

function useReadability() {
  const { data, status, execute } = useFetch("/api/miniflux/readability", {
    method: "POST",
    body: { url: url.value },
    immediate: false,
  });
  return { data, status, execute };
}
const {
  data: readabilityData,
  status: readabilityStatus,
  execute: executeReadability,
} = useReadability();
</script>

<template>
  <details :open="opened">
    <summary @click.prevent="toggle()">content</summary>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-if="opened" pb-2 v-html="content" />
    <div v-if="readabilityData">
      <h3 my-2>readable</h3>
      <p>{{ readabilityData.textContent }}</p>
    </div>
    <slot />
    <div text-right space-y-2 md:flex md:space-x-2 md:text-left>
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
