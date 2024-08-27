<template>
  <div class="my-nav" space-x-2 text-right md:text-left>
    <NuxtLink to="/">miniflux</NuxtLink>
    <NuxtLink to="/linkding">linkding</NuxtLink>
  </div>
</template>

<style scope>
.my-nav a:hover {
  @apply underline-offset-4;
}

.router-link-exact-active {
  @apply underline underline-offset-4;
}
</style>
