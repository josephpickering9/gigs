<template>
  <div class="card bg-base-200/50 shadow-sm border border-base-content/5">
    <div class="card-body p-4 sm:p-6 md:p-8">
      <h3 class="card-title text-lg mb-4 flex items-center gap-2">
        <div class="p-2 bg-primary/10 rounded-lg">
           <Icon name="mdi:party-popper" class="w-5 h-5 text-primary" />
        </div>
        Festival Details
      </h3>
      
      <div class="space-y-4">
        <TextInput
          v-model="nameProxy"
          label="Name"
          placeholder="e.g. Glastonbury"
          :error="errors['name']"
        />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
            v-model="yearProxy"
            label="Year"
            placeholder="e.g. 2023"
            type="number"
            :error="errors['year']"
            />
        </div>

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

        <Combobox
           v-model="selectedVenueProxy"
           :options="venueOptions"
           label="Venue"
           placeholder="Select venue..."
           :multiple="false"
           :error="errors['venueId']"
           class="w-full"
        />

        <RangeSlider
          v-model="priceProxy"
          label="Price (£)"
          :min="0"
          :max="1000"
          :step="0.01"
          class="w-full"
          :error="errors['price']"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { UpsertFestivalRequest } from '~~/api';
import type { SelectListItem } from '~/types/SelectListItem';
import TextInput from '~/components/ui/input/TextInput.vue';
import DatePicker from '~/components/ui/input/DatePicker.vue';
import Combobox from '~/components/ui/input/Combobox.vue';
import RangeSlider from '~/components/ui/input/RangeSlider.vue';

const props = defineProps<{
  form: UpsertFestivalRequest;
  venueOptions: SelectListItem[];
  selectedVenue: SelectListItem[];
  errors: Record<string, string>;
}>();

const emit = defineEmits<{
  (e: 'update:form', value: UpsertFestivalRequest): void;
  (e: 'update:selectedVenue', value: SelectListItem[]): void;
}>();

const nameProxy = computed({
  get: () => props.form.name,
  set: (val) => emit('update:form', { ...props.form, name: val }),
});

const yearProxy = computed({
    get: () => props.form.year?.toString() || '',
    set: (val: string) => emit('update:form', { ...props.form, year: val ? parseInt(val) : null })
});

const startDateProxy = computed({
    get: () => props.form.startDate || undefined,
    set: (val: string | undefined) => emit('update:form', { ...props.form, startDate: val || null })
});

const endDateProxy = computed({
    get: () => props.form.endDate || undefined,
    set: (val: string | undefined) => emit('update:form', { ...props.form, endDate: val || null })
});

const priceProxy = computed({
    get: () => props.form.price,
    set: (val: number | null) => emit('update:form', { ...props.form, price: val })
});

const selectedVenueProxy = computed({
    get: () => props.selectedVenue,
    set: (val: SelectListItem[]) => emit('update:selectedVenue', val)
});
</script>
