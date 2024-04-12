<script setup lang="ts">
const url = ref("");

const emit = defineEmits<{
  created: [];
}>();

function useCreateBookmark() {
  const status = ref("idle");
  const execute = async () => {
    try {
      status.value = "pending";
      await $fetch("/api/linkding/bookmarks", {
        method: "POST",
        body: { url: toValue(url) },
      });
      url.value = "";
      emit("created");
      status.value = "success";
    } catch (err) {
      console.error("failed to create bookmark", err);
      status.value = "error";
    }
  };
  return { status, execute };
}
const { status: createStatus, execute: executeCreate } = useCreateBookmark();
</script>

<template>
  <div mb-2>
    <form @submit.prevent="executeCreate()">
      <div flex>
        <input v-model="url" type="url" placeholder="URL" required />
        <button
          hidden
          md:inline
          type="submit"
          :disabled="createStatus === 'pending'"
        >
          {{ createStatus === "pending" ? "..." : "add bookmark" }}
        </button>
        <button
          inline
          md:hidden
          type="submit"
          :disabled="createStatus === 'pending'"
        >
          {{ createStatus === "pending" ? "..." : "+" }}
        </button>
      </div>
    </form>
  </div>
</template>
