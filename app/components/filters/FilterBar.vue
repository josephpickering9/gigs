<template>
  <div class="flex flex-wrap items-center gap-2">
    <FilterChip
      v-for="(filter, index) in filters"
      :key="`${filter.type}-${index}`"
      :filter="filter"
      @remove="removeFilter(index)"
    />

    <div ref="container" class="dropdown" :class="{ 'dropdown-open': isOpen }">
      <button
        type="button"
        class="btn btn-sm gap-2"
        :class="filters.length > 0 ? 'btn-ghost' : 'btn-outline'"
        @click="toggle"
      >
        <Icon name="heroicons:funnel" size="1.2em" />
        <span>{{ filters.length > 0 ? 'Add Filter' : 'Filter' }}</span>
      </button>

      <div 
        v-if="isOpen" 
        class="dropdown-content z-[1] mt-2 w-[90vw] md:w-72 rounded-box bg-base-100 p-2 shadow-xl ring-1 ring-base-content/10 overflow-hidden" 
        :class="dropdownPosition === 'left' ? 'dropdown-left' : 'dropdown-right'" 
        @click.stop 
        @keydown="handleMainMenuKeydown"
      >
        
        <!-- Submenu View -->
        <div v-if="activeSubmenu" class="flex flex-col animate-slide-in-right h-full min-h-[300px] max-h-[60vh] md:max-h-[400px]">
          <button 
            class="btn btn-sm btn-ghost gap-2 justify-start mb-2 px-1 text-base-content/60 hover:text-base-content"
            @click="closeSubmenu"
          >
            <Icon name="heroicons:chevron-left" size="1em" />
            Back
          </button>
          
          <div class="flex-1 overflow-y-auto">
            <VenueFilterList
              v-if="activeSubmenu === FilterType.VENUE"
              @select="handleVenueSelect"
              @close="handleSubmenuClose"
            />

            <ArtistFilterList
              v-else-if="activeSubmenu === FilterType.ARTIST"
              @select="handleArtistSelect"
              @close="handleSubmenuClose"
            />

            <CityFilterList
              v-else-if="activeSubmenu === FilterType.CITY"
              @select="handleCitySelect"
              @close="handleSubmenuClose"
            />
          </div>
        </div>

        <!-- Main Menu View -->
        <div v-else class="flex flex-col gap-1">
          <div class="px-2 py-1">
            <TextInput
              ref="searchInputRef"
              v-model="searchValue"
              placeholder="Search gigs..."
              size="sm"
              @keydown="handleSearchKeydown"
            />
          </div>

          <div class="divider my-0" />

          <div
            v-for="(filterType, index) in availableFilterTypes"
            :key="filterType.value"
            class="relative"
          >
            <button
              ref="filterTypeRefs"
              type="button"
              class="btn btn-sm btn-ghost focus-visible:outline-none w-full justify-start gap-3 font-normal py-3 h-auto"
              :class="{ 'ring-2 ring-primary': focusedFilterTypeIndex === index }"
              @click="openSubmenu(filterType.value)"
            >
              <Icon :name="filterType.icon" size="1.2em" class="text-base-content/70" />
              <span class="flex-1 text-left">{{ filterType.label }}</span>
              <Icon name="heroicons:chevron-right" size="1em" class="opacity-50" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { Icon } from '#components';
import { useGigStore } from '~/store/GigStore';
import FilterChip from './FilterChip.vue';
import TextInput from '~/components/ui/input/TextInput.vue';
import VenueFilterList from './list/VenueFilterList.vue';
import ArtistFilterList from './list/ArtistFilterList.vue';
import CityFilterList from './list/CityFilterList.vue';
import type { Filter } from '~/types/Filter';
import { FilterType } from '~/types/FilterType';

interface Props {
  filters: Filter[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:filters': [filters: Filter[]];
}>();

const gigStore = useGigStore();

const isOpen = ref(false);
const searchValue = ref<string>('');
const activeSubmenu = ref<string | null>(null);
const dropdownPosition = ref<'left' | 'right'>('right');
const container = ref<HTMLElement | null>(null);

const focusedFilterTypeIndex = ref(-1); // -1 means search is focused
const filterTypeRefs = ref<HTMLElement[]>([]);
const searchInputRef = ref<InstanceType<typeof TextInput> | null>(null);

const filterTypes = [
  { value: FilterType.SEARCH, label: 'Search', icon: 'heroicons:magnifying-glass' },
  { value: FilterType.VENUE, label: 'Venue', icon: 'mdi:map-marker' },
  { value: FilterType.CITY, label: 'City', icon: 'mdi:city' },
  { value: FilterType.ARTIST, label: 'Artist', icon: 'mdi:microphone' },
];

const availableFilterTypes = computed(() => filterTypes.filter(ft => ft.value !== FilterType.SEARCH));

const venues = computed(() => gigStore.venues);
const artists = computed(() => gigStore.artists);

function calculateDropdownPosition() {
  if (container.value) {
    const rect = container.value.getBoundingClientRect();
    const dropdownWidth = 280;
    const buffer = 16;
    const viewportWidth = window.innerWidth;
    
    const spaceOnRight = viewportWidth - rect.right;
    const wouldOverflow = spaceOnRight < (dropdownWidth + buffer);
    
    dropdownPosition.value = wouldOverflow ? 'left' : 'right';
  }
}

function toggle() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    calculateDropdownPosition();
    focusedFilterTypeIndex.value = -1;
    nextTick(() => {
        // Ensure data is loaded
        if (!gigStore.venues.length) gigStore.fetchVenues();
        if (!gigStore.artists.length) gigStore.fetchArtists();
        searchInputRef.value?.focus();
    });
  } else {
    activeSubmenu.value = null;
  }
}

function close() {
  isOpen.value = false;
  activeSubmenu.value = null;
}

function openSubmenu(filterTypeValue: string) {
  activeSubmenu.value = filterTypeValue;
}

function closeSubmenu() {
  activeSubmenu.value = null;
  nextTick(() => {
    searchInputRef.value?.focus();
  });
}

function handleSubmenuClose() {
  close();
}

function handleSearchKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' && availableFilterTypes.value.length > 0) {
    event.preventDefault();
    event.stopPropagation();
    focusedFilterTypeIndex.value = 0;
    scrollToFocusedFilterType();
  }
}

function handleMainMenuKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      if (focusedFilterTypeIndex.value === -1) {
        focusedFilterTypeIndex.value = 0;
        scrollToFocusedFilterType();
      } else if (focusedFilterTypeIndex.value < availableFilterTypes.value.length - 1) {
        focusedFilterTypeIndex.value++;
        scrollToFocusedFilterType();
      }
      break;
    case 'ArrowUp':
      event.preventDefault();
      if (focusedFilterTypeIndex.value === 0) {
        focusedFilterTypeIndex.value = -1;
        nextTick(() => {
          searchInputRef.value?.focus();
        });
      } else if (focusedFilterTypeIndex.value > 0) {
        focusedFilterTypeIndex.value--;
        scrollToFocusedFilterType();
      }
      break;
    case 'ArrowLeft':
    case 'ArrowRight':
    case 'Enter':
      event.preventDefault();
      if (focusedFilterTypeIndex.value >= 0 && availableFilterTypes.value[focusedFilterTypeIndex.value]) {
        openSubmenu(availableFilterTypes.value[focusedFilterTypeIndex.value].value);
      }
      break;
    case 'Escape':
      event.preventDefault();
      close();
      break;
  }
}

function scrollToFocusedFilterType() {
  nextTick(() => {
    const focusedElement = filterTypeRefs.value[focusedFilterTypeIndex.value];
    if (focusedElement) {
      focusedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      focusedElement.focus();
    }
  });
}

function handleVenueSelect(venueId: string) {
  const venue = venues.value.find(v => v.id === venueId);
  if (!venue) return;

  const newFilter: Filter = {
    type: FilterType.VENUE,
    value: venueId,
    label: 'Venue',
    displayValue: venue.name,
  };

  emit('update:filters', [...props.filters, newFilter]);
  close();
}

function handleArtistSelect(artistId: string) {
  const artist = artists.value.find(a => a.id === artistId);
  if (!artist) return;

  const newFilter: Filter = {
    type: FilterType.ARTIST,
    value: artistId,
    label: 'Artist',
    displayValue: artist.name,
  };

  emit('update:filters', [...props.filters, newFilter]);
  close();
}

function handleCitySelect(city: string) {
  const newFilter: Filter = {
    type: FilterType.CITY,
    value: city,
    label: 'City',
    displayValue: city,
  };

  emit('update:filters', [...props.filters, newFilter]);
  close();
}

function removeFilter(index: number) {
  const updatedFilters = [...props.filters];
  const removedFilter = updatedFilters.splice(index, 1)[0];
  
  if (removedFilter?.type === FilterType.SEARCH) searchValue.value = '';
  
  emit('update:filters', updatedFilters);
}

function applySearchFilter() {
  if (!searchValue.value.trim()) {
    const searchFilterIndex = props.filters.findIndex(f => f.type === FilterType.SEARCH);
    if (searchFilterIndex !== -1) removeFilter(searchFilterIndex);
  } else {
      const updatedFilters = [...props.filters];
      const searchFilterIndex = updatedFilters.findIndex(f => f.type === FilterType.SEARCH);
      
      const searchFilter: Filter = {
        type: FilterType.SEARCH,
        value: searchValue.value.trim(),
        label: 'Search',
      };

      if (searchFilterIndex !== -1) updatedFilters[searchFilterIndex] = searchFilter;
      else updatedFilters.push(searchFilter);
      
      // We don't want to emit double updates if we are just calling this from watcher
      // but removeFilter calls emit. 
      // If we are adding/updating, we should emit.
      emit('update:filters', updatedFilters);
  }
}

function handleClickOutside(event: MouseEvent) {
  if (container.value && !container.value.contains(event.target as Node)) {
    close();
  }
}

watch(() => props.filters, (newFilters) => {
  const searchFilter = newFilters.find(f => f.type === FilterType.SEARCH);
  if (searchFilter && searchFilter.value !== searchValue.value) {
    searchValue.value = searchFilter.value;
  } else if (!searchFilter && searchValue.value) {
    searchValue.value = '';
  }
}, { deep: true, immediate: true });

// Debounce search update?
let searchTimeout: NodeJS.Timeout;
watch(() => searchValue.value, () => {
    // Basic debounce
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        applySearchFilter();
    }, 300);
});

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.dropdown-left {
  right: 0;
}
.dropdown-right {
  left: 0;
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.animate-slide-in-right {
  animation: slideInRight 0.2s ease-out forwards;
}
</style>
