<script setup lang="ts">
import { useConfirmDialog } from "@vueuse/core";

defineProps({
  question: { type: String, default: "are you sure?" },
});

const emit = defineEmits<{
  confirmed: [];
  cancelled: [];
}>();

const { cancel, confirm, isRevealed, onCancel, onConfirm, reveal } =
  useConfirmDialog();

onCancel(() => emit("cancelled"));

onConfirm(() => emit("confirmed"));
</script>

<template>
  <span v-if="isRevealed">
    <span>{{ question }}</span>
    <a text-red href="#" pl-1 @click.prevent="confirm">confirm</a>
    <a href="#" pl-1 @click.prevent="cancel">cancel</a>
  </span>
  <span v-else>
    <a href="#" @click.prevent="reveal"><slot /></a>
  </span>
</template>
