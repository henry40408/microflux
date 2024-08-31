<template>
  <span>
    <a v-if="isInitial" href="#" @click.prevent="$emit('click')">
      <slot />
    </a>
    <span v-if="pending">
      <BaseSpinner />
      <span v-if="cancellable">
        {{ " " }}
        <a href="#" @click.prevent="props.clear?.()">cancel</a>
      </span>
    </span>
    <span v-if="done">done!</span>
    <span v-if="clearable">
      <a href="#" @click.prevent="props.clear?.()">
        <slot name="clear">clear</slot>
      </a>
    </span>
    <span v-if="status === 'error'">{{ " " }}{{ error }}</span>
  </span>
</template>

<script setup lang="ts">
import type { AsyncDataRequestStatus } from "#app";

const props = defineProps<{
  clear?: () => void;
  error?: unknown;
  once?: boolean;
  status?: AsyncDataRequestStatus;
}>();

defineEmits<{ click: [] }>();

const isInitial = computed(
  () =>
    props.status !== "pending" &&
    !(props.status === "success" && !!props.clear),
);
const pending = computed(() => props.status === "pending");
const cancellable = computed(() => !!props.clear);
const done = computed(() => props.status === "success" && props.once);
const clearable = computed(
  () => !!props.clear && props.status === "success" && !props.once,
);
</script>

<style scoped></style>
