<template>
  <div class="modal modal-open">
    <div class="modal-box relative">
      <button 
        class="btn btn-sm btn-circle absolute right-2 top-2" 
        :disabled="importing"
        @click="$emit('close')"
      >
        ✕
      </button>
      
      <h3 class="text-lg font-bold mb-4">
        <Icon name="mdi:calendar-import" class="inline w-6 h-6 mr-2" />
        Import from Google Calendar
      </h3>
      
      <div v-if="error" class="alert alert-error mb-4">
        <Icon name="mdi:alert-circle" />
        <span>{{ error }}</span>
      </div>

      <div v-if="success" class="alert alert-success mb-4">
        <Icon name="mdi:check-circle" />
        <span>Calendar events imported successfully!</span>
      </div>

      <DatePicker
        v-model="startDate"
        label="Start Date (Optional)"
        placeholder="Select start date (leave empty for all past events)"
        :disabled="importing"
      />

      <DatePicker
        v-model="endDate"
        label="End Date (Optional)"
        placeholder="Select end date (leave empty for all future events)"
        :disabled="importing"
      />

      <div class="modal-action">
        <button class="btn" :disabled="importing" @click="$emit('close')">
          Cancel
        </button>
        <button 
          class="btn btn-primary" 
          :disabled="importing" 
          @click="handleImport"
        >
          <span v-if="importing" class="loading loading-spinner"/>
          {{ importing ? 'Importing...' : 'Import Events' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { postApiCalendarImport } from '~~/api';
import DatePicker from '~/components/ui/input/DatePicker.vue';

const emit = defineEmits(['close', 'success']);

const importing = ref(false);
const error = ref<string | null>(null);
const success = ref(false);
const startDate = ref<string | undefined>(undefined);
const endDate = ref<string | undefined>(undefined);

const handleImport = async () => {
  error.value = null;
  success.value = false;
  importing.value = true;
  
  try {
    await postApiCalendarImport({
      body: {
        startDate: startDate.value || null,
        endDate: endDate.value || null,
      }
    });
    
    success.value = true;
    
    // Wait a moment to show success message, then close and trigger parent refresh
    setTimeout(() => {
      emit('success');
      emit('close');
    }, 1500);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to import calendar events';
  } finally {
    importing.value = false;
  }
};
</script>
