<template>
  <div class="modal modal-open">
    <div class="modal-box relative">
      <button 
        class="btn btn-sm btn-circle absolute right-2 top-2" 
        :disabled="gigStore.importing"
        @click="$emit('close')"
      >
        ✕
      </button>
      
      <h3 class="text-lg font-bold mb-4">Import Gigs</h3>
      
      <div v-if="gigStore.importError" class="alert alert-error mb-4">
        <Icon name="mdi:alert-circle" />
        <span>{{ gigStore.importError }}</span>
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">Select CSV File</span>
        </label>
        <input 
          type="file" 
          accept=".csv"
          class="file-input file-input-bordered w-full" 
          :disabled="gigStore.importing"
          @change="handleFileChange"
        >
        <label class="label">
          <span class="label-text-alt">Supported format: .csv</span>
        </label>
      </div>

      <div class="modal-action">
        <button class="btn" :disabled="gigStore.importing" @click="$emit('close')">
          Cancel
        </button>
        <button 
          class="btn btn-primary" 
          :disabled="!selectedFile || gigStore.importing" 
          @click="handleImport"
        >
          <span v-if="gigStore.importing" class="loading loading-spinner"/>
          {{ gigStore.importing ? 'Importing...' : 'Import' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useGigStore } from '~/store/GigStore';

const emit = defineEmits(['close', 'success']);
const gigStore = useGigStore();
const selectedFile = ref<File | null>(null);

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
  } else {
    selectedFile.value = null;
  }
};

const handleImport = async () => {
  if (!selectedFile.value) return;
  
  await gigStore.importGigs(selectedFile.value);
  
  if (!gigStore.importError) {
    emit('success');
    emit('close');
  }
};
</script>
