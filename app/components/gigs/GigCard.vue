<template>
  <NuxtLink :to="`/gigs/${gig.id}`" class="card bg-base-100 shadow-xl hover:scale-105 transition-transform duration-300 border border-primary/20 block h-full">
    <figure>
      <img :src="gigImage" :alt="gig.venueName" class="h-48 w-full object-cover">
    </figure>
    <div class="card-body">
      <h2 class="card-title text-2xl font-bold text-primary">{{ headliner }}</h2>
      <p v-if="supportActs.length" class="text-lg">{{ supportActs.join(', ') }}</p>
      <div class="flex flex-col gap-2">
         <div class="flex items-center gap-2 text-lg text-secondary">
             <Icon name="mdi:map-marker" class="w-5 h-5" />
             <span class="font-semibold">{{ gig.venueName }}</span>
         </div>
         <div class="flex items-center gap-2 text-base-content/70">
             <Icon name="mdi:calendar" class="w-5 h-5 text-accent" />
             <span class="font-semibold">{{ formattedDate }}</span>
         </div>
         <div class="flex items-center gap-2 mt-2">
             <div class="badge badge-accent badge-outline">{{ gig.ticketType }}</div>
             <span v-if="gig.ticketCost" class="text-sm font-bold text-primary">£{{ gig.ticketCost.toFixed(2) }}</span>
         </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { GetGigResponse } from '~~/api';
import { computed } from 'vue';
import { format } from 'date-fns';
import { getImageUrl } from '~/utils/image-helper';

const props = defineProps<{
  gig: GetGigResponse;
}>();

const gigImage = computed(() => {
    return props.gig.imageUrl ? getImageUrl(props.gig.imageUrl) : 'https://placehold.co/600x400?text=No+Image';
});

const headliner = computed(() => {
    return props.gig.acts?.find(act => act.isHeadliner)?.name || 'TBA';
});

const supportActs = computed(() => {
    return props.gig.acts?.filter(act => !act.isHeadliner).map(act => act.name) || [];
});

const formattedDate = computed(() => {
    if (!props.gig.date) return 'TBA';
    return format(new Date(props.gig.date), 'dd MMM yyyy');
});
</script>
