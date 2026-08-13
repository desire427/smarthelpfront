<script setup>
defineProps({
  apiOnline: {
    type: Boolean,
    required: true,
  },
})
</script>

<template>
  <header>
    <span class="brand-name">SmartHelp</span>
    <div class="status-pill">
      <span
        class="dot"
        :style="{ background: apiOnline ? 'var(--indigo)' : '#e55' }"
      ></span>
      {{ apiOnline ? 'API en ligne' : 'API hors ligne' }}
    </div>
  </header>
</template>
