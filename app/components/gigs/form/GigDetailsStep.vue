<template>
  <div class="space-y-6">
    <div class="card bg-base-200/50 shadow-sm border border-base-content/5">
      <div class="card-body">
        <h3 class="card-title text-lg mb-4 flex items-center gap-2">
          <div class="p-2 bg-primary/10 rounded-lg">
            <Icon name="mdi:calendar-clock" class="w-5 h-5 text-primary" />
          </div>
          Event Details
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Combobox
            v-model="venueModel"
            label="Venue"
            placeholder="Search or add venue..."
            :options="venueOptions"
            :multiple="false"
            class="w-full"
            :error="errors['venueId']"
          />

          <FestivalSelector 
             v-model="form.festivalId"
             :initial-name="form.festivalName"
             @update:name="form.festivalName = $event"
          />

          <DatePicker
            v-model="form.date"
            label="Date"
            placeholder="Pick a date"
            class="w-full"
            :error="errors['date']"
          />

          <TextInput
            v-model="form.imageUrl"
            label="Image URL"
            placeholder="https://..."
            :error="errors['imageUrl']"
          >
            <template #append v-if="form.imageUrl">
              <div class="dropdown dropdown-end dropdown-hover">
                <label tabindex="0" class="btn btn-ghost btn-xs btn-circle">
                  <Icon name="mdi:eye" class="w-4 h-4" />
                </label>
                <div tabindex="0" class="dropdown-content z-[1] card card-compact w-64 p-2 shadow bg-base-100 rounded-box">
                  <figure class="rounded-lg overflow-hidden relative pt-[56.25%]">
                     <img :src="form.imageUrl" class="absolute top-0 left-0 w-full h-full object-cover" alt="Preview"/>
                  </figure>
                </div>
              </div>
            </template>
          </TextInput>
        </div>
      </div>
    </div>

    <div class="card bg-base-200/50 shadow-sm border border-base-content/5">
      <div class="card-body">
        <h3 class="card-title text-lg mb-4 flex items-center gap-2">
          <div class="p-2 bg-secondary/10 rounded-lg">
            <Icon name="mdi:ticket" class="w-5 h-5 text-secondary" />
          </div>
          Ticket Information
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectMenu
            v-model="form.ticketType"
            label="Ticket Type"
            :options="ticketTypeOptions"
            class="w-full"
            :error="errors['ticketType']"
          />

          <RangeSlider
            v-model="form.ticketCost"
            label="Ticket Cost (£)"
            :min="0"
            :max="100"
            :step="1"
            class="w-full"
            :error="errors['ticketCost']"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { TicketType } from '~~/api';
import SelectMenu from '~/components/ui/input/SelectMenu.vue';
import DatePicker from '~/components/ui/input/DatePicker.vue';
import Combobox from '~/components/ui/input/Combobox.vue';
import TextInput from '~/components/ui/input/TextInput.vue';
import FestivalSelector from '~/components/festivals/FestivalSelector.vue';
import RangeSlider from '~/components/ui/input/RangeSlider.vue';
import type { SelectListItem } from '~/types/SelectListItem';

const props = defineProps<{
  form: any;
  errors: Record<string, string>;
  venueOptions: SelectListItem[];
  selectedVenue: SelectListItem[];
}>();

const emit = defineEmits<{
  (e: 'update:selectedVenue', value: SelectListItem[]): void;
}>();

const venueModel = computed({
  get: () => props.selectedVenue,
  set: (val) => emit('update:selectedVenue', val),
});

const ticketTypeOptions = computed<SelectListItem[]>(() => 
  Object.values(TicketType).map(t => ({ text: t, value: t }))
);
</script>
