<script setup lang="ts">
function useMigrate() {
  const status = ref("idle");
  const execute = async () => {
    try {
      status.value = "pending";
      await $fetch("/api/migrate", { method: "POST" });
      status.value = "success";
    } catch (err) {
      status.value = "error";
    }
  };
  return { status, execute };
}
const { status: migrateStatus, execute: executeMigrate } = useMigrate();
</script>

<template>
  <div>
    <PageTitle>Database</PageTitle>
    <NavigationLine />
    <h2>Migrations</h2>
    <div>
      <button mr-2 @click.once="executeMigrate">run</button>
      <span v-if="migrateStatus === 'pending'">migrating...</span>
      <span v-if="migrateStatus === 'success'">done!</span>
      <span v-if="migrateStatus === 'error'">failed!</span>
    </div>
  </div>
</template>
