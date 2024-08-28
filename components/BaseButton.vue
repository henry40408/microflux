<script setup lang="ts">
defineProps<{
  clear?: () => void;
  done?: boolean;
  error?: unknown;
  pending?: boolean;
}>();

defineEmits<{ click: [] }>();
</script>

<template>
  <span>
    <a v-if="!done && !pending" href="#" @click.prevent="$emit('click')"
      ><slot
    /></a>
    <span v-if="!done && pending">
      <a v-if="!done && pending" href="#" @click.prevent="clear?.()"
        ><BaseSpinner /> cancel</a
      ></span
    >
    <span v-if="!done && !pending && error">{{ error }}</span>
    <span v-if="done && clear"
      ><a href="#" @click.prevent="clear?.()"
        ><slot name="clear">reset</slot></a
      ></span
    >
    <span v-if="done && !clear">done!</span>
  </span>
</template>
