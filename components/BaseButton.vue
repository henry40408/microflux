<template>
  <span>
    <a v-if="initialized" href="#" @click.prevent="$emit('click')">
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

const initialized = computed(() => {
  if (!props.status) return true;
  if (props.status === "idle" || props.status === "error") return true;
  if (props.status === "pending") return false;
  if (props.status === "success") {
    if (props.clear) return false;
    return true;
  }
  return false;
});
const pending = computed(() => props.status === "pending");
const cancellable = computed(() => !!props.clear);
const done = computed(() => {
  if (
    props.status === "idle" ||
    props.status === "pending" ||
    props.status === "error"
  )
    return false;
  if (props.status === "success") {
    if (props.once) return true;
    return false;
  }
  return false;
});
const clearable = computed(
  () => !!props.clear && props.status === "success" && !props.once,
);
</script>

<style scoped></style>
