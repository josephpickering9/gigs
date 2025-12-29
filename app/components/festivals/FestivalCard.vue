<template>
  <div class="card bg-base-100 shadow-xl hover:scale-105 transition-transform duration-300 border border-primary/20 block h-full">
    <figure class="aspect-[3/2] overflow-hidden bg-base-200">
      <img :src="festivalImage" :alt="festival.name" class="h-full w-full object-cover object-top">
    </figure>
    <div class="card-body p-6">
      <h2 class="card-title text-2xl font-bold text-primary flex-col items-start gap-1">
          <span>{{ festival.name }}</span>
          <span v-if="festival.year" class="text-base font-normal text-base-content/60">({{ festival.year }})</span>
      </h2>
      <div class="flex items-center gap-2 text-base-content/70 mt-4">
          <Icon name="mdi:calendar-multiple" class="w-5 h-5 text-accent" />
          <span v-if="festival.startDate" class="font-semibold">
              {{ formatDateRange(festival.startDate, festival.endDate) }}
          </span>
          <span v-else class="font-semibold">{{ festival.gigs?.length || 0 }} gig{{ festival.gigs?.length !== 1 ? 's' : '' }}</span>
      </div>

      <div v-if="festival.venueName" class="flex items-center gap-2 text-base-content/70 mt-2">
          <Icon name="mdi:map-marker" class="w-5 h-5 text-primary" />
          <span class="font-semibold">{{ festival.venueName }}</span>
      </div>
      
      <div v-if="festival.price" class="flex items-center gap-2 text-base-content/70 mt-2">
           <Icon name="mdi:cash" class="w-5 h-5 text-success" />
           <span class="font-semibold">{{ formatCurrency(festival.price) }}</span>
           <span v-if="festival.dailyPrice" class="text-xs opacity-70">
              ({{ formatCurrency(festival.dailyPrice) }} / day)
           </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GetFestivalResponse } from '~~/api';
import { computed } from 'vue';
import { getImageUrl } from '~/utils/image-helper';
import { format, parseISO } from 'date-fns';

const props = defineProps<{
  festival: GetFestivalResponse;
}>();

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);
};

const formatDateRange = (start: string | null | undefined, end: string | null | undefined) => {
    if (!start) return '';
    const startDate = parseISO(start);
    const endDate = end ? parseISO(end) : null;
    
    if (endDate) {
        return `${format(startDate, 'd MMM')} - ${format(endDate, 'd MMM yyyy')}`;
    }
    return format(startDate, 'd MMM yyyy');
};

const festivalImage = computed(() => {
    return props.festival.imageUrl ? getImageUrl(props.festival.imageUrl) : 'https://placehold.co/600x400?text=' + encodeURIComponent(props.festival.name || 'Festival');
});
</script>
