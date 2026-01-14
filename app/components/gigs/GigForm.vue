<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div role="tablist" class="tabs tabs-lifted overflow-x-auto flex-nowrap w-full md:tabs-lg">
      <a 
        role="tab" 
        class="tab font-semibold" 
        :class="{ 'tab-active text-primary': activeTab === 'details' }"
        @click="activeTab = 'details'"
      >
        <Icon name="mdi:calendar-clock" class="w-4 h-4 mr-2" />
        Details
      </a>

      <a 
        role="tab" 
        class="tab font-semibold" 
        :class="{ 'tab-active text-primary': activeTab === 'setlists' }"
        @click="activeTab = 'setlists'"
      >
        <Icon name="mdi:playlist-music" class="w-4 h-4 mr-2" />
        Setlists
        <span v-if="form.acts?.length" class="badge badge-sm badge-ghost ml-2">{{ form.acts.length }}</span>
      </a>
       <a 
        role="tab" 
        class="tab font-semibold" 
        :class="{ 'tab-active text-primary': activeTab === 'attendees' }"
        @click="activeTab = 'attendees'"
      >
        <Icon name="mdi:account-multiple" class="w-4 h-4 mr-2" />
        Attendees
      </a>
      <a 
        role="tab" 
        class="tab font-semibold" 
        :class="{ 'tab-active text-primary': activeTab === 'images' }"
        @click="activeTab = 'images'"
      >
        <Icon name="mdi:image" class="w-4 h-4 mr-2" />
        Images
      </a>
    </div>

    <div class="bg-base-100 border-base-300 rounded-b-box rounded-tr-box min-h-[400px] pb-20 md:pb-0">
        <div v-show="activeTab === 'details'" class="animate-fade-in">
            <GigDetailsStep 
                v-model:form="form"
                v-model:selected-venue="selectedVenue"
                v-model:headliners="headliners"
                v-model:support-acts="supportActs"
                :venue-options="venueOptions"
                :artist-options="artistOptions"
                :errors="errors"
            />
        </div>

        <div v-show="activeTab === 'setlists'" class="animate-fade-in">
            <GigSetlistStep
                v-model:acts="form.acts"
            />
        </div>

        <div v-show="activeTab === 'attendees'" class="animate-fade-in">
            <GigAttendeesStep
                v-model:attendees="attendees"
                :attendee-options="attendeeOptions"
            />
        </div>

        <div v-show="activeTab === 'images'" class="animate-fade-in">
            <GigImagesStep
                v-model:image-url="form.imageUrl"
            />
        </div>
    </div>


    <div class="flex flex-col-reverse md:flex-row justify-between items-center gap-3 pt-6 border-t border-base-content/10 sticky bottom-0 bg-base-100 z-20 pb-4 md:static md:pb-0 md:bg-transparent">
      <div>
        <slot name="left-actions" />
      </div>
      
      <div class="flex gap-3">
        <slot name="actions">
          <button type="button" class="btn btn-ghost" @click="$emit('cancel')">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary gap-2" :disabled="loading">
            <span v-if="loading" class="loading loading-spinner" />
            <Icon v-else name="mdi:content-save" class="w-5 h-5" />
            {{ submitLabel }}
          </button>
        </slot>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { TicketType, type UpsertGigRequest, type GetGigResponse, type GigArtistRequest } from '~~/api';
import { useGigStore } from '~/store/GigStore';
import type { SelectListItem } from '~/types/SelectListItem';
import { isEmpty } from 'lodash-es';
// Steps
import GigDetailsStep from './form/GigDetailsStep.vue';
import GigSetlistStep from './form/GigSetlistStep.vue';
import GigAttendeesStep from './form/GigAttendeesStep.vue';
import GigImagesStep from './form/GigImagesStep.vue';

const props = defineProps<{
  initialData?: GetGigResponse;
  loading?: boolean;
  submitLabel?: string;
}>();

const emit = defineEmits<{
  (e: 'submit', data: UpsertGigRequest): void;
  (e: 'cancel'): void;
}>();

const gigStore = useGigStore();
const venues = computed(() => gigStore.venues);
const artists = computed(() => gigStore.artists);
const attendeesList = computed(() => gigStore.attendees);

const activeTab = ref('details');

const headliners = ref<SelectListItem[]>([]);
const supportActs = ref<SelectListItem[]>([]);
const selectedVenue = ref<SelectListItem[]>([]);
const attendees = ref<SelectListItem[]>([]);
const isInitializing = ref(false);

const form = ref<UpsertGigRequest>({
  venueId: '',
  date: '',
  ticketType: TicketType.STANDING,
  ticketCost: null,
  imageUrl: '', 
  festivalId: null,
  festivalName: null,
  acts: [],
  attendees: [],
});

const errors = ref<Record<string, string>>({});

const venueOptions = computed<SelectListItem[]>(() => 
    venues.value.map(v => ({ text: v.name || 'Unknown', value: v.id || '' }))
  );

const artistOptions = computed<SelectListItem[]>(() => 
    artists.value.map(a => ({ text: a.name || 'Unknown', value: a.id || '' }))
  );

const attendeeOptions = computed<SelectListItem[]>(() => 
    attendeesList.value.map(a => ({ text: a.name || 'Unknown', value: a.id || '' }))
  );

onMounted(async () => {
    const promises = [];
    if (gigStore.artists.length === 0) promises.push(gigStore.fetchArtists());
    if (gigStore.venues.length === 0) promises.push(gigStore.fetchVenues());
    if (gigStore.attendees.length === 0) promises.push(gigStore.fetchAttendees());
    await Promise.all(promises);
});

watch(selectedVenue, (val) => {
    if (val.length > 0) {
        form.value.venueId = String(val[0].value);
    } else {
        form.value.venueId = '';
    }
});

watch(() => props.initialData, async (newData) => {
    if (!newData) return;
    
    isInitializing.value = true;

    form.value = {
        venueId: newData.venueId || '',
        date: newData.date || '',
        ticketType: newData.ticketType || TicketType.STANDING,
        ticketCost: newData.ticketCost,
        imageUrl: newData.imageUrl || '',
        festivalId: newData.festivalId || null,
        festivalName: newData.festivalName || null,
        acts: newData.acts?.map(a => ({
            artistId: a.artistId,
            isHeadliner: a.isHeadliner,
            setlist: a.setlist?.map(s => ({
                title: s.title || '',
                order: s.order || 0,
                isEncore: s.isEncore || false
            })) || [],
        })) || [],
        attendees: newData.attendees?.map(a => a.personName || '') || [],
    };
    
    if (newData.venueId) {
        const v = venues.value.find(v => v.id === newData.venueId);
        if (v) {
            selectedVenue.value = [{ text: v.name || 'Unknown', value: v.id || '' }];
        }
    }

    if (newData.acts?.length) {
        headliners.value = newData.acts.filter(a => a.isHeadliner).map(a => ({ text: a.name || 'Unknown', value: a.artistId || '' }));
        supportActs.value = newData.acts.filter(a => !a.isHeadliner).map(a => ({ text: a.name || 'Unknown', value: a.artistId || '' }));
    }
    
    if (newData.attendees?.length) {
        attendees.value = newData.attendees.map((a, index) => ({ 
            text: a.personName || '', 
            value: a.personId || a.personName || `attendee-${index}` 
        }));
    }
    
    await nextTick();
    isInitializing.value = false;
}, { immediate: true });

watch(venues, (newVenues) => {
    if (form.value.venueId && selectedVenue.value.length === 0) {
        const v = newVenues.find(v => v.id === form.value.venueId);
        if (v) {
            selectedVenue.value = [{ text: v.name || 'Unknown', value: v.id || '' }];
        }
    }
});

watch([headliners, supportActs], () => {
    updateActs();
}, { deep: true });

const updateActs = () => {
    if (isInitializing.value) return;

    const newActs: GigArtistRequest[] = [];
    
    // Add Headliners
    headliners.value.forEach(h => {
        const existing = form.value.acts?.find(a => String(a.artistId) === String(h.value));
        newActs.push({
            artistId: String(h.value),
            isHeadliner: true,
            setlist: existing?.setlist || [],
        });
    });

    // Add Support Acts
    supportActs.value.forEach(s => {
        const existing = form.value.acts?.find(a => String(a.artistId) === String(s.value));
        newActs.push({
            artistId: String(s.value),
            isHeadliner: false,
            setlist: existing?.setlist || [],
        });
    });

    form.value.acts = newActs;
};

const festivals = computed(() => gigStore.festivals);

watch(() => form.value.festivalId, (newId) => {
    if (newId) {
        const festival = festivals.value.find(f => f.id === newId);
        if (festival && festival.venueId) {
            form.value.venueId = festival.venueId;
            
            // Sync selectedVenue for UI consistency
            const v = venues.value.find(v => v.id === festival.venueId);
            if (v) {
                selectedVenue.value = [{ text: v.name || 'Unknown', value: v.id || '' }];
            }
        }
    }
});

const validate = () => {
    errors.value = {};
    let isValid = true;

    if (!form.value.venueId && !form.value.festivalId) {
        errors.value['venueId'] = 'Venue is required';
        activeTab.value = 'details'; // Switch to tab with error
        isValid = false;
    }
    if (!form.value.date) { 
        errors.value['date'] = 'Date is required';
        activeTab.value = 'details';
        isValid = false;
    }
    if (!form.value.ticketType && !form.value.festivalId) {
        errors.value['ticketType'] = 'Ticket Type is required';
        // if we had a tickets tab, switch to it, but it's in details
        if (activeTab.value !== 'details') activeTab.value = 'details';
        isValid = false;
    }

    return isValid;
};

const handleSubmit = () => {
    if (!validate()) return;
    
    const attendeeIdsOrNames = attendees.value.map(a => {
        const val = String(a.value);
        if (val && !val.startsWith('attendee-') && val !== a.text) {
             return val; 
        }
        return a.text;
    }).filter(v => v.trim() !== '');
    
    const submissionData = {
        ...form.value,
        imageUrl: isEmpty(form.value.imageUrl) ? undefined : form.value.imageUrl,
        attendees: attendeeIdsOrNames,
        acts: form.value.acts?.map(act => ({
            ...act,
            // API expects setlist as Array<string> (just song titles), not objects
            setlist: act.setlist?.filter(song => song.title?.trim() !== '').map(s => s.title) || []
        }))
    };
    emit('submit', submissionData as UpsertGigRequest);
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
