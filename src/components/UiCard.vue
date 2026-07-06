<script setup>
defineProps({
  title: String,
  desc: String,
  tag: String
});
</script>

<template>
  <section class="ui-card">
    <header v-if="title || tag" class="ui-card__head">
      <div>
        <h2 v-if="title">{{ title }}</h2>
        <p v-if="desc">{{ desc }}</p>
      </div>
      <span v-if="tag" class="Label Label--secondary">{{ tag }}</span>
    </header>
    <div class="ui-card__body">
      <slot />
    </div>
  </section>
</template>
