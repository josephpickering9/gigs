<template>
  <div class="container mx-auto p-4 min-h-screen">
    <div class="flex items-center mb-8 gap-4">
        <button class="btn btn-ghost btn-circle" @click="router.back()">
            <Icon name="mdi:arrow-left" class="w-8 h-8" />
        </button>
        <div>
            <h1 class="text-4xl font-bold text-primary">
                {{ festival?.name }}
                <span v-if="festival?.year" class="text-2xl font-normal text-base-content/60 ml-2">({{ festival?.year }})</span>
            </h1>
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
                     <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <GigCard
                            v-for="gig in group.gigs"
                            :key="gig.id"
                            :gig="gig"
                        />
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
import type { FestivalDto } from '~~/api';
import GigCard from '~/components/gigs/GigCard.vue';
import { getImageUrl } from '~/utils/image-helper';
import { format, parseISO, isValid } from 'date-fns';
import { groupBy, sortBy } from 'lodash-es';

const route = useRoute();
const router = useRouter();
const gigStore = useGigStore();
const { isAuthenticated } = useAuth();
const festivalId = route.params['id'] as string;

const festival = ref<FestivalDto | undefined>(undefined);
const loading = ref(true);

useHead({
  title: () => festival.value ? `${festival.value.name} - Gigs` : 'Festival Details - Gigs',
});

const groupedGigs = computed(() => {
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
                gigs
            };
        }
        
        const date = parseISO(dateKey);
        return {
            title: format(date, 'EEEE'),
            dateObj: date,
            gigs
        };
    });
});

onMounted(async () => {
    festival.value = await gigStore.fetchFestival(festivalId);
    loading.value = false;
});
</script>
