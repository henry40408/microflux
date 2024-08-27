<script setup lang="ts">
defineProps<{
  clear?: () => void;
  done?: boolean;
  error?: unknown;
  pending?: boolean;
}>();

defineEmits<{ click: [] }>();

const counter = useInterval(500);
const label = computed(() => {
  const icons = ["⌛", "⏳"];
  return icons[counter.value % icons.length];
});
</script>

<template>
  <span>
    <a v-if="!done && !pending" href="#" @click.prevent="$emit('click')"
      ><slot
    /></a>
    <span v-if="!done && pending">
      {{ label }}
      <a v-if="!done && pending" href="#" @click.prevent="clear?.()"
        >cancel</a
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
