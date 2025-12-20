<template>
  <div v-if="totalPages > 1" class="join flex justify-center mt-8">
    <button 
        class="join-item btn" 
        :class="{ 'btn-disabled': currentPage <= 1 }"
        @click="$emit('change', currentPage - 1)"
    >
        «
    </button>
    <button class="join-item btn pointer-events-none">
        Page {{ currentPage }} of {{ totalPages }}
    </button>
    <button 
        class="join-item btn" 
        :class="{ 'btn-disabled': currentPage >= totalPages }"
        @click="$emit('change', currentPage + 1)"
    >
        »
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentPage: number;
  totalPages: number;
}

defineProps<Props>();

defineEmits<{
  'change': [page: number];
}>();
</script>
