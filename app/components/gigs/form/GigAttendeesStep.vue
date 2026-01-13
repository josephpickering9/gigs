<template>
  <div class="card bg-base-200/50 shadow-sm border border-base-content/5">
    <div class="card-body">
      <div class="flex items-center gap-2 mb-6">
        <div class="p-2 bg-secondary/10 rounded-lg">
           <Icon name="mdi:account-multiple" class="w-5 h-5 text-secondary" />
        </div>
        <div>
           <h3 class="card-title text-lg">Attendees</h3>
           <p class="text-sm text-base-content/60">Who attended this gig?</p>
        </div>
      </div>
      
      <div class="bg-base-100 rounded-xl p-6 border border-base-300">
        <label class="label pt-0">
            <span class="label-text font-medium">Add People</span>
        </label>
        <Combobox
            v-model="attendeesModel"
            placeholder="Search or add people..."
            :options="attendeeOptions"
            class="w-full"
        />
        
        <div class="mt-4 flex items-start gap-3 text-sm text-base-content/70 bg-base-200/50 rounded-lg p-4">
          <Icon name="mdi:information-outline" class="w-5 h-5 text-info/70 flex-shrink-0" />
          <div class="space-y-1">
             <p class="font-medium text-base-content">Adding New People</p>
             <span>Type names of people who attended and press Enter to add them to the list temporarily.</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Combobox from '~/components/ui/input/Combobox.vue';
import type { SelectListItem } from '~/types/SelectListItem';

const props = defineProps<{
  attendees: SelectListItem[];
  attendeeOptions: SelectListItem[];
}>();

const emit = defineEmits<{
  (e: 'update:attendees', value: SelectListItem[]): void;
}>();

const attendeesModel = computed({
  get: () => props.attendees,
  set: (val) => emit('update:attendees', val),
});
</script>
