<template>
  <div class="flex flex-col max-h-64 overflow-y-auto p-1">
    <button
      v-for="(artist, index) in filteredArtists"
      :key="artist.id"
      ref="itemRefs"
      type="button"
      class="btn btn-sm btn-ghost focus-visible:outline-none justify-start hover:bg-base-200 h-auto py-2"
      :class="{ 'ring-2 ring-primary': focusedIndex === index }"
      @click="selectArtist(artist.id!)"
      @mouseenter="focusedIndex = index"
      @keydown="handleItemKeydown"
    >
        <div class="flex gap-2 items-center">
             <!-- Assuming we might have images later, but just name for now -->
            <span class="font-medium">{{ artist.name }}</span>
        </div>
    </button>
    <div v-if="filteredArtists.length === 0" class="text-sm text-center py-4 opacity-50">
      No artists found
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import { orderBy } from 'lodash-es';
import type { GetArtistResponse } from '~~/api';
import { useGigStore } from '~/store/GigStore';

const emit = defineEmits<{
  'select': [artistId: string];
  'close': [];
}>();

const gigStore = useGigStore();
const focusedIndex = ref(-1);
const itemRefs = ref<HTMLElement[]>([]);

const artists = computed((): GetArtistResponse[] => {
    return orderBy(gigStore.artists || [], [(a) => a.name], ['asc']);
});

const filteredArtists = computed(() => {
  return artists.value;
});

function selectArtist(artistId: string) {
  emit('select', artistId);
}

function handleItemKeydown(event: KeyboardEvent) {
  event.stopPropagation();
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      if (focusedIndex.value < filteredArtists.value.length - 1) {
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
      if (filteredArtists.value[focusedIndex.value]?.id) {
        selectArtist(filteredArtists.value[focusedIndex.value].id!);
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
  if (filteredArtists.value.length > 0) {
    focusedIndex.value = 0;
    scrollToFocusedItem();
  }
});
</script>
