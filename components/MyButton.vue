<script setup lang="ts">
defineProps<{
  done?: boolean;
  error?: unknown;
  loading?: boolean;
  cancel?: () => void;
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
    <a v-if="!done && !loading" href="#" @click.prevent="$emit('click')"
      ><slot
    /></a>
    <span v-if="!done && loading">
      {{ label }}
      <a v-if="!done && loading" href="#" @click.prevent="cancel?.()"
        >cancel</a
      ></span
    >
    <span v-if="!done && !loading && error">{{ error }}</span>
    <span v-if="done && cancel"
      ><a href="#" @click.prevent="cancel?.()"
        ><slot name="done">reset</slot></a
      ></span
    >
    <span v-if="done && !cancel">done!</span>
  </span>
</template>
