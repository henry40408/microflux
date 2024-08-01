<script setup lang="ts">
import { ref } from "vue";
import { useInterval } from "@vueuse/core";

const props = defineProps<{
  danger?: boolean;
  error?: unknown;
  loading?: boolean;
  repeated?: boolean;
}>();

const emit = defineEmits(["confirm"]);

type Stage = "init" | "pending" | "confirmed";

const stage = ref<Stage>("init");

const counter = useInterval(300);
const label = computed(() => {
  const l = 3;
  const s = [];
  for (let i = 0; i < l; i += 1) {
    s.push((counter.value - i) % l === 0 ? ":" : ".");
  }
  return s.join("");
});

function setStage(newStage: Stage) {
  if (newStage === "confirmed") emit("confirm");
  stage.value = newStage;
  if (newStage === "confirmed" && props.repeated) stage.value = "init";
}
</script>

<template>
  <span>
    <a
      v-if="!loading && stage === 'init'"
      href="#"
      @click.prevent="setStage('pending')"
      ><slot
    /></a>
    <span v-if="!loading && stage === 'pending'" space-x-1>
      <span>are you sure?</span>
      <a href="#" text-red-500 @click.prevent="setStage('confirmed')">yes</a>
      <a href="#" @click.prevent="setStage('init')">no</a>
    </span>
    <span v-if="loading">{{ label }}</span>
    <span v-if="!loading && stage === 'confirmed'">done!</span>
    <span v-if="!loading && error">{{ error }}</span>
  </span>
</template>
