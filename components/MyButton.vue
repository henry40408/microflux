<script setup lang="ts">
defineProps<{
  clear?: () => void;
  done?: boolean;
  error?: unknown;
  pending?: boolean;
}>();

defineEmits<{ click: [] }>();

const counter = useInterval(300);
const label = computed(() => {
  const l = 3;
  const s = [];
  for (let i = 0; i < l; i += 1) {
    s.push((counter.value - i) % l === 0 ? ":" : ".");
  }
  return s.join("");
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
