<template>
  <div class="container mx-auto p-4 min-h-screen">
    <div class="flex items-center mb-8 gap-4">
        <button class="btn btn-ghost btn-circle" @click="router.back()">
            <Icon name="mdi:arrow-left" class="w-8 h-8" />
        </button>
         <div>
             <h1 class="text-4xl font-bold text-primary mb-2">
                 {{ festival?.name }}
                 <span v-if="festival?.year" class="text-2xl font-normal text-base-content/60 ml-2">({{ festival?.year }})</span>
             </h1>
             
             <!-- Festival Metadata -->
             <div class="flex flex-wrap gap-4 text-base-content/80 mb-6">
                 <!-- Venue(s) -->
                 <div v-if="venueNames" class="flex items-center gap-1">
                     <Icon name="mdi:map-marker" class="w-5 h-5 text-accent" />
                     <span class="font-medium">{{ venueNames }}</span>
                 </div>

                 <!-- Date Range -->
                 <div v-if="formattedDateRange" class="flex items-center gap-1">
                     <Icon name="mdi:calendar-range" class="w-5 h-5 text-accent" />
                     <span>{{ formattedDateRange }}</span>
                 </div>

                 <!-- Price -->
                 <div v-if="festival?.price" class="flex items-center gap-1">
                     <Icon name="mdi:currency-gbp" class="w-5 h-5 text-accent" />
                     <span>{{ formatCurrency(festival.price) }}</span>
                 </div>
             </div>
         </div>
         <div v-if="isAuthenticated" class="ml-auto">
              <NuxtLink :to="`/festivals/${festivalId}/edit`" class="btn btn-secondary">
                 <Icon name="mdi:pencil" class="w-5 h-5 mr-2" />
                 Edit Festival
             </NuxtLink>
         </div>
     </div>

     <div v-if="loading" class="flex justify-center py-12">
         <span class="loading loading-spinner loading-lg text-primary" />
     </div>

     <div v-else-if="!festival" class="alert alert-error">
         Festival not found
     </div>

     <div v-else class="space-y-8">
         <div v-if="festival.imageUrl" class="w-full h-64 md:h-96 rounded-xl overflow-hidden shadow-xl">
             <img :src="getImageUrl(festival.imageUrl)" :alt="festival.name" class="w-full h-full object-cover" >
         </div>
         <div>
             <div v-if="!festival.gigs || festival.gigs.length === 0" class="text-gray-500 italic">
                 No gigs recorded for this festival yet.
             </div>

             <div v-else class="space-y-12">
                  <div v-for="group in groupedGigs" :key="group.title + group.dateObj.toString()">
                      <h3 class="text-2xl font-bold mb-6 pl-2 border-l-4 border-accent text-base-content/80">
                          {{ group.title }}
                      </h3>
                      <div class="overflow-x-auto">
                          <table class="table w-full">
                              <thead>
                                  <tr>
                                      <th>Artist</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  <tr v-for="gig in group.gigs" :key="gig.id" class="hover">
                                      <td>
                                          <div class="space-y-1">
                                              <!-- Headliners -->
                                              <div v-for="act in (gig.acts || []).filter((a: any) => a.isHeadliner)" :key="act.artistId" class="font-bold text-lg">
                                                  {{ act.name }}
                                              </div>
                                              <!-- Support -->
                                              <div v-if="(gig.acts || []).some((a: any) => !a.isHeadliner)" class="text-sm text-base-content/60">
                                                  <span class="mr-2">Support:</span>
                                                  {{ (gig.acts || []).filter((a: any) => !a.isHeadliner).map((a: any) => a.name).join(', ') }}
                                              </div>
                                          </div>
                                      </td>
                                  </tr>
                              </tbody>
                          </table>
                      </div>
                  </div>
             </div>
         </div>
     </div>
  </div>
</template>

<script setup lang="ts">

import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGigStore } from '~/store/GigStore';
import useAuth from '~/composables/useAuth';
import type { GetFestivalResponse, GetGigResponse } from '~~/api';
import { getImageUrl } from '~/utils/image-helper';
import { format, parseISO, isValid } from 'date-fns';
import { groupBy, sortBy } from 'lodash-es';

const route = useRoute();
const router = useRouter();
const gigStore = useGigStore();
const { isAuthenticated } = useAuth();
const festivalId = route.params['id'] as string;

const festival = ref<GetFestivalResponse | undefined>(undefined);
const loading = ref(true);

useHead({
  title: () => festival.value ? `${festival.value.name} - Gigs` : 'Festival Details - Gigs',
});

interface GroupedGigSection {
    title: string;
    dateObj: Date;
    gigs: GetGigResponse[];
}

const groupedGigs = computed<GroupedGigSection[]>(() => {
    if (!festival.value?.gigs) return [];

    // Sort gigs by date first
    const sortedGigs = sortBy(festival.value.gigs, (gig) => {
        if (!gig.date) return new Date(8640000000000000); // Max date for gigs without dates
        const date = parseISO(gig.date);
        return isValid(date) ? date.getTime() : new Date(8640000000000000).getTime();
    });

    // Group by date key
    const grouped = groupBy(sortedGigs, (gig) => {
        if (!gig.date) return 'Unknown Date';
        const date = parseISO(gig.date);
        if (!isValid(date)) return 'Unknown Date';
        return format(date, 'yyyy-MM-dd');
    });

    // Transform into the expected format
    return Object.entries(grouped).map(([dateKey, gigs]) => {
        if (dateKey === 'Unknown Date') {
            return {
                title: 'Unknown Date',
                dateObj: new Date(8640000000000000),
                gigs: gigs as GetGigResponse[]
            };
        }
        
        const date = parseISO(dateKey);
        return {
            title: format(date, 'EEEE'),
            dateObj: date,
            gigs: gigs as GetGigResponse[]
        };
    });
});

const venueNames = computed(() => {
    if (!festival.value?.gigs) return null;
    const venues = new Set(festival.value.gigs.map(g => g.venueName).filter(Boolean));
    return Array.from(venues).join(', ');
});

const formattedDateRange = computed(() => {
    if (!festival.value?.startDate) return '';
    const start = parseISO(festival.value.startDate);
    const end = festival.value.endDate ? parseISO(festival.value.endDate) : null;
    
    if (end) {
        return `${format(start, 'd MMM')} - ${format(end, 'd MMM yyyy')}`;
    }
    return format(start, 'd MMM yyyy');
});

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);
};

onMounted(async () => {
    festival.value = await gigStore.fetchFestival(festivalId);
    loading.value = false;
});
</script>
