<template>
  <div class="card bg-base-100 shadow-xl hover:scale-105 transition-transform duration-300 border border-primary/20 block h-full">
    <figure class="h-48 overflow-hidden bg-base-200">
      <img :src="festivalImage" :alt="festival.name" class="h-full w-full object-cover">
    </figure>
    <div class="card-body">
      <h2 class="card-title text-2xl font-bold text-primary">{{ festival.name }}</h2>
      
      <div class="flex flex-col gap-2 mt-2">
         <div class="flex items-center gap-2 text-base-content/70">
             <Icon name="mdi:calendar-multiple" class="w-5 h-5 text-accent" />
             <span class="font-semibold">{{ festival.gigs?.length || 0 }} gig{{ festival.gigs?.length !== 1 ? 's' : '' }}</span>
         </div>
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
