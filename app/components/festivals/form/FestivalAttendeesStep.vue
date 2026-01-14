<template>
  <div class="card bg-base-200/50 shadow-sm border border-base-content/5">
    <div class="card-body p-4 sm:p-6 md:p-8">
      <h3 class="card-title text-lg mb-4 flex items-center gap-2">
        <div class="p-2 bg-secondary/10 rounded-lg">
           <Icon name="mdi:account-group" class="w-5 h-5 text-secondary" />
        </div>
        Attendees
      </h3>
      
      <p class="text-sm text-base-content/60 mb-6">Select who attended this festival.</p>

      <Combobox
          v-model="selectedAttendeesProxy"
          :options="attendeeOptions"
          label="Select Attendees"
          placeholder="Search attendees..."
          :multiple="true"
          class="w-full"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SelectListItem } from '~/types/SelectListItem';
import Combobox from '~/components/ui/input/Combobox.vue';

const props = defineProps<{
  selectedAttendees: SelectListItem[];
  attendeeOptions: SelectListItem[];
}>();

const emit = defineEmits<{
  (e: 'update:selectedAttendees', value: SelectListItem[]): void;
}>();

const selectedAttendeesProxy = computed({
    get: () => props.selectedAttendees,
    set: (val) => emit('update:selectedAttendees', val)
});
</script>
