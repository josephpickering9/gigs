<template>
  <div class="flex flex-col">
    <div class="px-1 pb-2 sticky top-0 bg-base-100 z-10">
      <TextInput
        ref="searchInputRef"
        v-model="searchQuery"
        placeholder="Search artists..."
        size="sm"
        @keydown="handleSearchKeydown"
      />
    </div>
    
    <div class="flex flex-col md:max-h-64 overflow-y-auto overscroll-contain p-1">
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
          <div class="flex gap-2 items-center justify-between w-full">
              <div class="flex gap-2 items-center">
                  <div class="avatar">
                      <div class="w-6 h-6 rounded-full">
                          <img v-if="artist.imageUrl" :src="getArtistImage(artist)" :alt="artist.name" class="object-cover" >
                          <div v-else class="bg-base-300 flex items-center justify-center w-full h-full">
                              <Icon name="mdi:account-music" class="w-4 h-4 text-base-content/50" />
                          </div>
                      </div>
                  </div>
                  <span class="font-medium">{{ artist.name }}</span>
              </div>
              <span v-if="artist.gigCount !== undefined" class="text-xs text-base-content/60">{{ artist.gigCount }} gig{{ artist.gigCount !== 1 ? 's' : '' }}</span>
          </div>
      </button>
      <div v-if="filteredArtists.length === 0" class="text-sm text-center py-4 opacity-50">
        No artists found
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import { orderBy } from 'lodash-es';
import type { GetArtistResponse } from '~~/api';
import { useGigStore } from '~/store/GigStore';
import { getImageUrl } from '~/utils/image-helper';
import TextInput from '~/components/ui/input/TextInput.vue';

const emit = defineEmits<{
  'select': [artistId: string];
  'close': [];
}>();

const gigStore = useGigStore();
const focusedIndex = ref(-1);
const itemRefs = ref<HTMLElement[]>([]);
const searchQuery = ref('');
const searchInputRef = ref<InstanceType<typeof TextInput> | null>(null);

const artists = computed((): GetArtistResponse[] => {
    // Sort by gig count descending, then by name
    return orderBy(gigStore.artists || [], [(a) => a.gigCount ?? 0, (a) => a.name], ['desc', 'asc']);
});

const filteredArtists = computed(() => {
  if (!searchQuery.value.trim()) {
    return artists.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return artists.value.filter(artist => 
    artist.name?.toLowerCase().includes(query)
  );
});

function getArtistImage(artist: GetArtistResponse) {
  return artist.imageUrl ? getImageUrl(artist.imageUrl) : 'https://placehold.co/600x400?text=No+Image';
}

function selectArtist(artistId: string) {
  emit('select', artistId);
}

function handleSearchKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' && filteredArtists.value.length > 0) {
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
  nextTick(() => {
    searchInputRef.value?.focus();
  });
});
</script>
