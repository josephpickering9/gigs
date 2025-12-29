<template>
  <component
    :is="to ? NuxtLink : 'div'"
    :to="to"
    class="card bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-primary/20 block h-full no-underline"
    :class="{ 'cursor-pointer': to }"
  >
    <div class="p-4 flex-1">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <p class="text-sm font-medium text-base-content/70 uppercase tracking-wide">{{ label }}</p>
          <h3 class="text-3xl font-bold text-primary mt-2">{{ value }}</h3>
          <p v-if="subtitle" class="text-sm text-base-content/60 mt-1">{{ subtitle }}</p>
        </div>
        <div v-if="icon" class="rounded-full bg-primary/20 p-3 flex items-center justify-center">
          <Icon :name="icon" class="w-8 h-8 text-primary" />
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components';

defineProps<{
  label: string;
  value: string | number;
  subtitle?: string;
  to?: string;
  icon?: string;
}>();
</script>
