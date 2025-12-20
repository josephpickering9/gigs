<template>
  <div class="card bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-primary/20">
    <div class="card-body">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <p class="text-sm font-medium text-base-content/70 uppercase tracking-wide">{{ label }}</p>
          <h3 class="text-3xl font-bold text-primary mt-2">{{ value }}</h3>
          <p v-if="subtitle" class="text-sm text-base-content/60 mt-1">{{ subtitle }}</p>
        </div>
        <div v-if="icon" class="rounded-full bg-primary/20 p-3">
          <Icon :name="icon" class="w-8 h-8 text-primary" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
}>();
</script>
