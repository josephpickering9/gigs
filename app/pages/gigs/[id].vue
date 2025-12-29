<template>
  <div class="container mx-auto p-4 min-h-screen">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <span class="loading loading-spinner loading-lg text-primary" />
    </div>

    <!-- Content -->
    <div v-if="gig" class="grid gap-6">
            <!-- Header Section -->
       <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
            <div>
                <NuxtLink to="/gigs" class="btn btn-ghost btn-sm mb-2 pl-0 gap-1 text-gray-500 hover:text-primary">
                    <Icon name="mdi:arrow-left" class="w-4 h-4" />
                    Back to Gigs
                </NuxtLink>
                <h1 class="text-4xl font-bold flex flex-wrap gap-2 items-center">
                    <span v-if="headliner">{{ headliner.name }}</span>
                    <span v-else class="text-gray-400">Unknown Artist</span>
                </h1>
                <div class="text-lg text-gray-500 mt-2 flex flex-wrap items-center gap-4">
                     <div class="flex items-center gap-1">
                        <Icon name="mdi:calendar" class="w-5 h-5" />
                        {{ formatDate(gig.date) }}
                     </div>
                     
                     <div class="flex items-center gap-1">
                        <Icon name="mdi:map-marker" class="w-5 h-5" />
                        <span class="font-bold text-primary">{{ gig.venueName }}</span>
                        <span v-if="gigVenue">, {{ gigVenue.city }}</span>
                     </div>

                     <div v-if="gig.ticketType" class="badge badge-outline">
                        {{ gig.ticketType }}
                     </div>

                     <div v-if="gig.ticketCost" class="badge badge-neutral">
                        {{ formatCurrency(gig.ticketCost) }}
                     </div>
                     
                     <div v-if="gig.attendees && gig.attendees.length > 0" class="flex items-center gap-2">
                        <Icon name="mdi:account-multiple" class="w-4 h-4" />
                        <div class="flex flex-wrap gap-1">
                            <span 
                                v-for="attendee in gig.attendees" 
                                :key="attendee.personId" 
                                class="badge badge-secondary badge-sm"
                            >
                                {{ attendee.personName }}
                            </span>
                        </div>
                     </div>
                </div>
            </div>

            <div class="flex gap-2">
                <NuxtLink v-if="isAuthenticated" :to="`/gigs/edit/${gig.id}`" class="btn btn-primary">
                    <Icon name="mdi:pencil" class="w-5 h-5 mr-2" />
                    Edit Gig
                </NuxtLink>
            </div>
       </div>

       <!-- Main Content Grid -->
       <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Left Column: Setlist (Takes 2 columns on large screens) -->
            <div class="lg:col-span-2 space-y-6">
                <GigSetlist :gig="gig" />
                
                <!-- Additional Details / Images could go here later -->
                <div v-if="gig.imageUrl" class="card bg-base-100 shadow-xl overflow-hidden">
                    <figure><img :src="getImageUrl(gig.imageUrl)" alt="Gig Image" class="w-full object-cover object-top max-h-[500px]" ></figure>
                </div>
            </div>

            <!-- Right Column: Map (Takes 1 column) -->
            <div class="space-y-6">
                 <div class="h-[400px]">
                    <GigMap :venue-name="gig.venueName" :city="gigVenue?.city" />
                 </div>
            </div>
       </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useGigStore } from '~/store/GigStore';
import { format } from 'date-fns';
import useAuth from '~/composables/useAuth';
import GigSetlist from '~/components/gigs/GigSetlist.vue';
import GigMap from '~/components/gigs/GigMap.vue';
import type { GetGigResponse } from '~~/api';

const { isAuthenticated } = useAuth();

const route = useRoute();
const gigStore = useGigStore();
const gigId = route.params['id'] as string; // Fix lint: access via index

// Local state for fetching if not in store
const loading = ref(true);
const gig = ref<GetGigResponse | null>(null);

// Helper to find headliner
const headliner = computed(() => {
    return gig.value?.acts?.find(a => a.isHeadliner);
});

const gigVenue = computed(() => {
    if (!gig.value?.venueId) return null;
    return gigStore.venues.find(v => v.id === gig.value?.venueId);
});

const formatDate = (dateString?: string) => {
    if (!dateString) return 'TBA';
    try {
        return format(new Date(dateString), 'dd MMM yyyy'); 
    } catch {
        return dateString;
    }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);
};

onMounted(async () => {
    loading.value = true;
    // Ensure we have venues loaded for lookups
    if (gigStore.venues.length === 0) await gigStore.fetchVenues();
    
    // Fetch the gig
    const fetchedGig = await gigStore.fetchGig(gigId);
    gig.value = fetchedGig || null;
    
    loading.value = false;
});
</script>
