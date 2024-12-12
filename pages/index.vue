<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list>
        <v-list-item href="/" nuxt>unread entries</v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title>unread entries</v-app-bar-title>
    </v-app-bar>
    <v-main>
      <v-container>
        <div v-for="(entry, index) in entries" :key="entry.id">
          <RSSEntry v-model="entries[index]" />
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
const drawer = ref(false);

useHead({
  title: "microflux",
});

const { $client } = useNuxtApp();
const fetched = useAsyncData("entries", () =>
  $client.miniflux.getEntries.query({}),
);
const entries = computed(() => fetched.data.value?.entries || []);
</script>

<style scoped></style>
