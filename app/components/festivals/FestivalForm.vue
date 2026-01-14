<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div role="tablist" class="tabs tabs-lifted overflow-x-auto flex-nowrap w-full md:tabs-lg">
      <a 
        role="tab" 
        class="tab font-semibold" 
        :class="{ 'tab-active text-primary': activeTab === 'details' }"
        @click="activeTab = 'details'"
      >
        <Icon name="mdi:party-popper" class="w-4 h-4 mr-2" />
        Details
      </a>
      <a 
        role="tab" 
        class="tab font-semibold" 
        :class="{ 'tab-active text-primary': activeTab === 'lineup' }"
        @click="activeTab = 'lineup'"
      >
        <Icon name="mdi:music-note-eighth" class="w-4 h-4 mr-2" />
        Lineup
        <span v-if="selectedGigIds.length" class="badge badge-sm badge-ghost ml-2">{{ selectedGigIds.length }}</span>
      </a>
      <a 
        role="tab" 
        class="tab font-semibold" 
        :class="{ 'tab-active text-primary': activeTab === 'attendees' }"
        @click="activeTab = 'attendees'"
      >
        <Icon name="mdi:account-group" class="w-4 h-4 mr-2" />
        Attendees
      </a>
      <a 
        role="tab" 
        class="tab font-semibold" 
        :class="{ 'tab-active text-primary': activeTab === 'images' }"
        @click="activeTab = 'images'"
      >
        <Icon name="mdi:image-album" class="w-4 h-4 mr-2" />
        Images
      </a>
    </div>

    <div class="bg-base-100 border-base-300 rounded-b-box rounded-tr-box min-h-[400px] mb-20 md:mb-0">
        <div v-show="activeTab === 'details'" class="animate-fade-in">
            <FestivalDetailsStep
                v-model:form="form"
                v-model:selected-venue="selectedVenue"
                :venue-options="venueOptions"
                :errors="errors"
            />
        </div>

        <div v-show="activeTab === 'lineup'" class="animate-fade-in">
             <FestivalLineupStep
                v-model:selected-gig-ids="selectedGigIds"
                :initial-gigs="initialData?.gigs || undefined"
                :gig-groups="gigGroups"
                :loading-gigs="loadingGigs"
                @update-orders="updateOrders"
                @remove-gig="removeGig"
             />
        </div>

        <div v-show="activeTab === 'attendees'" class="animate-fade-in">
            <FestivalAttendeesStep
                v-model:selected-attendees="selectedAttendees"
                :attendee-options="attendeeOptions"
            />
        </div>

        <div v-show="activeTab === 'images'" class="animate-fade-in">
            <FestivalImagesStep
                v-model:form="form"
                :errors="errors"
            />
        </div>
    </div>

    <!-- Form Actions -->
    <div class="flex flex-col-reverse md:flex-row justify-between items-center gap-3 pt-6 border-t border-base-content/10 sticky bottom-0 bg-base-100 z-20 pb-4 md:static md:pb-0 md:bg-transparent">
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
import { ref, watch, computed, onMounted, nextTick } from 'vue';
import type { UpsertFestivalRequest, GetFestivalResponse, GetGigResponse, GetAttendeeResponse, GetVenueResponse } from '~~/api';
import { useGigStore } from '~/store/GigStore';
import type { SelectListItem } from '~/types/SelectListItem';
import { groupBy, sortBy } from 'lodash-es';
import { format, parseISO, isValid } from 'date-fns';

// Steps
import FestivalDetailsStep from './form/FestivalDetailsStep.vue';
import FestivalLineupStep from './form/FestivalLineupStep.vue';
import FestivalAttendeesStep from './form/FestivalAttendeesStep.vue';
import FestivalImagesStep from './form/FestivalImagesStep.vue';

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
const activeTab = ref('details');

const form = ref<UpsertFestivalRequest>({
  name: '',
  year: null,
  imageUrl: '',
  posterImageUrl: '',
  venueId: null,
  venueName: null,
  startDate: null,
  endDate: null,
  price: null,
  attendees: [],
  gigs: [],
});

const selectedGigIds = ref<string[]>([]);
const selectedAttendees = ref<SelectListItem[]>([]);
const selectedVenue = ref<SelectListItem[]>([]);
const orderedGigs = ref<GetGigResponse[]>([]);
const loadingGigs = ref(false);
const isInitializing = ref(false);

onMounted(async () => {
    const promises = [];
    if (gigStore.attendees.length === 0) promises.push(gigStore.fetchAttendees());
    if (gigStore.venues.length === 0) promises.push(gigStore.fetchVenues());
    await Promise.all(promises);
});

const attendeeOptions = computed<SelectListItem[]>(() => 
    gigStore.attendees.map((a: GetAttendeeResponse) => ({ text: a.name || 'Unknown', value: a.id || '' }))
);

const venueOptions = computed<SelectListItem[]>(() => 
    gigStore.venues.map((v: GetVenueResponse) => ({ text: v.name || 'Unknown', value: v.id || '' }))
);

const errors = ref<Record<string, string>>({});

watch(() => props.initialData, async (newData) => {
    if (newData) {
        isInitializing.value = true;
        
        form.value = {
            name: newData.name || '',
            year: newData.year || null,
            imageUrl: newData.imageUrl || '',
            posterImageUrl: newData.posterImageUrl || '',
            venueId: newData.venueId || null,
            venueName: newData.venueName || null,
            startDate: newData.startDate || null,
            endDate: newData.endDate || null,
            price: newData.price || null,
            attendees: newData.attendees?.map((a: any) => a.id!).filter(Boolean) || [],
            gigs: [], // Will be populated on submit
        };
        
        if (newData.venueId) {
            const v = gigStore.venues.find((v: GetVenueResponse) => v.id === newData.venueId);
            if (v) {
                selectedVenue.value = [{ text: v.name || 'Unknown', value: v.id || '' }];
            }
        } else if (newData.venueName) {
             selectedVenue.value = [{ text: newData.venueName, value: newData.venueName }];
        } else {
            selectedVenue.value = [];
        }
        
        if (newData.gigs && newData.gigs.length > 0) {
            orderedGigs.value = [...newData.gigs];
        } else {
            orderedGigs.value = [];
        }
        
        const initialIds = newData.gigs?.map((g: GetGigResponse) => g.id!).filter(Boolean) || [];
        selectedGigIds.value = initialIds;

        if (newData.attendees) {
            selectedAttendees.value = newData.attendees.map((a: any) => ({
                text: a.name || 'Unknown',
                value: a.id || ''
            }));
        }
        
        await nextTick();
        isInitializing.value = false;
    }
}, { immediate: true });

watch(selectedGigIds, async (newIds) => {
    if (isInitializing.value) {
        return;
    }
    
    loadingGigs.value = true;
    try {
        orderedGigs.value = orderedGigs.value.filter(g => newIds.includes(g.id!));

        const missingIds = newIds.filter(id => !orderedGigs.value.some((g: GetGigResponse) => g.id === id));
        
        if (missingIds.length > 0) {
            const newGigsPromises = missingIds.map(id => gigStore.fetchGig(id));
            const newGigs = await Promise.all(newGigsPromises);
            
            newGigs.forEach((g: GetGigResponse | undefined) => {
                if (g) orderedGigs.value.push(g);
            });
        }
    } finally {
        loadingGigs.value = false;
    }
});

watch(selectedVenue, (val) => {
    if (val.length > 0 && val[0]) {
        form.value.venueId = String(val[0].value);
        form.value.venueName = val[0].text;
    } else {
        form.value.venueId = null;
        form.value.venueName = null;
    }
});

watch(() => gigStore.venues, (newVenues) => {
    if (form.value.venueId && selectedVenue.value.length === 0) {
        const v = newVenues.find((v: GetVenueResponse) => v.id === form.value.venueId);
        if (v) {
            selectedVenue.value = [{ text: v.name || 'Unknown', value: v.id || '' }];
        }
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

    const grouped = groupBy(orderedGigs.value, (gig) => {
        if (!gig.date) return 'Unknown Date';
        const date = parseISO(gig.date);
        return isValid(date) ? format(date, 'yyyy-MM-dd') : 'Unknown Date';
    });
    
    const groups = Object.entries(grouped).map(([dateKey, gigs]) => {
         let title = 'Unknown Date';
         let dateObj = new Date(8640000000000000);

         if (dateKey !== 'Unknown Date') {
             const date = parseISO(dateKey);
             title = format(date, 'EEEE, d MMMM yyyy');
             dateObj = date;
         }

         return {
            dateKey,
            title,
            dateObj,
            gigs: gigs
         };
    });

    return sortBy(groups, g => g.dateObj.getTime());
});

const updateOrders = (dateKey: string, newGroupGigs: GetGigResponse[]) => {
    const reordered: GetGigResponse[] = [];
    
    const sortedGroups = sortBy(Object.keys(groupBy(orderedGigs.value, (g: GetGigResponse) => {
         if (!g.date) return 'Unknown Date';
         const date = parseISO(g.date);
         return isValid(date) ? format(date, 'yyyy-MM-dd') : 'Unknown Date';
    })), key => key === 'Unknown Date' ? 9999999999999 : parseISO(key).getTime());


    for (const groupKey of sortedGroups) {
        if (groupKey === dateKey) {
            reordered.push(...newGroupGigs);
        } else {
            const groupGigs = orderedGigs.value.filter((g: GetGigResponse) => {
                const gDateKey = (!g.date || !isValid(parseISO(g.date))) ? 'Unknown Date' : format(parseISO(g.date), 'yyyy-MM-dd');
                return gDateKey === groupKey;
            });
            reordered.push(...groupGigs);
        }
    }
    
    orderedGigs.value = reordered;
};

const removeGig = (gigId: string) => {
    selectedGigIds.value = selectedGigIds.value.filter(id => id !== gigId);
};

const validate = () => {
    errors.value = {};
    let isValid = true;

    if (!form.value.name) {
        errors.value['name'] = 'Name is required';
        activeTab.value = 'details';
        isValid = false;
    }

    return isValid;
};

const handleSubmit = () => {
    if (!validate()) return;
    
    form.value.attendees = selectedAttendees.value.map((s: SelectListItem) => String(s.value));
    
    form.value.gigs = orderedGigs.value.map((gig: GetGigResponse, index: number) => ({
        gigId: gig.id,
        order: index + 1
    }));

    emit('submit', form.value);
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
