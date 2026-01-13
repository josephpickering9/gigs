<template>
  <div class="p-6 space-y-6">
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-base-content">Gig Image</h3>
      
      <!-- Current Image Preview -->
      <div v-if="imageUrl" class="space-y-2">
        <label class="label">
          <span class="label-text font-medium">Current Image</span>
        </label>
        <div class="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border border-base-300 shadow-md">
          <img 
            :src="imageUrl" 
            alt="Gig image" 
            class="w-full h-full object-cover"
            @error="handleImageError"
          >
        </div>
      </div>

      <!-- Image URL Input -->
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text font-medium">Image URL</span>
        </label>
        <input 
          v-model="localImageUrl"
          type="text" 
          placeholder="Enter image URL" 
          class="input input-bordered w-full"
          @input="handleInput"
        >
        <label class="label">
          <span class="label-text-alt">Paste a direct link to an image</span>
        </label>
      </div>

      <!-- No Image State -->
      <div v-if="!imageUrl && !localImageUrl" class="alert alert-info">
        <Icon name="mdi:information" class="w-5 h-5" />
        <span>No image set for this gig. Add an image URL above or use the "Enrich Gig Data" button to find images automatically.</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  imageUrl?: string;
}>();

const emit = defineEmits<{
  (e: 'update:imageUrl', value: string): void;
}>();

const localImageUrl = ref(props.imageUrl || '');

watch(() => props.imageUrl, (newValue) => {
  localImageUrl.value = newValue || '';
});

const handleInput = () => {
  emit('update:imageUrl', localImageUrl.value);
};

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" font-size="18" text-anchor="middle" fill="%23999"%3EImage not found%3C/text%3E%3C/svg%3E';
};
</script>
