<template>
  <dialog :class="['modal', { 'modal-open': modelValue }]">
    <div class="modal-box w-11/12 max-w-5xl">
      <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
        <Icon name="mdi:image-multiple" class="w-6 h-6 text-primary" />
        Select Image
      </h3>
      
      <p class="py-4 text-base-content/70">
        We found the following images for this gig. Select the one you want to use.
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div 
          v-for="(img, index) in images" 
          :key="index"
          class="relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200"
          :class="selectedImage === img ? 'border-primary ring-2 ring-primary ring-offset-2 bg-base-200' : 'border-transparent hover:border-base-content/20'"
          @click="selectedImage = img"
        >
          <div class="aspect-[4/3] w-full">
            <img 
              :src="img" 
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          </div>
          
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <div class="btn btn-circle btn-sm btn-ghost bg-base-100/90 text-primary">
                <Icon name="mdi:check" class="w-5 h-5" />
             </div>
          </div>

          <div v-if="selectedImage === img" class="absolute top-2 right-2">
             <div class="btn btn-circle btn-xs btn-primary shadow-sm">
                <Icon name="mdi:check" class="w-3 h-3 text-primary-content" />
             </div>
          </div>
        </div>
      </div>

      <div class="modal-action">
        <button class="btn btn-ghost" @click="close">Cancel</button>
        <button 
            class="btn btn-primary gap-2" 
            :disabled="!selectedImage"
            @click="confirm"
        >
            <Icon name="mdi:content-save-check" class="w-5 h-5" />
            Apply Selected Image
        </button>
      </div>
    </div>
    <div class="modal-backdrop" @click="close" />
  </dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  images: string[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'select', image: string): void;
}>();

const selectedImage = ref<string | null>(null);

watch(() => props.modelValue, (val) => {
    if (val) {
        selectedImage.value = null; 
    }
});

const close = () => {
  emit('update:modelValue', false);
};

const confirm = () => {
  if (selectedImage.value) {
    emit('select', selectedImage.value);
    close();
  }
};
</script>
