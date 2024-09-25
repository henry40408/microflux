<template>
  <span v-if="pending"><BaseSpinner /></span>
  <span v-if="!pending">
    <span v-if="state === 'init'">
      <a href="#" @click.prevent="to('pending')"><slot /></a>
    </span>
    <span v-if="state === 'pending'">
      <slot name="confirmation">are you sure?</slot>
      {{ " " }}
      <a href="#" class="yes" @click.prevent="to('confirmed')">YES</a>
      {{ " " }}
      <a href="#" @click.prevent="to('init')">no</a>
    </span>
    <span v-if="state === 'confirmed'"><slot name="done">done!</slot></span>
    <span v-if="error">{{ error }}</span>
  </span>
</template>

<script setup lang="ts">
import type { AsyncDataRequestStatus } from "#app";

type State = "init" | "pending" | "confirmed";

const props = defineProps<{
  error?: unknown;
  once?: boolean;
  status?: AsyncDataRequestStatus;
}>();

const emit = defineEmits<{ confirm: [] }>();

const state = ref<State>("init");
const pending = computed(() => props.status === "pending");

function to(newState: State) {
  if (newState === "confirmed") emit("confirm");
  state.value = newState;
  if (newState === "confirmed" && !props.once) state.value = "init";
}
</script>

<style scoped>
.yes {
  color: red;
}
</style>
