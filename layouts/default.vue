<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-primary text-white" elevated>
      <q-toolbar>
        <q-btn
          dense
          flat
          icon="menu"
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
        />
        <q-toolbar-title> unread entries </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered show-if-above side="left">
      <!-- drawer content -->
    </q-drawer>

    <q-page-container>
      <slot />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
const leftDrawerOpen = ref(false);
</script>

<style scoped></style>
