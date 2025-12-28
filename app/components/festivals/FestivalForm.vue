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
            :hide-selected-gigs="true"
          />
        </div>
      </div>
    </div>

    <div v-if="selectedGigIds.length > 0" class="card bg-base-200/50 shadow-sm mt-6">
      <div class="card-body">
        <div v-if="loadingGigs" class="flex justify-center py-4">
            <span class="loading loading-spinner text-primary" />
        </div>

        <div v-else class="space-y-6">
            <div v-for="group in gigGroups" :key="group.dateKey" class="bg-base-100 rounded-lg p-4 shadow-sm">
                <h4 class="font-bold text-md mb-3 flex items-center gap-2">
                    <Icon name="mdi:calendar" class="w-4 h-4 text-secondary" />
                    {{ group.title }}
                </h4>
                
                <Draggable 
                    v-model="group.gigs" 
                    item-key="id"
                    handle=".drag-handle"
                    class="space-y-2"
                    @end="updateOrders(group.dateKey, group.gigs)"
                >
                    <template #item="{ element }">
                        <div class="flex items-center gap-3 bg-base-200 p-3 rounded-md hover:bg-base-200/80 transition-colors">
                            <button type="button" class="drag-handle btn btn-circle btn-ghost btn-sm cursor-grab active:cursor-grabbing">
                                <Icon name="mdi:drag" class="w-5 h-5" />
                            </button>
                            
                            <div class="flex-1">
                                <div class="font-bold">
                                    {{ getHeadlinerName(element) }}
                                </div>
                                <div class="text-xs text-base-content/60 flex gap-2">
                                    <span v-if="element.venueName">
                                        <Icon name="mdi:map-marker" class="w-3 h-3 inline" />
                                        {{ element.venueName }}
                                    </span>
                                    <span v-if="getSupportActs(element)">
                                        <Icon name="mdi:account-group" class="w-3 h-3 inline" />
                                        {{ getSupportActs(element) }}
                                    </span>
                                </div>
                            </div>
                            
                            <button type="button" class="btn btn-ghost btn-xs text-error" @click="removeGig(element.id)">
                                <Icon name="heroicons:trash" class="w-4 h-4" />
                            </button>
                        </div>
                    </template>
                </Draggable>
            </div>
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
import type { UpsertFestivalRequest, GetFestivalResponse, GetGigResponse } from '~~/api';
import TextInput from '~/components/ui/input/TextInput.vue';
import DatePicker from '~/components/ui/input/DatePicker.vue';
import Combobox from '~/components/ui/input/Combobox.vue';
import GigSelector from '~/components/gigs/GigSelector.vue';
import RangeSlider from '~/components/ui/input/RangeSlider.vue';
import { useGigStore } from '~/store/GigStore';
import type { SelectListItem } from '~/types/SelectListItem';
import { groupBy, sortBy } from 'lodash-es';
import { format, parseISO, isValid } from 'date-fns';

const props = defineProps<{
  initialData?: GetFestivalResponse;
  loading?: boolean;
  submitLabel?: string;
}>();

const emit = defineEmits<{
  (e: 'submit', data: UpsertFestivalRequest): void;
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
  gigs: [],
});

const selectedGigIds = ref<string[]>([]);
const selectedAttendees = ref<SelectListItem[]>([]);
const orderedGigs = ref<GetGigResponse[]>([]);
const loadingGigs = ref(false);

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

watch(() => props.initialData, async (newData) => {
    if (newData) {
        form.value = {
            name: newData.name || '',
            year: newData.year || null,
            imageUrl: newData.imageUrl || '',
            startDate: newData.startDate || null,
            endDate: newData.endDate || null,
            price: newData.price || null,
            attendees: newData.attendees?.map((a: { id?: string }) => a.id!).filter(Boolean) || [],
            gigs: [], // Will be populated on submit
        };
        
        // Initial selected IDs
        const initialIds = newData.gigs?.map((g: { id?: string }) => g.id!).filter(Boolean) || [];
        selectedGigIds.value = initialIds;
        
        // Populate orderedGigs from initial data if available, ensuring we have the full objects
        if (newData.gigs && newData.gigs.length > 0) {
             // We use the gigs directly from the response as they should have the correct initial order if sorted by backend
             // But we might need to fetch full details if not all fields are present, though GetGigResponse usually has enough.
             // For now, assume newData.gigs is sufficient.
            orderedGigs.value = [...newData.gigs];
        }

        // Map existing attendees to SelectItems
        if (newData.attendees) {
            selectedAttendees.value = newData.attendees.map((a: { name?: string; id?: string }) => ({
                text: a.name || 'Unknown',
                value: a.id || ''
            }));
        }
    }
}, { immediate: true });

// Watch for changes in selectedGigIds to update orderedGigs
watch(selectedGigIds, async (newIds) => {
    loadingGigs.value = true;
    try {
        // 1. Remove gigs that are no longer selected
        orderedGigs.value = orderedGigs.value.filter(g => newIds.includes(g.id!));

        // 2. Add new gigs that are selected but not in orderedGigs
        const missingIds = newIds.filter(id => !orderedGigs.value.some(g => g.id === id));
        
        if (missingIds.length > 0) {
            // Fetch missing gigs
            const newGigsPromises = missingIds.map(id => gigStore.fetchGig(id));
            const newGigs = await Promise.all(newGigsPromises);
            
            // Add valid new gigs
            newGigs.forEach(g => {
                if (g) orderedGigs.value.push(g);
            });
        }
    } finally {
        loadingGigs.value = false;
    }
});

interface GigGroup {
    dateKey: string;
    title: string;
    dateObj: Date;
    gigs: GetGigResponse[];
}

const gigGroups = computed<GigGroup[]>(() => {
    if (orderedGigs.value.length === 0) return [];

    // Group by date
    const grouped = groupBy(orderedGigs.value, (gig) => {
        if (!gig.date) return 'Unknown Date';
        const date = parseISO(gig.date);
        return isValid(date) ? format(date, 'yyyy-MM-dd') : 'Unknown Date';
    });
    
    // Convert to array and sort groups by date
    const groups = Object.entries(grouped).map(([dateKey, gigs]) => {
         let title = 'Unknown Date';
         let dateObj = new Date(8640000000000000); // Far future

         if (dateKey !== 'Unknown Date') {
             const date = parseISO(dateKey);
             title = format(date, 'EEEE, d MMMM yyyy');
             dateObj = date;
         }

         // Within each group, sort by existing order if present, or fallback logic
         // We trust the current order of the array 'gigs' as reliable since we maintain it in `orderedGigs`
         // However, `groupBy` might not preserve order depending on implementation, so we should rely on `orderedGigs` order.
         // Actually, lodash groupBy preserves order of values.
         // But we need to make sure the user can reorder within this group.
         // Since `vuedraggable` needs a writable request (v-model), we need to reflect changes back to `orderedGigs`.
         
         return {
            dateKey,
            title,
            dateObj,
            gigs: gigs // This is a reference, modifying it might not directly reactively update `orderedGigs` purely securely without handling @end
         };
    });

    return sortBy(groups, g => g.dateObj.getTime());
});

const updateOrders = (dateKey: string, newGroupGigs: GetGigResponse[]) => {
    // When drag ends, we have a new order for this group.
    // We need to reconstruct `orderedGigs` to reflect this new order while keeping other groups intact.
    
    // 1. Filter out the gigs that belong to this group from the main list
    // (Logic simplified to just rebuilding the list from sorted groups)

    const reordered: GetGigResponse[] = [];
    
    // We need to know the order of groups to reconstruct the flat list properly sorted by date
    const sortedGroups = sortBy(Object.keys(groupBy(orderedGigs.value, (g) => {
         if (!g.date) return 'Unknown Date';
         const date = parseISO(g.date);
         return isValid(date) ? format(date, 'yyyy-MM-dd') : 'Unknown Date';
    })), key => key === 'Unknown Date' ? 9999999999999 : parseISO(key).getTime());


    for (const groupKey of sortedGroups) {
        if (groupKey === dateKey) {
            reordered.push(...newGroupGigs);
        } else {
            // Find the original gigs for this group
            const groupGigs = orderedGigs.value.filter(g => {
                const gDateKey = (!g.date || !isValid(parseISO(g.date))) ? 'Unknown Date' : format(parseISO(g.date), 'yyyy-MM-dd');
                return gDateKey === groupKey;
            });
            reordered.push(...groupGigs);
        }
    }
    
    orderedGigs.value = reordered;
};


const getHeadlinerName = (gig: GetGigResponse) => {
    return gig.acts?.find(a => a.isHeadliner)?.name || 'Unknown Artist';
};

const getSupportActs = (gig: GetGigResponse) => {
    return gig.acts?.filter(a => !a.isHeadliner).map(a => a.name).join(', ');
};

const removeGig = (gigId: string) => {
    selectedGigIds.value = selectedGigIds.value.filter(id => id !== gigId);
};

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
    
    // Construct gigs payload with Order
    // We use `orderedGigs` to determine the order.
    // Since `orderedGigs` is a flat list, we need to assign order per day or global?
    // The requirement is "drag to update the order". Usually means order within the day.
    // The API `FestivalGigOrderRequest` has `gigId` and `order`.
    // Let's assign an increasing integer to `order` based on the flat list position, 
    // OR position within the day. 
    // `FestivalGigOrderRequest` is per festival.
    // If we want to maintain order across the whole festival or per day?
    // Usually `order` is a simple sort key.
    // If we give unique increasing numbers across ALL gigs (sorted by date first, then drag order), it maintains the correct absolute order.
    
    form.value.gigs = orderedGigs.value.map((gig, index) => ({
        gigId: gig.id,
        order: index + 1 // Global order
    }));

    emit('submit', form.value);
};
</script>
