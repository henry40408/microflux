<template>
  <div space-x-2 space-y-2 text-right md:flex md:space-y-0 md:text-left>
    <div>
      <small>navigation</small>
    </div>
    <div>
      <NuxtLink to="/" exact-active-class="text-black dark:text-white">
        miniflux
      </NuxtLink>
    </div>
    <div>
      <NuxtLink to="/linkding" exact-active-class="text-black dark:text-white">
        linkding
      </NuxtLink>
    </div>
    <div>
      <NuxtLink to="/options" exact-active-class="text-black dark:text-white">
        options
      </NuxtLink>
    </div>
  </div>
</template>
