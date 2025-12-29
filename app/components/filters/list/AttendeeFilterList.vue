<template>
  <div class="flex flex-col">
    <div class="px-1 pb-2 sticky top-0 bg-base-100 z-10">
      <TextInput
        ref="searchInputRef"
        v-model="searchQuery"
        placeholder="Search attendees..."
        size="sm"
        @keydown="handleSearchKeydown"
      />
    </div>
    
    <div class="flex flex-col md:max-h-64 overflow-y-auto overscroll-contain p-1">
      <button
        v-for="(attendee, index) in filteredAttendees"
        :key="attendee.id"
        ref="itemRefs"
        type="button"
        class="btn btn-sm btn-ghost focus-visible:outline-none justify-start hover:bg-base-200 h-auto py-2"
        :class="{ 'ring-2 ring-primary': focusedIndex === index }"
        @click="selectAttendee(attendee.id!)"
        @mouseenter="focusedIndex = index"
        @keydown="handleItemKeydown"
      >
        <div class="flex flex-col items-start w-full">
          <span class="font-medium">{{ attendee.name }}</span>
          <span v-if="attendee.gigCount !== undefined" class="text-xs text-base-content/60">{{ attendee.gigCount }} gig{{ attendee.gigCount !== 1 ? 's' : '' }}</span>
        </div>
      </button>
      <div v-if="filteredAttendees.length === 0" class="text-sm text-center py-4 opacity-50">
        No attendees found
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import { orderBy } from 'lodash-es';
import type { GetAttendeeResponse } from '~~/api';
import { useGigStore } from '~/store/GigStore';
import TextInput from '~/components/ui/input/TextInput.vue';

const emit = defineEmits<{
  'select': [attendeeId: string];
  'close': [];
}>();

const gigStore = useGigStore();
const focusedIndex = ref(-1);
const itemRefs = ref<HTMLElement[]>([]);
const searchQuery = ref('');
const searchInputRef = ref<InstanceType<typeof TextInput> | null>(null);

const attendees = computed((): GetAttendeeResponse[] => {
    return orderBy(gigStore.attendees || [], [(a) => a.gigCount ?? 0], ['desc']);
});

const filteredAttendees = computed(() => {
  if (!searchQuery.value.trim()) {
    return attendees.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return attendees.value.filter(attendee => 
    attendee.name?.toLowerCase().includes(query)
  );
});

function selectAttendee(attendeeId: string) {
  emit('select', attendeeId);
}

function handleSearchKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' && filteredAttendees.value.length > 0) {
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
      if (focusedIndex.value < filteredAttendees.value.length - 1) {
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
      {
        const item = filteredAttendees.value[focusedIndex.value];
        if (item && item.id) {
          selectAttendee(item.id);
        }
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
