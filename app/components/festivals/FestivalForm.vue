<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div class="card bg-base-200/50 shadow-sm">
      <div class="card-body">
        <h3 class="card-title text-lg mb-4">
          <Icon name="mdi:party-popper" class="w-5 h-5" />
          Festival Details
        </h3>
        
        <div class="space-y-4">
          <TextInput
            v-model="form.name"
            label="Name"
            placeholder="e.g. Glastonbury"
            :error="errors['name']"
          />

          <TextInput
            v-model="imageUrlProxy"
            label="Image URL"
            placeholder="https://..."
            :error="errors['imageUrl']"
          />

          <TextInput
            v-model="yearProxy"
            label="Year"
            placeholder="e.g. 2023"
            type="number"
            :error="errors['year']"
          />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePicker
                v-model="startDateProxy"
                label="Start Date"
                :error="errors['startDate']"
            />
            <DatePicker
                v-model="endDateProxy"
                label="End Date"
                :error="errors['endDate']"
            />
          </div>

          <RangeSlider
            v-model="form.price"
            label="Price (£)"
            :min="0"
            :max="1000"
            :step="0.01"
            :error="errors['price']"
          />

          <Combobox
             v-model="selectedAttendees"
             :options="attendeeOptions"
             label="Attendees"
             placeholder="Select attendees..."
             :multiple="true"
          />

          <GigSelector
            v-model="selectedGigIds"
            :initial-gigs="initialData?.gigs || undefined"
          />
        </div>
      </div>
    </div>

    <!-- Form Actions -->
    <div class="flex justify-between items-center gap-3 pt-4">
      <div>
        <slot name="left-actions" />
      </div>
      
      <div class="flex gap-3">
        <button type="button" class="btn btn-ghost" @click="$emit('cancel')">
            Cancel
        </button>
        <button type="submit" class="btn btn-primary gap-2" :disabled="loading">
            <span v-if="loading" class="loading loading-spinner" />
            <Icon v-else name="mdi:content-save" class="w-5 h-5" />
            {{ submitLabel }}
        </button>
      </div>
    </div>
  </form>
</template>



<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import type { UpsertFestivalRequest, GetFestivalResponse } from '~~/api';
import TextInput from '~/components/ui/input/TextInput.vue';
import DatePicker from '~/components/ui/input/DatePicker.vue';
import Combobox from '~/components/ui/input/Combobox.vue';
import GigSelector from '~/components/gigs/GigSelector.vue';
import RangeSlider from '~/components/ui/input/RangeSlider.vue';
import { useGigStore } from '~/store/GigStore';
import type { SelectListItem } from '~/types/SelectListItem';

const props = defineProps<{
  initialData?: GetFestivalResponse;
  loading?: boolean;
  submitLabel?: string;
}>();

const emit = defineEmits<{
  (e: 'submit', data: UpsertFestivalRequest, gigIds: string[]): void;
  (e: 'cancel'): void;
}>();

const gigStore = useGigStore();

const form = ref<UpsertFestivalRequest>({
  name: '',
  year: null,
  imageUrl: '',
  startDate: null,
  endDate: null,
  price: null,
  attendees: [],
});

const selectedGigIds = ref<string[]>([]);
const selectedAttendees = ref<SelectListItem[]>([]);

onMounted(async () => {
    if (gigStore.attendees.length === 0) {
        await gigStore.fetchAttendees();
    }
});

const attendeeOptions = computed<SelectListItem[]>(() => 
    gigStore.attendees.map((a: { name?: string; id?: string }) => ({ text: a.name || 'Unknown', value: a.id || '' }))
);

const imageUrlProxy = computed({
    get: () => form.value.imageUrl || '',
    set: (val: string) => form.value.imageUrl = val
});

const yearProxy = computed({
    get: () => form.value.year?.toString() || '',
    set: (val: string) => form.value.year = val ? parseInt(val) : null
});

const startDateProxy = computed({
    get: () => form.value.startDate || undefined,
    set: (val: string | undefined) => form.value.startDate = val || null
});

const endDateProxy = computed({
    get: () => form.value.endDate || undefined,
    set: (val: string | undefined) => form.value.endDate = val || null
});



const errors = ref<Record<string, string>>({});

watch(() => props.initialData, (newData) => {
    if (newData) {
        form.value = {
            name: newData.name || '',
            year: newData.year || null,
            imageUrl: newData.imageUrl || '',
            startDate: newData.startDate || null,
            endDate: newData.endDate || null,
            price: newData.price || null,
            attendees: newData.attendees?.map((a: { id?: string }) => a.id!).filter(Boolean) || [],
        };
        selectedGigIds.value = newData.gigs?.map((g: { id?: string }) => g.id!).filter(Boolean) || [];
        
        // Map existing attendees to SelectItems
        if (newData.attendees) {
            selectedAttendees.value = newData.attendees.map((a: { name?: string; id?: string }) => ({
                text: a.name || 'Unknown',
                value: a.id || ''
            }));
        }
    }
}, { immediate: true });

const validate = () => {
    errors.value = {};
    let isValid = true;

    if (!form.value.name) {
        errors.value['name'] = 'Name is required';
        isValid = false;
    }

    return isValid;
};

const handleSubmit = () => {
    if (!validate()) return;
    
    // Update attendees from selected items
    form.value.attendees = selectedAttendees.value.map(s => String(s.value));
    
    emit('submit', form.value, selectedGigIds.value);
};
</script>
