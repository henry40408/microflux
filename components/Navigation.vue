<template>
  <div>
    <small>navigation</small>
    {{}}
    <NuxtLink to="/">miniflux</NuxtLink>
    |
    <NuxtLink to="/linkding">linkding</NuxtLink>
  </div>
</template>

<style scoped>
.router-link-exact-active {
  color: black;
  @media (prefers-color-scheme: dark) {
    color: white;
  }
}
</style>
