<template>
  <div class="flex flex-col">
    <div class="px-1 pb-2 sticky top-0 bg-base-100 z-10">
      <TextInput
        ref="searchInputRef"
        v-model="searchQuery"
        placeholder="Search venues..."
        size="sm"
        @keydown="handleSearchKeydown"
      />
    </div>
    
    <div class="flex flex-col md:max-h-64 overflow-y-auto overscroll-contain p-1">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import { orderBy } from 'lodash-es';
import type { GetVenueResponse } from '~~/api';
import { useGigStore } from '~/store/GigStore';
import TextInput from '~/components/ui/input/TextInput.vue';

const emit = defineEmits<{
  'select': [venueId: string];
  'close': [];
}>();

const gigStore = useGigStore();
const focusedIndex = ref(-1);
const itemRefs = ref<HTMLElement[]>([]);
const searchQuery = ref('');
const searchInputRef = ref<InstanceType<typeof TextInput> | null>(null);

const venues = computed((): GetVenueResponse[] => {
    // If venues aren't loaded, we might need to fetch them. 
    // Assuming FilterBar triggers fetch or Store already has them.
    return orderBy(gigStore.venues || [], [(v) => v.name], ['asc']);
});

const filteredVenues = computed(() => {
  if (!searchQuery.value.trim()) {
    return venues.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return venues.value.filter(venue => 
    venue.name?.toLowerCase().includes(query) || 
    venue.city?.toLowerCase().includes(query)
  );
});

function selectVenue(venueId: string) {
  emit('select', venueId);
}

function handleSearchKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' && filteredVenues.value.length > 0) {
    event.preventDefault();
    focusedIndex.value = 0;
    scrollToFocusedItem();
  } else if (event.key === 'Escape') {
    event.preventDefault();
    emit('close');
  }
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
      } else if (focusedIndex.value === 0) {
        focusedIndex.value = -1;
        nextTick(() => {
          searchInputRef.value?.focus();
        });
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
  nextTick(() => {
    searchInputRef.value?.focus();
  });
});
</script>
