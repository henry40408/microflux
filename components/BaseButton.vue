<template>
  <span>
    <span v-if="disabled">
      <slot />
    </span>
    <a v-else-if="initialized" href="#" @click.prevent="$emit('click')">
      <slot />
    </a>
    <span v-else-if="pending">
      <BaseSpinner />
      <span v-if="cancellable">
        {{ " " }}
        <a href="#" @click.prevent="handleClear">cancel</a>
      </span>
    </span>
    <span v-else-if="done">done!</span>
    <span v-else-if="clearable">
      <a href="#" @click.prevent="handleClear">
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
  disabled?: boolean;
  error?: unknown;
  once?: boolean;
  status?: AsyncDataRequestStatus;
}>();

defineEmits<{ click: [] }>();

const pending = computed(() => props.status === "pending");
const initialized = computed(() => {
  if (props.disabled || pending.value) return false;
  if (!props.status) return true;
  if (props.status === "idle" || props.status === "error") return true;
  if (props.status === "success" && !props.clear) return true;
  return false;
});

const cancellable = computed(() => !!props.clear);
const done = computed(() => props.status === "success" && props.once);
const clearable = computed(
  () => !!props.clear && props.status === "success" && !props.once,
);

const handleClear = () => props.clear?.();
</script>

<style scoped></style>
