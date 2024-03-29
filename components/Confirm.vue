<script setup lang="ts">
import { useConfirmDialog } from "@vueuse/core";

defineProps({
  question: { type: String, required: true },
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
    {{}}
    <a class="confirm" href="#" @click.prevent="confirm">confirm</a>
    {{}}
    <a href="#" @click.prevent="cancel">cancel</a>
  </span>
  <span v-else>
    <a href="#" @click.prevent="reveal"><slot /></a>
  </span>
</template>

<style scoped>
.confirm {
  color: red;
}
</style>
