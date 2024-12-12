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
        <div class="position-relative">
          <div v-for="(entry, index) in entries" :key="entry.id">
            <RSSEntry v-model="entries[index]" />
          </div>
          <v-overlay
            contained
            class="d-flex justify-center align-center"
            v-model="loading"
          >
            <v-progress-circular indeterminate />
          </v-overlay>
        </div>
        <v-speed-dial location="top end" transition="fade-transition">
          <template v-slot:activator="{ props: activatorProps }">
            <v-fab
              app
              location="bottom end"
              v-bind="activatorProps"
              icon="mdi-menu"
            ></v-fab>
          </template>
          <v-btn
            key="1"
            icon="mdi-reload"
            color="success"
            @click.prevent="refresh"
          />
        </v-speed-dial>
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

async function refresh() {
  await fetched.execute();
}

const loading = computed(() => [fetched.status.value].includes("pending"));
</script>

<style scoped></style>
