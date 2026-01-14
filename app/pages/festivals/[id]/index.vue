<template>
  <div class="min-h-screen bg-base-200 w-full md:mx-auto">
    <!-- Loading State -->
    <FestivalLoadingSkeleton v-if="loading" />

    <!-- Error State -->
    <div v-else-if="!festival" class="container mx-auto p-4 pt-12">
        <div class="alert alert-error shadow-lg">
            <Icon name="mdi:alert-circle" class="w-6 h-6" />
            <span>Festival not found</span>
            <button class="btn btn-sm btn-ghost" @click="router.back()">Go Back</button>
        </div>
    </div>

    <template v-else>
        <!-- Hero Section -->
        <div class="relative w-full h-[60vh] min-h-[400px] flex items-center justify-center text-white overflow-hidden group">
            <!-- Background Image -->
            <div 
                class="absolute inset-0 bg-cover transition-transform duration-[10s] ease-out select-none"
                :class="{ 'scale-105': !loading }"
                :style="`background-image: url('${getImageUrl(festival.imageUrl || '')}');`"
            />
            
            <!-- Gradient Overlays -->
            <div class="absolute inset-0 bg-gradient-to-t from-base-200 via-base-900/60 to-base-900/40" />
            <div class="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />

            <!-- Navigation Buttons (Absolute) -->
            <div class="absolute top-4 left-4 z-20">
                <button 
                    class="btn btn-circle btn-ghost text-white bg-white/10 hover:bg-white/20 border-none backdrop-blur-md" 
                    @click="router.back()"
                >
                    <Icon name="mdi:arrow-left" class="w-6 h-6" />
                </button>
            </div>
            
            <div v-if="isAuthenticated" class="absolute top-4 right-4 z-20">
                 <NuxtLink 
                    :to="`/festivals/${festivalId}/edit`" 
                    class="btn btn-ghost text-white bg-white/10 hover:bg-white/20 border-none backdrop-blur-md gap-2"
                >
                    <Icon name="mdi:pencil" class="w-5 h-5" />
                    <span class="hidden sm:inline">Edit Festival</span>
                 </NuxtLink>
            </div>

            <!-- Hero Content -->
            <div class="relative z-10 text-center px-4 max-w-4xl mx-auto transform transition-all duration-700 translate-y-0 opacity-100">
                <h1 class="text-5xl md:text-7xl font-bold mb-4 tracking-tight drop-shadow-lg">
                    {{ festival.name }}
                </h1>
                
                <div v-if="festival.year" class="text-2xl md:text-3xl font-light text-white/90 mb-8 tracking-wide drop-shadow-md">
                    {{ festival.year }}
                </div>
            </div>
        </div>

        <!-- Content Container -->
        <div class="w-full max-w-6xl mx-auto px-0 md:px-4 -mt-20 relative z-20 pb-20">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <!-- Main Content (Gig List) -->
                <div class="lg:col-span-2 space-y-8">
                     <!-- Empty State -->
                    <div v-if="!festival.gigs || festival.gigs.length === 0" class="card bg-base-100 shadow-none sm:shadow-xl rounded-none sm:rounded-xl border-y sm:border border-base-content/5 p-12 text-center text-base-content/60">
                         <div class="max-w-md mx-auto">
                            <Icon name="mdi:music-note-off" class="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <h3 class="text-xl font-bold mb-2">No lineup announced yet</h3>
                            <p>Check back later for updates or add gigs if you manage this festival.</p>
                         </div>
                    </div>

                    <!-- Groups -->
                    <div v-else class="space-y-8 animate-slide-up">
                         <div 
                            v-for="group in groupedGigs" 
                            :key="group.title + group.dateObj.toString()"
                            class="card bg-base-100 shadow-none sm:shadow-xl rounded-none sm:rounded-xl overflow-hidden border-y sm:border border-base-content/5"
                         >
                            <!-- Date Header -->
                            <div class="bg-base-200/50 p-4 border-b border-base-content/10 sticky top-0 z-10 backdrop-blur-sm flex items-center gap-3">
                                <div class="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center text-primary font-bold shadow-sm">
                                     <span class="text-xs uppercase leading-none">{{ format(group.dateObj, 'MMM') }}</span>
                                     <span class="text-xl leading-none">{{ format(group.dateObj, 'dd') }}</span>
                                </div>
                                <div>
                                    <h3 class="text-xl font-bold text-base-content">{{ group.title }}</h3>
                                     <span class="text-sm text-base-content/60">{{ format(group.dateObj, 'yyyy') }}</span>
                                </div>
                            </div>

                            <!-- Gigs List -->
                            <div class="divide-y divide-base-content/10">
                                <div 
                                    v-for="gig in group.gigs" 
                                    :key="gig.id" 
                                    class="group/gig p-4 md:p-6 hover:bg-base-200/50 transition-all duration-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
                                >
                                    <!-- Lineup Info -->
                                    <div class="flex-grow space-y-2">
                                        <!-- Headliners -->
                                        <div class="flex flex-wrap gap-x-6 gap-y-2 items-center">
                                            <NuxtLink 
                                                v-for="act in (gig.acts || []).filter((a: any) => a.isHeadliner)" 
                                                :key="act.artistId" 
                                                :to="`/gigs/${gig.id}`" 
                                                class="flex items-center gap-3 group/artist hover:opacity-80 transition-opacity"
                                            >
                                                <div class="avatar placeholder">
                                                    <div class="w-10 h-10 rounded-full bg-base-300 ring ring-base-content/10 ring-offset-base-100 ring-offset-2 overflow-hidden">
                                                        <img 
                                                            v-if="act.imageUrl"
                                                            :src="getImageUrl(act.imageUrl)" 
                                                            :alt="act.name" 
                                                            class="object-cover w-full h-full"
                                                        >
                                                        <div v-else class="w-full h-full flex items-center justify-center text-xs font-bold opacity-50">
                                                            {{ (act.name || '?').charAt(0) }}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span class="text-2xl font-black tracking-tight text-base-content group-hover/artist:text-primary transition-colors cursor-pointer">
                                                    {{ act.name }}
                                                </span>
                                            </NuxtLink>
                                        </div>
                                        
                                        <!-- Support Acts -->
                                        <div 
                                            v-if="(gig.acts || []).some((a: any) => !a.isHeadliner)" 
                                            class="text-base font-medium text-base-content/70 flex flex-wrap gap-2 items-center"
                                        >
                                            <span class="text-xs uppercase tracking-wider font-bold text-base-content/40 bg-base-300 px-1.5 py-0.5 rounded">Support</span>
                                            <span>
                                                {{ (gig.acts || []).filter((a: any) => !a.isHeadliner).map((a: any) => a.name).join(', ') }}
                                            </span>
                                        </div>

                                        <!-- Venue Info (Mobile only or redundant?) -> Keeping it subtle -->
                                        <div v-if="gig.venueName && gig.venueName !== mainVenue?.name" class="flex items-center gap-1 text-sm text-base-content/50 mt-1">
                                            <Icon name="mdi:map-marker" class="w-3 h-3" />
                                            <span>{{ gig.venueName }}</span>
                                        </div>
                                    </div>

                                    <!-- Action -->
                                     <div class="hidden sm:block opacity-0 group-hover/gig:opacity-100 transition-opacity transform translate-x-4 group-hover/gig:translate-x-0">
                                        <NuxtLink :to="`/gigs/${gig.id}`" class="btn btn-ghost btn-sm btn-circle">
                                             <Icon name="mdi:chevron-right" class="w-6 h-6" />
                                        </NuxtLink>
                                    </div>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>

                <!-- Sidebar -->
                <div class="lg:col-span-1 space-y-6">
                    <!-- Poster Card -->
                    <div v-if="festival.posterImageUrl" class="card bg-base-100 shadow-none sm:shadow-xl rounded-none sm:rounded-xl border-y sm:border border-base-content/5 overflow-hidden">
                        <img 
                            :src="getImageUrl(festival.posterImageUrl)" 
                            :alt="festival.name + ' Poster'" 
                            class="w-full h-auto object-cover"
                        >
                    </div>

                    <!-- Info Card -->
                    <div class="card bg-base-100 shadow-none sm:shadow-xl rounded-none sm:rounded-xl border-y sm:border border-base-content/5 sticky top-6">
                        <div class="card-body">
                            <div class="space-y-4">
                                <!-- Venue -->
                                <div v-if="venueNames" class="flex items-center gap-3">
                                    <div class="p-2 rounded-lg bg-base-200 text-accent">
                                        <Icon name="mdi:map-marker" class="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div class="font-medium">{{ festival.venueName || venueNames }}</div>
                                    </div>
                                </div>

                                <!-- Date Range -->
                                <div v-if="formattedDateRange" class="flex items-center gap-3">
                                    <div class="p-2 rounded-lg bg-base-200 text-primary">
                                        <Icon name="mdi:calendar-range" class="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div class="font-medium">{{ formattedDateRange }}</div>
                                    </div>
                                </div>

                                <!-- Price -->
                                <div v-if="festival.price" class="flex items-center gap-3">
                                    <div class="p-2 rounded-lg bg-base-200 text-success">
                                        <Icon name="mdi:currency-gbp" class="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div class="font-medium">{{ formatCurrency(festival.price) }}</div>
                                        <div v-if="festival.dailyPrice" class="text-xs opacity-70">
                                            ({{ formatCurrency(festival.dailyPrice) }} / day)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Map Card -->
                    <div v-if="mainVenue" class="card bg-base-100 shadow-none sm:shadow-xl rounded-none sm:rounded-xl border-y sm:border border-base-content/5 overflow-hidden h-[350px] sticky top-6">
                        <GigMap :venue-name="mainVenue.name" :city="mainVenue.city" />
                    </div>
                </div>
            </div>
        </div>
    </template>
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
import GigMap from '~/components/gigs/GigMap.vue';
import FestivalLoadingSkeleton from '~/components/festivals/FestivalLoadingSkeleton.vue';

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

const mainVenue = computed(() => {
    if (!festival.value?.gigs || festival.value.gigs.length === 0) return null;

    // Count venue occurrences
    const venueCounts = festival.value.gigs.reduce((acc: Record<string, number>, gig: GetGigResponse) => {
        if (gig.venueId) {
            acc[gig.venueId] = (acc[gig.venueId] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    // Find venueId with max count
    let maxCount = 0;
    let mainVenueId: string | null = null;
    
    for (const [id, count] of Object.entries(venueCounts)) {
        if ((count as number) > maxCount) {
            maxCount = count as number;
            mainVenueId = id;
        }
    }

    if (!mainVenueId) return null;

    // Find full venue details from store
    const venue = gigStore.venues.find((v: any) => v.id === mainVenueId);
    return venue ? { name: venue.name, city: venue.city } : null;
});

const groupedGigs = computed<GroupedGigSection[]>(() => {
    if (!festival.value?.gigs) return [];

    // Sort gigs by date first
    const sortedGigs = sortBy(festival.value.gigs, (gig: GetGigResponse) => {
        if (!gig.date) return new Date(8640000000000000); // Max date for gigs without dates
        const date = parseISO(gig.date);
        return isValid(date) ? date.getTime() : new Date(8640000000000000).getTime();
    });

    // Group by date key
    const grouped = groupBy(sortedGigs, (gig: GetGigResponse) => {
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
    const venues = new Set(festival.value.gigs.map((g: GetGigResponse) => g.venueName).filter(Boolean));
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
    // Fetch festival and venues in parallel
    const [fetchedFestival] = await Promise.all([
        gigStore.fetchFestival(festivalId),
        gigStore.fetchVenues()
    ]);
    festival.value = fetchedFestival;
    loading.value = false;
});
</script>

<style scoped>
.animate-slide-up {
    animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slide-up {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
