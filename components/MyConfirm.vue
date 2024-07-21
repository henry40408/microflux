<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  error?: unknown;
  loading?: boolean;
  repeated?: boolean;
}>();

const emit = defineEmits(["confirm"]);

type Stage = "init" | "pending" | "confirmed";

const stage = ref<Stage>("init");

function setStage(newStage: Stage) {
  if (newStage === "confirmed") emit("confirm");
  stage.value = newStage;
  if (newStage === "confirmed" && props.repeated) stage.value = "init";
}
</script>

<template>
  <span class="uppercase">
    [
    <a href="#" v-if="stage === 'init'" @click.prevent="setStage('pending')"
      ><slot
    /></a>
    <span v-if="stage === 'pending'">
      <span>confirm?</span>
      {{ " " }}
      <a href="#" @click.prevent="setStage('confirmed')" class="text-red"
        >yes</a
      >
      {{ " " }}
      <a href="#" @click.prevent="setStage('init')">no</a>
    </span>
    <span v-if="loading">...</span>
    <span v-if="stage === 'confirmed'">done!</span>
    <span v-if="error">{{ error }}</span>
    ]
  </span>
</template>
