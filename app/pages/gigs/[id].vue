<template>
  <div class="container mx-auto p-4 min-h-screen">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <span class="loading loading-spinner loading-lg text-primary" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error">
      <Icon name="mdi:alert-circle" class="w-6 h-6" />
      <span>{{ error }}</span>
      <NuxtLink to="/gigs" class="btn btn-sm btn-ghost">Back to Gigs</NuxtLink>
    </div>

    <!-- Content -->
    <div v-else-if="gig" class="grid gap-6">
      
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
                    <span class="text-2xl text-gray-500 font-normal">at {{ gig.venueName }}</span>
                </h1>
                <div class="text-lg text-gray-500 mt-1 flex items-center gap-2">
                     <Icon name="mdi:calendar" class="w-5 h-5" />
                     {{ formatDate(gig.date) }}
                     <span v-if="gig.ticketCost" class="badge badge-neutral ml-2">
                        {{ formatCurrency(gig.ticketCost) }}
                     </span>
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
                    <figure><img :src="getImageUrl(gig.imageUrl)" alt="Gig Image" class="w-full object-cover max-h-[400px]" /></figure>
                </div>
            </div>

            <!-- Right Column: Map & Info (Takes 1 column) -->
            <div class="space-y-6">
                 <div class="h-[400px]">
                    <GigMap :venue-name="gig.venueName" :city="gigVenue?.city" />
                 </div>
                 
                 <div class="card bg-base-100 shadow-xl">
                    <div class="card-body">
                        <h2 class="card-title text-lg mb-2">Details</h2>
                        <ul class="space-y-2">
                            <li class="flex justify-between">
                                <span class="text-gray-500">Venue</span>
                                <span class="font-medium">{{ gig.venueName }}</span>
                            </li>
                             <li class="flex justify-between" v-if="gigVenue">
                                <span class="text-gray-500">City</span>
                                <span class="font-medium">{{ gigVenue.city }}</span>
                            </li>
                             <li class="flex justify-between" v-if="gig.ticketType">
                                <span class="text-gray-500">Ticket Type</span>
                                <span class="font-medium">{{ gig.ticketType }}</span>
                            </li>
                        </ul>
                    </div>
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
const error = ref<string | null>(null);
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
    try {
        // Ensure we have artists and venues loaded for lookups
        if (gigStore.venues.length === 0) await gigStore.fetchVenues();
        
        // Fetch the gig
        const fetchedGig = await gigStore.fetchGig(gigId);
        // Ensure type compatibility explicitly if needed, or just assign
        gig.value = fetchedGig || null;

    } catch (e: any) {
        error.value = "Failed to load gig details.";
        // eslint-disable-next-line no-console
        console.error(e);
    } finally {
        loading.value = false;
    }
});
</script>
