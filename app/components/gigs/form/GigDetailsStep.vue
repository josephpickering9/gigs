<template>
  <div class="space-y-6">
    <div class="card bg-base-200/50 shadow-sm border border-base-content/5">
      <div class="card-body">
        <div class="flex items-center justify-between mb-4">
            <h3 class="card-title text-lg flex items-center gap-2">
            <div class="p-2 bg-primary/10 rounded-lg">
                <Icon name="mdi:calendar-clock" class="w-5 h-5 text-primary" />
            </div>
            Event Details
            </h3>

            <div class="join">
                <button 
                    type="button"
                    class="join-item btn btn-sm" 
                    :class="{ 'btn-primary': gigType === 'regular' }"
                    @click="gigType = 'regular'"
                >
                    Gig
                </button>
                <button 
                    type="button"
                    class="join-item btn btn-sm" 
                    :class="{ 'btn-secondary': gigType === 'festival' }"
                    @click="gigType = 'festival'"
                >
                    Festival Gig
                </button>
            </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <template v-if="gigType === 'festival'">
              <FestivalSelector 
                v-model="festivalId"
                class="col-span-2 md:col-span-1"
                :initial-name="form.festivalName"
                @update:name="festivalName = $event"
              />

              <SelectMenu
                v-if="festivalDateOptions.length > 0"
                v-model="date"
                label="Festival Day"
                :options="festivalDateOptions"
                class="w-full"
                :error="errors['date']"
              />
              
              <div v-else-if="form.festivalId && festivalDateOptions.length === 0" class="col-span-1">
                 <div class="alert alert-warning text-xs py-2 mb-2">
                    <Icon name="mdi:alert" class="w-4 h-4" />
                    No dates found for this festival. Please select manually.
                 </div>
                 <DatePicker
                    v-model="date"
                    label="Date"
                    placeholder="Pick a date"
                    class="w-full"
                    :error="errors['date']"
                  />
              </div>

               <div v-else class="alert alert-info text-sm flex items-center col-span-1">
                  <Icon name="mdi:information" class="w-5 h-5 mr-2" />
                  Select a festival to see dates
              </div>
          </template>

          <template v-else>
              <Combobox
                v-model="venueModel"
                label="Venue"
                placeholder="Search or add venue..."
                :options="venueOptions"
                :multiple="false"
                class="w-full"
                :error="errors['venueId']"
              />

              <DatePicker
                v-model="date"
                label="Date"
                placeholder="Pick a date"
                class="w-full"
                :error="errors['date']"
              />
          </template>

          <TextInput
            v-model="imageUrl"
            label="Image URL"
            type="url"
            placeholder="https://..."
            :error="errors['imageUrl']"
            class="col-span-2"
          >
            <template v-if="form.imageUrl" #append>
              <div class="dropdown dropdown-end dropdown-hover">
                <label tabindex="0" class="btn btn-ghost btn-xs btn-circle">
                  <Icon name="mdi:eye" class="w-4 h-4" />
                </label>
                <div tabindex="0" class="dropdown-content z-[1] card card-compact w-64 p-2 shadow bg-base-100 rounded-box">
                  <figure class="rounded-lg overflow-hidden relative pt-[56.25%]">
                     <img :src="form.imageUrl" class="absolute top-0 left-0 w-full h-full object-cover" alt="Preview">
                  </figure>
                </div>
              </div>
            </template>
          </TextInput>
        </div>
      </div>
    </div>

    <div v-if="gigType === 'regular'" class="card bg-base-200/50 shadow-sm border border-base-content/5">
      <div class="card-body">
        <h3 class="card-title text-lg mb-4 flex items-center gap-2">
          <div class="p-2 bg-secondary/10 rounded-lg">
            <Icon name="mdi:ticket" class="w-5 h-5 text-secondary" />
          </div>
          Ticket Information
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectMenu
            v-model="ticketType"
            label="Ticket Type"
            :options="ticketTypeOptions"
            class="w-full"
            :error="errors['ticketType']"
          />

          <RangeSlider
            v-model="ticketCost"
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
import { computed, ref, onMounted, watch } from 'vue';
import { TicketType } from '~~/api';
import { useGigStore } from '~/store/GigStore';
import { eachDayOfInterval, parseISO, format, isValid } from 'date-fns';
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
  isFestival?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:selectedVenue', value: SelectListItem[]): void;
  (e: 'update:form', value: any): void;
}>();

const gigStore = useGigStore();
const gigType = ref<'regular' | 'festival'>('regular');

const venueModel = computed({
  get: () => props.selectedVenue,
  set: (val) => emit('update:selectedVenue', val),
});

// Computed properties for form fields to prevent direct mutation
const festivalId = computed({
  get: () => props.form.festivalId,
  set: (val) => emit('update:form', { ...props.form, festivalId: val }),
});

const festivalName = computed({
  get: () => props.form.festivalName,
  set: (val) => emit('update:form', { ...props.form, festivalName: val }),
});

const date = computed({
  get: () => props.form.date,
  set: (val) => emit('update:form', { ...props.form, date: val }),
});

const imageUrl = computed({
  get: () => props.form.imageUrl,
  set: (val) => emit('update:form', { ...props.form, imageUrl: val }),
});

const ticketType = computed({
  get: () => props.form.ticketType,
  set: (val) => emit('update:form', { ...props.form, ticketType: val }),
});

const ticketCost = computed({
  get: () => props.form.ticketCost,
  set: (val) => emit('update:form', { ...props.form, ticketCost: val }),
});

const ticketTypeOptions = computed<SelectListItem[]>(() => 
  Object.values(TicketType).map(t => ({ text: t, value: t }))
);

const selectedFestival = computed(() => {
    if (!props.form.festivalId) return null;
    return gigStore.festivals.find(f => f.id === props.form.festivalId);
});

const festivalDateOptions = computed<SelectListItem[]>(() => {
    const festival = selectedFestival.value;
    if (!festival || !festival.startDate || !festival.endDate) return [];

    try {
        const start = parseISO(festival.startDate);
        const end = parseISO(festival.endDate);
        
        if (!isValid(start) || !isValid(end)) return [];

        const days = eachDayOfInterval({ start, end });
        return days.map(date => ({
            text: format(date, 'EEEE (dd/MM/yyyy)'),
            value: format(date, "yyyy-MM-dd'T'HH:mm:ss")
        }));
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Error generating festival dates", e);
        return [];
    }
});

onMounted(() => {
    if (props.form.festivalId) {
        gigType.value = 'festival';
    }
});

watch(gigType, (newType) => {
    if (newType === 'regular') {
        festivalId.value = null;
        festivalName.value = null;
    }
});
</script>
