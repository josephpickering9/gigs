<template>
  <div class="flex flex-col max-h-64 overflow-y-auto p-1">
    <button
      v-for="(venue, index) in filteredVenues"
      :key="venue.id"
      ref="itemRefs"
      type="button"
      class="btn btn-sm btn-ghost focus-visible:outline-none justify-start hover:bg-base-200 h-auto py-2"
      :class="{ 'ring-2 ring-primary': focusedIndex === index }"
      @click="selectVenue(venue.id!)"
      @mouseenter="focusedIndex = index"
      @keydown="handleItemKeydown"
    >
      <div class="flex flex-col items-start">
        <span class="font-medium">{{ venue.name }}</span>
        <span class="text-xs text-base-content/60">{{ venue.city }}</span>
      </div>
    </button>
    <div v-if="filteredVenues.length === 0" class="text-sm text-center py-4 opacity-50">
      No venues found
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import { orderBy } from 'lodash-es';
import type { GetVenueResponse } from '~~/api';
import { useGigStore } from '~/store/GigStore';

const emit = defineEmits<{
  'select': [venueId: string];
  'close': [];
}>();

const gigStore = useGigStore();
const focusedIndex = ref(-1);
const itemRefs = ref<HTMLElement[]>([]);

const venues = computed((): GetVenueResponse[] => {
    // If venues aren't loaded, we might need to fetch them. 
    // Assuming FilterBar triggers fetch or Store already has them.
    return orderBy(gigStore.venues || [], [(v) => v.name], ['asc']);
});

const filteredVenues = computed(() => {
  return venues.value;
});

function selectVenue(venueId: string) {
  console.log('VenueFilterList: selectVenue called with', venueId);
  emit('select', venueId);
}

function handleItemKeydown(event: KeyboardEvent) {
  event.stopPropagation();
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      if (focusedIndex.value < filteredVenues.value.length - 1) {
        focusedIndex.value++;
        scrollToFocusedItem();
      }
      break;
    case 'ArrowUp':
      event.preventDefault();
      if (focusedIndex.value > 0) {
        focusedIndex.value--;
        scrollToFocusedItem();
      }
      break;
    case 'ArrowRight':
    case 'ArrowLeft':
      event.preventDefault();
      emit('close');
      break;
    case 'Enter':
      event.preventDefault();
      if (filteredVenues.value[focusedIndex.value]?.id) {
        selectVenue(filteredVenues.value[focusedIndex.value].id!);
      }
      break;
  }
}

function scrollToFocusedItem() {
  nextTick(() => {
    if (focusedIndex.value >= 0) {
      const focusedElement = itemRefs.value[focusedIndex.value];
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        focusedElement.focus();
      }
    }
  });
}

onMounted(() => {
  if (filteredVenues.value.length > 0) {
    focusedIndex.value = 0;
    scrollToFocusedItem();
  }
});
</script>
