<template>
  <div class="space-y-4">
      <Combobox
        v-model="comboboxSelected"
        label="Add Gigs to Festival"
        placeholder="Search gigs to add..."
        :options="options"
        :multiple="false"
        :loading="loading"
        :error="error"
        :remote="true"
        class="w-full"
        @update:modelValue="onAdd"
        @search="handleSearch"
      />

      <div v-if="selectedGigs.length > 0" class="border rounded-lg overflow-hidden">
          <Table :data="selectedGigs" :columns="columns">
              <template #cell-headliner="{ row }">
                  <span class="font-bold">{{ getHeadliner(row) }}</span>
              </template>
              <template #cell-venue="{ row }">
                  {{ row.venueName || 'Unknown Venue' }}
              </template>
              <template #cell-date="{ row }">
                  {{ formatDate(row.date) }}
              </template>
              <template #cell-actions="{ row }">
                  <button type="button" class="btn btn-ghost btn-xs text-error" @click="removeGig(row.id)">
                      <Icon name="heroicons:trash" class="w-4 h-4" />
                  </button>
              </template>
          </Table>
      </div>
       <div v-else class="text-sm text-base-content/60 italic px-1">
          No gigs selected.
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useGigStore } from '~/store/GigStore';
import Combobox from '~/components/ui/input/Combobox.vue';
import Table from '~/components/ui/table/Table.vue';
import type { SelectListItem } from '~/types/SelectListItem';
import { format } from 'date-fns';
import type { GetGigResponse } from '~~/api';

const props = defineProps<{
  modelValue?: string[];
  initialGigs?: GetGigResponse[];
  error?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

const gigStore = useGigStore();
const loading = computed(() => gigStore.loading);

// Internal state
const selectedGigs = ref<GetGigResponse[]>([]); // Full objects for table
const searchResultGigs = ref<GetGigResponse[]>([]); // Full objects from search
const comboboxSelected = ref<SelectListItem[]>([]); // For binding to Combobox (temporary)
const searchTimer = ref<NodeJS.Timeout | null>(null);

// Table configuration
const columns = [
    { key: 'headliner', label: 'Headliner' },
    { key: 'venue', label: 'Venue' },
    { key: 'date', label: 'Date' },
    { key: 'actions', label: '' }
];

// Helpers
const getHeadliner = (gig: GetGigResponse) => gig.acts?.find(a => a.isHeadliner)?.name || 'TBA';
const formatDate = (dateString?: string) => dateString ? format(new Date(dateString), 'dd MMM yyyy') : 'No Date';

// Mapper for Combobox options
const mapGigToItem = (g: GetGigResponse): SelectListItem => {
    const headliner = getHeadliner(g);
    const date = formatDate(g.date);
    return { 
      text: `${headliner} @ ${g.venueName || 'Unknown Venue'} (${date})`, 
      value: g.id || '' 
    };
};

// Options for Combobox: Search results NOT already selected
const options = computed<SelectListItem[]>(() => {
    const selectedIds = selectedGigs.value.map(g => g.id);
    return searchResultGigs.value
        .filter(g => !selectedIds.includes(g.id))
        .map(mapGigToItem);
});

// Watch initialGigs to populate selectedGigs
watch(() => props.initialGigs, (gigs) => {
    if (gigs && gigs.length > 0) {
        // We trust initialGigs contains the objects for IDs in modelValue (if valid logic upstream)
        // Or we just use them if their IDs match modelValue?
        // Actually, if modelValue is passed, we should respect it.
        const ids = props.modelValue || [];
        const matches = gigs.filter(g => ids.includes(g.id!));
        
        // Merge with existing to avoid overwrites if user added some already?
        // Usually initialGigs comes once.
        
        // simple: set selectedGigIds
        matches.forEach(g => {
            if (!selectedGigs.value.some(s => s.id === g.id)) {
                selectedGigs.value.push(g);
            }
        });
    }
}, { immediate: true });

// Handle external modelValue updates (e.g. cleared by parent)
watch(() => props.modelValue, (newIds) => {
    if (!newIds) {
        selectedGigs.value = [];
        return;
    }
    // Remove if id not in newIds
    selectedGigs.value = selectedGigs.value.filter(g => newIds.includes(g.id!));
    // We cannot "add" purely from ID if we don't have the object.
    // Assuming we have it in selectedGigs or initialGigs or searchResultGigs.
    // If not found, we can't display it well. 
    // This component relies on having the object.
}, { deep: true });


const handleSearch = (query: string) => {
    if (searchTimer.value) clearTimeout(searchTimer.value);
    
    searchTimer.value = setTimeout(async () => {
        if (!query) return;
        
        // We use store fetch but capture 'gigs' from store state immediately
        await gigStore.fetchGigs({ search: query, pageSize: 20 });
        // NOTE: This relies on store.gigs being updated. 
        // If parallel requests happen, might be racey. Ideally use a dedicated search action/state.
        searchResultGigs.value = [...gigStore.gigs]; 
        
    }, 400); 
};


const onAdd = (val: SelectListItem[]) => {
    if (!val || val.length === 0) return;
    const addedItem = val[0]; // Single select
    if (!addedItem) return;
    
    const gigId = String(addedItem.value);

    // Find the gig object
    const gig = searchResultGigs.value.find(g => g.id === gigId);
    if (gig) {
        if (!selectedGigs.value.some(s => s.id === gig.id)) {
            selectedGigs.value.push(gig);
            emitModelUpdate();
        }
    }
    
    // Clear combobox
    comboboxSelected.value = [];
};

const removeGig = (id?: string) => {
    if (!id) return;
    selectedGigs.value = selectedGigs.value.filter(g => g.id !== id);
    emitModelUpdate();
};

const emitModelUpdate = () => {
    const ids = selectedGigs.value.map(g => g.id!).filter(Boolean);
    emit('update:modelValue', ids);
};

onMounted(async () => {
    // Optional: Pre-fill search results with some recent/all gigs?
   if (gigStore.gigs.length === 0) {
        await gigStore.fetchGigs({ pageSize: 20 });
   }
   // Add to search results just to have some options initially
   searchResultGigs.value = [...gigStore.gigs];
});
</script>
