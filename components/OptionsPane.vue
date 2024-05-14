<script setup lang="ts">
const { readOnScroll, readabilityContent, readabilityBeforeSummarization } =
  useOptions();
</script>

<template>
  <details>
    <summary>&#x2699;&#xFE0F; options</summary>
    <blockquote>Note: These options are saved in local storage.</blockquote>
    <h2>Miniflux</h2>
    <div>
      <h3>Read on scroll</h3>
      <div>
        <label for="ros">
          <input id="ros" v-model="readOnScroll" type="checkbox" />
          Mark entry as read on scorll
        </label>
      </div>
    </div>
    <h2>Readability</h2>
    <div>
      <h3>Content type</h3>
      <div>
        <label for="rc1">
          <input
            id="rc1"
            v-model="readabilityContent"
            type="radio"
            value="content"
          />
          Content (HTML)
        </label>
      </div>
      <div>
        <label for="rc2">
          <input
            id="rc2"
            v-model="readabilityContent"
            type="radio"
            value="textContent"
          />
          Text content (plain text)
        </label>
      </div>
    </div>
    <div>
      <h3>Readability before summarization</h3>
      <label for="rbs1">
        <input
          id="rbs1"
          v-model="readabilityBeforeSummarization"
          type="checkbox"
        />
        Summarize the readability version to reduce costs. The readability
        version might lead to a less accurate summary.
      </label>
    </div>
  </details>
</template>
