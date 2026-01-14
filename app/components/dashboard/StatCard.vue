<template>
  <div
    class="card bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg border border-primary/20 block h-full"
  >
    <div class="p-4 flex flex-col h-full">
      <div class="flex items-start justify-between mb-2">
        <div class="flex-1">
          <p class="text-sm font-medium text-base-content/70 uppercase tracking-wide">{{ label }}</p>
          <h3 class="text-3xl font-bold text-primary mt-1">{{ value }}</h3>
        </div>
        <div v-if="icon" class="rounded-full bg-primary/20 p-3 flex items-center justify-center shrink-0 ml-4">
          <Icon :name="icon" class="w-8 h-8 text-primary" />
        </div>
      </div>
      
      <div class="flex items-center justify-between mt-auto gap-4">
        <p v-if="subtitle" class="text-sm text-base-content/60 font-medium truncate">{{ subtitle }}</p>
        <span v-else></span> <!-- Spacer to push link to right if no subtitle -->
        
        <NuxtLink 
            v-if="to"
            :to="to" 
            class="btn btn-xs btn-ghost text-primary gap-1 pr-0 hover:bg-transparent hover:text-primary-focus transition-colors shrink-0 ml-auto"
        >
            View
            <Icon name="mdi:arrow-right" class="w-3 h-3" />
        </NuxtLink>
      </div>
    </div>
  </div>
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
