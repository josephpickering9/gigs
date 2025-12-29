<template>
  <div class="flex flex-col">
    <div class="px-1 pb-2 sticky top-0 bg-base-100 z-10">
      <TextInput
        ref="searchInputRef"
        v-model="searchQuery"
        placeholder="Search cities..."
        size="sm"
        @keydown="handleSearchKeydown"
      />
    </div>
    
    <div class="flex flex-col md:max-h-64 overflow-y-auto overscroll-contain p-1">
      <button
        v-for="(cityData, index) in filteredCities"
        :key="cityData.name"
        ref="itemRefs"
        type="button"
        class="btn btn-sm btn-ghost focus-visible:outline-none justify-start hover:bg-base-200 h-auto py-2"
        :class="{ 'ring-2 ring-primary': focusedIndex === index }"
        @click="selectCity(cityData.name)"
        @mouseenter="focusedIndex = index"
        @keydown="handleItemKeydown"
      >
        <div class="flex items-center justify-between w-full">
          <span class="font-medium">{{ cityData.name }}</span>
          <span class="text-xs text-base-content/60">{{ cityData.gigCount }} gig{{ cityData.gigCount !== 1 ? 's' : '' }}</span>
        </div>
      </button>
      <div v-if="filteredCities.length === 0" class="text-sm text-center py-4 opacity-50">
        No cities found
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import { orderBy } from 'lodash-es';
import { useGigStore } from '~/store/GigStore';
import TextInput from '~/components/ui/input/TextInput.vue';

const emit = defineEmits<{
  'select': [city: string];
  'close': [];
}>();

const gigStore = useGigStore();
const focusedIndex = ref(-1);
const itemRefs = ref<HTMLElement[]>([]);
const searchQuery = ref('');
const searchInputRef = ref<InstanceType<typeof TextInput> | null>(null);

interface CityData {
  name: string;
  gigCount: number;
}

const cities = computed((): CityData[] => {
    const venues = gigStore.venues || [];
    const cityMap = new Map<string, number>();
    
    // Count gigs per city
    venues.forEach(venue => {
        if (venue.city) {
            const count = cityMap.get(venue.city) || 0;
            cityMap.set(venue.city, count + (venue.gigCount ?? 0));
        }
    });
    
    // Convert to array and sort by gig count descending, then by name
    const cityArray = Array.from(cityMap.entries()).map(([name, gigCount]) => ({ name, gigCount }));
    return orderBy(cityArray, [(c) => c.gigCount, (c) => c.name], ['desc', 'asc']);
});

const filteredCities = computed(() => {
  if (!searchQuery.value.trim()) {
    return cities.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return cities.value.filter(cityData => 
    cityData.name.toLowerCase().includes(query)
  );
});

function selectCity(cityName: string) {
  emit('select', cityName);
}

function handleSearchKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' && filteredCities.value.length > 0) {
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
      if (focusedIndex.value < filteredCities.value.length - 1) {
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
      if (filteredCities.value[focusedIndex.value]) {
        selectCity(filteredCities.value[focusedIndex.value].name);
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
