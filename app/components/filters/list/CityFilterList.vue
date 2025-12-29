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
        v-for="(city, index) in filteredCities"
        :key="city"
        ref="itemRefs"
        type="button"
        class="btn btn-sm btn-ghost focus-visible:outline-none justify-start hover:bg-base-200 h-auto py-2"
        :class="{ 'ring-2 ring-primary': focusedIndex === index }"
        @click="selectCity(city)"
        @mouseenter="focusedIndex = index"
        @keydown="handleItemKeydown"
      >
        <span class="font-medium">{{ city }}</span>
      </button>
      <div v-if="filteredCities.length === 0" class="text-sm text-center py-4 opacity-50">
        No cities found
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import { orderBy, uniq, compact } from 'lodash-es';
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

const cities = computed((): string[] => {
    const allCities = (gigStore.venues || []).map(v => v.city);
    return orderBy(uniq(compact(allCities)), (c) => c, ['asc']);
});

const filteredCities = computed(() => {
  if (!searchQuery.value.trim()) {
    return cities.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return cities.value.filter(city => 
    city.toLowerCase().includes(query)
  );
});

function selectCity(city: string) {
  emit('select', city);
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
        selectCity(filteredCities.value[focusedIndex.value]);
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
