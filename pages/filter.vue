<script setup lang="ts">
const { data, error, status } = await useFetch("/api/filter/keywords");
</script>

<template>
  <div>
    <PageTitle>Filter</PageTitle>
    <NavigationLine />
    <div v-if="error">
      <pre><code>{{ error }}</code></pre>
    </div>
    <h2>Keywords</h2>
    <div v-if="status === 'pending'">loading...</div>
    <table v-if="data && data.length > 0">
      <thead>
        <tr>
          <th>ID</th>
          <th>Keyword</th>
          <th>Feed ID</th>
          <th>Category ID</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="keyword in data" :key="keyword.id">
          <td>{{ keyword.id }}</td>
          <td>{{ keyword.keyword }}</td>
          <td>{{ keyword.feedId }}</td>
          <td>{{ keyword.categoryId }}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
    <div v-if="data && data.length <= 0" font-italic>(no keywords)</div>
  </div>
</template>
