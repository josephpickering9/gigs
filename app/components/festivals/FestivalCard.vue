<template>
  <div class="card bg-base-100 shadow-xl hover:scale-105 transition-transform duration-300 border border-primary/20 block h-full">
    <figure class="h-48 overflow-hidden bg-base-200">
      <img :src="festivalImage" :alt="festival.name" class="h-full w-full object-cover">
    </figure>
    <div class="card-body p-6">
      <h2 class="card-title text-2xl font-bold text-primary flex-col items-start gap-1">
          <span>{{ festival.name }}</span>
          <span v-if="festival.year" class="text-base font-normal text-base-content/60">({{ festival.year }})</span>
      </h2>
      
      <div class="flex items-center gap-2 text-base-content/70 mt-4">
          <Icon name="mdi:calendar-multiple" class="w-5 h-5 text-accent" />
          <span class="font-semibold">{{ festival.gigs?.length || 0 }} gig{{ festival.gigs?.length !== 1 ? 's' : '' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FestivalDto } from '~~/api';
import { computed } from 'vue';
import { getImageUrl } from '~/utils/image-helper';

const props = defineProps<{
  festival: FestivalDto;
}>();

const festivalImage = computed(() => {
    return props.festival.imageUrl ? getImageUrl(props.festival.imageUrl) : 'https://placehold.co/600x400?text=' + encodeURIComponent(props.festival.name || 'Festival');
});
</script>
