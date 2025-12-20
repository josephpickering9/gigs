<template>
  <form class="space-y-8" @submit.prevent="handleSubmit">
    <!-- Artists Section -->
    <div class="card bg-base-200/50 shadow-sm">
      <div class="card-body">
        <div class="flex items-center gap-2 mb-6">
          <div class="badge badge-primary badge-lg gap-2">
            <Icon name="mdi:account-music" class="w-4 h-4" />
            Artists
          </div>
          <div class="text-sm text-base-content/60">
            Select the performers for this gig
          </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Headliners -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 mb-3">
              <div class="badge badge-accent gap-1">
                <Icon name="mdi:star" class="w-3 h-3" />
                Headliners
              </div>
              <span class="text-xs text-base-content/50">Main acts</span>
            </div>
            <Combobox
              v-model="headliners"
              :options="artistOptions"
              placeholder="Search or add headliners..."
              class="w-full"
              :error="errors['artistIds']"
            />
          </div>

          <!-- Support Acts -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 mb-3">
              <div class="badge badge-ghost gap-1">
                <Icon name="mdi:account-group" class="w-3 h-3" />
                Support Acts
              </div>
              <span class="text-xs text-base-content/50">Optional</span>
            </div>
            <Combobox
              v-model="supportActs"
              :options="artistOptions"
              placeholder="Search or add support..."
              class="w-full"
            />
          </div>
        </div>
        
        <div class="mt-4 flex items-start gap-2 text-sm text-base-content/70 bg-base-300/30 rounded-lg p-3">
          <Icon name="mdi:lightbulb-outline" class="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>You can select multiple artists. New artists can be typed in but may need to be saved separately.</span>
        </div>
      </div>
    </div>

    <!-- Event Details Section -->
    <div class="card bg-base-200/50 shadow-sm">
      <div class="card-body">
        <h3 class="card-title text-lg mb-4">
          <Icon name="mdi:calendar-clock" class="w-5 h-5" />
          Event Details
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Combobox
            v-model="selectedVenue"
            label="Venue"
            placeholder="Search or add venue..."
            :options="venueOptions"
            :multiple="false"
            class="w-full"
            :error="errors['venueId']"
          />

          <DatePicker
            v-model="datePart"
            label="Date"
            placeholder="Pick a date"
            class="w-full"
            :error="errors['date']"
          />
        </div>
      </div>
    </div>

    <!-- Ticket Information Section -->
    <div class="card bg-base-200/50 shadow-sm">
      <div class="card-body">
        <h3 class="card-title text-lg mb-4">
          <Icon name="mdi:ticket" class="w-5 h-5" />
          Ticket Information
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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


    <!-- Setlists Section -->
    <div v-if="form.acts && form.acts.length > 0" class="card bg-base-200/50 shadow-sm">
      <div class="card-body">
        <h3 class="card-title text-lg mb-4">
          <Icon name="mdi:playlist-music" class="w-5 h-5" />
          Setlists
        </h3>
        
        <div class="space-y-6">
          <div v-for="(act, index) in form.acts" :key="index" class="collapse collapse-arrow bg-base-100 border border-base-300">
            <input type="checkbox" :name="'setlist-accordion-' + index" /> 
            <div class="collapse-title text-base font-medium flex items-center gap-2">
              <span class="badge" :class="act.isHeadliner ? 'badge-accent' : 'badge-ghost'">
                {{ act.isHeadliner ? 'Headliner' : 'Support' }}
              </span>
              {{ getArtistName(act.artistId) }}
            </div>
            <div class="collapse-content">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Setlist</span>
                  <span class="label-text-alt text-base-content/60">
                    {{ (act.setlist?.length || 0) }} song{{ (act.setlist?.length || 0) !== 1 ? 's' : '' }}
                  </span>
                </label>
                
                <draggable 
                    v-model="act.setlist" 
                    item-key="id"
                    handle=".drag-handle"
                    class="space-y-2 mb-4"
                    :animation="200"
                    ghost-class="opacity-50"
                >
                    <template #item="{ index: songIndex }">
                         <div class="flex items-center gap-2 group">
                            <button type="button" class="drag-handle btn btn-ghost btn-xs btn-square cursor-grab active:cursor-grabbing text-base-content/40 hover:text-base-content">
                                <Icon name="mdi:drag" class="w-5 h-5" />
                            </button>
                            <div class="relative flex-1">
                                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-base-content/30 w-4 text-right">
                                    {{ songIndex + 1 }}
                                </span>
                                <input 
                                    v-model="act.setlist[songIndex]" 
                                    type="text" 
                                    class="input input-bordered input-sm w-full pl-9" 
                                    placeholder="Enter song name..." 
                                    @keydown.enter.prevent="addSong(index, songIndex + 1)"
                                />
                            </div>
                            <button 
                                type="button" 
                                class="btn btn-ghost btn-xs btn-square text-error/60 hover:text-error hover:bg-error/10"
                                @click="removeSong(index, songIndex)"
                            >
                                <Icon name="heroicons:trash" class="w-4 h-4" />
                            </button>
                        </div>
                    </template>
                </draggable>

                 <button 
                    type="button" 
                    class="btn btn-sm btn-ghost gap-2 border-dashed border-base-content/20 hover:border-base-content/40 hover:bg-base-200 w-full"
                    @click="addSong(index)"
                >
                    <Icon name="heroicons:plus" class="w-4 h-4" />
                    Add Song
                </button>

              </div>
            </div>
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
import { ref, computed, watch, onMounted } from 'vue';
import { TicketType, type UpsertGigRequest, type GetGigResponse, type GigArtistRequest } from '~~/api';
import { useGigStore } from '~/store/GigStore';
import SelectMenu from '~/components/ui/input/SelectMenu.vue';
import DatePicker from '~/components/ui/input/DatePicker.vue';
import Combobox from '~/components/ui/input/Combobox.vue';
import RangeSlider from '~/components/ui/input/RangeSlider.vue';
import type { SelectListItem } from '~/types/SelectListItem';
import draggable from 'vuedraggable';

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

const datePart = ref('');
const imageUrlProxy = ref(''); 

const headliners = ref<SelectListItem[]>([]);
const supportActs = ref<SelectListItem[]>([]);
const selectedVenue = ref<SelectListItem[]>([]);

type FormAct = Omit<GigArtistRequest, 'setlist'> & { setlist: string[] };
type FormState = Omit<UpsertGigRequest, 'acts'> & { acts: FormAct[] };

const form = ref<FormState>({
  venueId: '',
  date: '',
  ticketType: TicketType.STANDING, // Default
  ticketCost: null,
  imageUrl: '', 
  acts: [],
});

const errors = ref<Record<string, string>>({});

// Options
const venueOptions = computed<SelectListItem[]>(() => 
    venues.value.map(v => ({ text: v.name || 'Unknown', value: v.id || '' }))
  );

  const ticketTypeOptions = computed<SelectListItem[]>(() => 
    Object.values(TicketType).map(t => ({ text: t, value: t }))
  );

const artistOptions = computed<SelectListItem[]>(() => 
    artists.value.map(a => ({ text: a.name || 'Unknown', value: a.id || '' }))
  );

const getArtistName = (id?: string) => {
    return artists.value.find(a => a.id === id)?.name || 'Unknown Artist';
};

watch(imageUrlProxy, (val) => {
    if (val !== form.value.imageUrl) {
        form.value.imageUrl = val;
    }
});

watch(() => form.value.imageUrl, (val) => {
     if (val !== imageUrlProxy.value) {
        imageUrlProxy.value = val || '';
    }
});

onMounted(async () => {
    const promises = [];
    if (gigStore.artists.length === 0) promises.push(gigStore.fetchArtists());
    if (gigStore.venues.length === 0) promises.push(gigStore.fetchVenues());
    await Promise.all(promises);
});

watch(selectedVenue, (val) => {
    if (val.length > 0) {
        form.value.venueId = String(val[0].value);
    } else {
        form.value.venueId = '';
    }
});

watch(() => props.initialData, (newData) => {
    if (!newData) return;

    form.value = {
        venueId: newData.venueId || '',
        date: newData.date || '',
        ticketType: newData.ticketType || TicketType.STANDING,
        ticketCost: newData.ticketCost,
        imageUrl: newData.imageUrl || '',
        acts: newData.acts?.map(a => ({
            artistId: a.artistId,
            isHeadliner: a.isHeadliner,
            setlist: a.setlist || [],
        })) || [],
    };
    
    // Set the date picker value
    datePart.value = newData.date || '';
    
    // Set the image URL proxy
    imageUrlProxy.value = newData.imageUrl || '';
    
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
}, { immediate: true });

watch(venues, (newVenues) => {
    if (form.value.venueId && selectedVenue.value.length === 0) {
        const v = newVenues.find(v => v.id === form.value.venueId);
        if (v) {
            selectedVenue.value = [{ text: v.name || 'Unknown', value: v.id || '' }];
        }
    }
});

watch(datePart, (val) => {
    if (val) {
        form.value.date = val;
    }
});

watch(headliners, () => {
    updateActs();
});

watch(supportActs, () => {
    updateActs();
});

const updateActs = () => {
    const newActs: FormAct[] = [];
    
    // Add Headliners
    headliners.value.forEach(h => {
        const existing = form.value.acts?.find(a => a.artistId === h.value);
        newActs.push({
            artistId: String(h.value),
            isHeadliner: true,
            setlist: existing?.setlist || [],
        });
    });

    // Add Support Acts
    supportActs.value.forEach(s => {
        const existing = form.value.acts?.find(a => a.artistId === s.value);
        newActs.push({
            artistId: String(s.value),
            isHeadliner: false,
            setlist: existing?.setlist || [],
        });
    });

    form.value.acts = newActs;
};

const addSong = (actIndex: number, afterIndex?: number) => {
    if (!form.value.acts?.[actIndex]) return;
    
    // Initialize setlist if needed
    if (!form.value.acts[actIndex].setlist) {
        form.value.acts[actIndex].setlist = [];
    }
    
    // Add empty song string
    if (typeof afterIndex === 'number') {
         form.value.acts[actIndex].setlist!.splice(afterIndex, 0, '');
    } else {
         form.value.acts[actIndex].setlist!.push('');
    }
};

const removeSong = (actIndex: number, songIndex: number) => {
     if (!form.value.acts?.[actIndex]?.setlist) return;
     form.value.acts[actIndex].setlist!.splice(songIndex, 1);
};


const validate = () => {
    errors.value = {};
    let isValid = true;

    if (!form.value.venueId) {
        errors.value['venueId'] = 'Venue is required';
        isValid = false;
    }
    if (!datePart.value) { 
        errors.value['date'] = 'Date is required';
        isValid = false;
    }
    if (!form.value.ticketType) {
        errors.value['ticketType'] = 'Ticket Type is required';
        isValid = false;
    }

    return isValid;
};


const handleSubmit = () => {
    if (!validate()) return;
    // Filter out empty strings from setlists before submitting
    const submissionData = {
        ...form.value,
        acts: form.value.acts?.map(act => ({
            ...act,
            setlist: act.setlist?.filter(song => song.trim() !== '') || []
        }))
    };
    emit('submit', submissionData as UpsertGigRequest);
};
</script>
