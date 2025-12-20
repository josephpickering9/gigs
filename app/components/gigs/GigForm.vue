<template>
  <form class="grid grid-cols-1 md:grid-cols-2 gap-6" @submit.prevent="handleSubmit">
     <Combobox
        v-model="headliners"
        :options="artistOptions"
        label="Headliners"
        placeholder="Search or add headliners..."
        class="w-full col-span-1 md:col-span-2"
        :error="errors['artistIds']"
    />

    <div class="col-span-1 md:col-span-2">
         <Combobox
            v-model="supportActs"
            :options="artistOptions"
            label="Support Acts"
            placeholder="Search or add support acts..."
            class="w-full"
            :error="errors['artistIds']"
        />
        <label class="label">
            <span class="label-text-alt text-gray-500">
                Note: Can select multiple. New artists can be typed but may not be saved without ID.
            </span>
        </label>
    </div>

    <Combobox
        v-model="selectedVenue"
        label="Venue"
        placeholder="Search or add venue..."
        :options="venueOptions"
        :multiple="false"
        class="w-full col-span-1"
        :error="errors['venueId']"
    />

    <DatePicker
        v-model="datePart"
        label="Date"
        placeholder="Pick a date"
        class="w-full col-span-1"
        :error="errors['date']"
    />

    <SelectMenu
        v-model="form.ticketType"
        label="Ticket Type"
        :options="ticketTypeOptions"
        class="w-full col-span-1"
        :error="errors['ticketType']"
    />

    <RangeSlider
        v-model="form.ticketCost"
        label="Ticket Cost"
        :min="0"
        :max="100"
        :step="1"
        class="col-span-1"
        :error="errors['ticketCost']"
    />

    <div class="form-control w-full col-span-1 md:col-span-2">
        <label class="label">
            <span class="label-text">Gig Image</span>
        </label>
        <FileInput 
            v-model="imageFiles" 
            :image-url="form.imageUrl" 
            @update:file="handleFileSelect"
            @update:image-url="handleImageUrlUpdate"
        />
        <div class="mt-2">
             <TextInput
                v-model="imageUrlProxy"
                label="Or enter Image URL manually"
                placeholder="https://example.com/image.jpg"
                type="url"
            />
        </div>
    </div>

    <div class="flex justify-between gap-4 mt-8 col-span-1 md:col-span-2">
        <div>
            <button 
                v-if="initialData?.id" 
                type="button" 
                class="btn btn-secondary" 
                :disabled="gigStore.enriching"
                @click="handleEnrich"
            >
                <span v-if="gigStore.enriching" class="loading loading-spinner"/>
                Enrich Gig
            </button>
        </div>
        <div class="flex gap-4">
            <slot name="actions">
                <button type="button" class="btn btn-ghost" @click="$emit('cancel')">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="loading">
                    <span v-if="loading" class="loading loading-spinner"/>
                    {{ submitLabel }}
                </button>
            </slot>
        </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { TicketType, type UpsertGigRequest, type GetGigResponse } from '~~/api';
import { useGigStore } from '~/store/GigStore';
import SelectMenu from '~/components/ui/input/SelectMenu.vue';
import DatePicker from '~/components/ui/input/DatePicker.vue';
import TextInput from '~/components/ui/input/TextInput.vue';
import FileInput from '~/components/ui/input/FileInput.vue';
import Combobox from '~/components/ui/input/Combobox.vue';
import RangeSlider from '~/components/ui/input/RangeSlider.vue';
import type { SelectListItem } from '~/types/SelectListItem';

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
const ticketCostInput = ref<number>(0); 
const imageFiles = ref<FileList | null>(null);
const previewUrl = ref<string | null>(null); 
const imageUrlProxy = ref(''); 

const headliners = ref<SelectListItem[]>([]);
const supportActs = ref<SelectListItem[]>([]);
const selectedVenue = ref<SelectListItem[]>([]);

const form = ref<UpsertGigRequest>({
  venueId: '',
  date: '',
  ticketType: TicketType.STANDING, // Default
  ticketCost: null,
  imageUrl: '', 
  artistIds: [],
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

const handleFileSelect = (files: FileList | null) => {
    imageFiles.value = files;
    if (files && files.length > 0) {
        // TODO: Upload logic or preview
        const file = files[0];
        previewUrl.value = URL.createObjectURL(file);
    }
};

const handleImageUrlUpdate = (url: string) => {
    form.value.imageUrl = url;
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
    if (newData) {
        form.value = {
            venueId: newData.venueId || '',
        };
        
        if (newData.venueId) {
            const v = venues.value.find(v => v.id === newData.venueId);
            if (v) {
                selectedVenue.value = [{ text: v.name || 'Unknown', value: v.id || '' }];
            }
        }

        if (newData.acts?.length) {
            form.value.artistIds = newData.acts.map(a => a.artistId || '');
            headliners.value = newData.acts.filter(a => a.isHeadliner).map(a => ({ text: a.name || 'Unknown', value: a.artistId || '' }));
            supportActs.value = newData.acts.filter(a => !a.isHeadliner).map(a => ({ text: a.name || 'Unknown', value: a.artistId || '' }));
        }
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

const validate = () => {
    errors.value = {};
    let isValid = true;

    if (!form.value.venueId) {
        errors.value.venueId = 'Venue is required';
        isValid = false;
    }
    if (!datePart.value) { 
        errors.value.date = 'Date is required';
        isValid = false;
    }
    if (!form.value.ticketType) {
        errors.value.ticketType = 'Ticket Type is required';
        isValid = false;
    }

    return isValid;
};

const handleEnrich = async () => {
    if (!props.initialData?.id) return;
    
    try {
        await gigStore.enrichGig(props.initialData.id);
        
        // Fetch the updated gig data
        const enrichedGig = await gigStore.fetchGig(props.initialData.id);
        
        // Update form with enriched data
        if (enrichedGig) {
            form.value = {
                venueId: enrichedGig.venueId || '',
                date: enrichedGig.date || '',
                ticketType: enrichedGig.ticketType || TicketType.STANDING,
                ticketCost: enrichedGig.ticketCost,
                imageUrl: enrichedGig.imageUrl || '',
                artistIds: enrichedGig.acts?.map(a => a.artistId || '') || [],
            };
            
            datePart.value = enrichedGig.date || '';
            
            // Update artists
            if (enrichedGig.acts?.length) {
                headliners.value = enrichedGig.acts.filter(a => a.isHeadliner).map(a => ({ text: a.name || 'Unknown', value: a.artistId || '' }));
                supportActs.value = enrichedGig.acts.filter(a => !a.isHeadliner).map(a => ({ text: a.name || 'Unknown', value: a.artistId || '' }));
            }
            
            // Update venue
            if (enrichedGig.venueId) {
                const v = venues.value.find(v => v.id === enrichedGig.venueId);
                if (v) {
                    selectedVenue.value = [{ text: v.name || 'Unknown', value: v.id || '' }];
                }
            }
        }
    } catch {
        // Error handled in store
    }
};

const handleSubmit = () => {
    if (!validate()) return;
    emit('submit', form.value);
};
</script>
