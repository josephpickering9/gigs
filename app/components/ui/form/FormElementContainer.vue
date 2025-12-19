<template>
  <div v-if="label || error" class="w-full flex flex-col gap-1">
    <div v-if="label" class="label">
      <span class="label-text">{{ label }}</span>
    </div>
    <slot />
    <div v-if="error" class="label">
       <span class="label-text-alt text-error">{{ error }}</span>
    </div>
  </div>
  <span v-else class="relative w-full">
    <slot />
  </span>
</template>

<script setup lang="ts">
interface Props {
  label?: string | null
  error?: string | null
}

withDefaults(defineProps<Props>(), {
  label: undefined,
  error: undefined,
})
</script>
