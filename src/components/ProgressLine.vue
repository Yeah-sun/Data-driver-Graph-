<script setup>
defineProps({
  label: String,
  value: Number,
  state: String
});
</script>

<template>
  <div class="progress-line">
    <div class="progress-line__label">
      <span>{{ label }}</span>
      <strong>{{ state || `${value}%` }}</strong>
    </div>
    <div class="progress-line__track">
      <i :style="{ width: `${value}%` }"></i>
    </div>
  </div>
</template>
