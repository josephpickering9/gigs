<template>
  <div class="min-h-screen bg-base-200 mx-auto">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-screen">
      <span class="loading loading-spinner loading-lg text-primary" />
    </div>

    <!-- Error State -->
    <div v-else-if="!gig" class="container mx-auto p-4 pt-12">
        <div class="alert alert-error shadow-lg">
            <Icon name="mdi:alert-circle" class="w-6 h-6" />
            <span>Gig not found</span>
            <NuxtLink to="/gigs" class="btn btn-sm btn-ghost">Go Back</NuxtLink>
        </div>
    </div>

    <template v-else>
        <!-- Hero Section -->
        <div class="relative w-full h-[60vh] min-h-[400px] flex items-center justify-center text-white overflow-hidden group">
            <!-- Background Image -->
            <div 
                class="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] ease-out select-none"
                :class="{ 'scale-105': !loading }"
                :style="`background-image: url('${getImageUrl(heroImage)}');`"
            />
            
            <!-- Gradient Overlays -->
            <div class="absolute inset-0 bg-gradient-to-t from-base-200 via-base-900/60 to-base-900/40" />
            <div class="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

            <!-- Navigation Buttons (Absolute) -->
            <div class="absolute top-4 left-4 z-20">
                <NuxtLink 
                    to="/gigs"
                    class="btn btn-circle btn-ghost text-white bg-white/10 hover:bg-white/20 border-none backdrop-blur-md" 
                >
                    <Icon name="mdi:arrow-left" class="w-6 h-6" />
                </NuxtLink>
            </div>
            
            <div v-if="isAuthenticated" class="absolute top-4 right-4 z-20">
                 <NuxtLink 
                    :to="`/gigs/edit/${gigId}`" 
                    class="btn btn-ghost text-white bg-white/10 hover:bg-white/20 border-none backdrop-blur-md gap-2"
                >
                    <Icon name="mdi:pencil" class="w-5 h-5" />
                    <span class="hidden sm:inline">Edit Gig</span>
                 </NuxtLink>
            </div>

            <!-- Hero Content -->
            <div class="relative z-10 text-center px-4 max-w-4xl mx-auto transform transition-all duration-700 translate-y-0 opacity-100">
                <!-- Headliner -->
                <h1 class="text-5xl md:text-7xl font-bold mb-4 tracking-tight drop-shadow-lg">
                    <span v-if="headliner">{{ headliner.name }}</span>
                    <span v-else class="text-white/50">Unknown Artist</span>
                </h1>
                
                <!-- Support Acts -->
                <div v-if="supportActs.length > 0" class="flex flex-wrap justify-center gap-3 mb-8">
                    <span class="text-lg font-light text-white/80 uppercase tracking-widest border-r border-white/30 pr-3 mr-1">Support</span>
                    <span 
                        v-for="act in supportActs" 
                        :key="act.artistId" 
                        class="text-xl md:text-2xl font-medium text-white/90 drop-shadow-md"
                    >
                        {{ act.name }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Content Container -->
        <div class="w-full max-w-6xl mx-auto px-0 md:px-4 -mt-20 relative z-20 pb-20">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <!-- Main Content (Setlist) -->
                <div class="lg:col-span-2 space-y-8 animate-slide-up order-2 lg:order-1">
                    <GigSetlist :gig="gig" class="rounded-none sm:rounded-2xl shadow-sm sm:shadow-xl border-x-0 sm:border card-compact sm:card-normal" />
                </div>

                <!-- Sidebar -->
                <div class="lg:col-span-1 space-y-6 animate-slide-up order-1 lg:order-2" style="animation-delay: 100ms;">
                    
                    <!-- Info Card -->
                    <div class="card bg-base-100 shadow-sm sm:shadow-xl border-y border-base-content/5 sm:border sm:rounded-2xl rounded-none sticky top-0 sm:top-6 z-30 sm:z-10">
                        <div class="card-body p-4 sm:p-6">
                            <h3 class="card-title text-lg mb-4 flex items-center justify-between">
                                <span class="flex items-center gap-2">
                                    <Icon name="mdi:information-slab-circle" class="w-6 h-6 text-primary" />
                                    Gig Info
                                </span>
                                <!-- Mobile Collapse/Expand could go here if needed, keeping it simple for now -->
                            </h3>
                            
                            <div class="space-y-4">
                                <!-- Date -->
                                <div class="flex items-center gap-4 p-3 rounded-xl hover:bg-base-200/50 transition-colors">
                                    <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <Icon name="mdi:calendar" class="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div class="text-xs font-bold text-base-content/50 uppercase tracking-wide">Date</div>
                                        <div class="font-medium text-base-content">{{ formatDate(gig.date) }}</div>
                                    </div>
                                </div>

                                <!-- Venue -->
                                <div class="flex items-center gap-4 p-3 rounded-xl hover:bg-base-200/50 transition-colors">
                                    <div class="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                                        <Icon name="mdi:map-marker" class="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div class="text-xs font-bold text-base-content/50 uppercase tracking-wide">Location</div>
                                        <div class="font-bold text-primary">{{ gig.venueName }}</div>
                                        <div v-if="gigVenue" class="text-sm text-base-content/70">{{ gigVenue.city }}</div>
                                    </div>
                                </div>

                                <!-- Ticket Type/Price -->
                                <div v-if="gig.ticketType || gig.ticketCost" class="flex items-center gap-4 p-3 rounded-xl hover:bg-base-200/50 transition-colors">
                                    <div class="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success shrink-0">
                                        <Icon name="mdi:ticket" class="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div class="text-xs font-bold text-base-content/50 uppercase tracking-wide">Ticket</div>
                                        <div class="flex flex-wrap gap-2 items-center">
                                            <span v-if="gig.ticketType" class="badge badge-outline text-xs">{{ gig.ticketType }}</span>
                                            <span v-if="gig.ticketCost" class="font-bold font-mono">{{ formatCurrency(gig.ticketCost) }}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Attendees -->
                                <div v-if="gig.attendees && gig.attendees.length > 0" class="pt-4 mt-2 border-t border-base-content/10">
                                    <div class="text-xs font-bold text-base-content/50 uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <Icon name="mdi:account-group" class="w-4 h-4" />
                                        Attendees <span class="badge badge-ghost badge-sm text-xs">{{ gig.attendees.length }}</span>
                                    </div>
                                    <div class="flex flex-wrap gap-2">
                                        <span 
                                            v-for="attendee in gig.attendees" 
                                            :key="attendee.personId" 
                                            class="badge badge-secondary badge-md pl-1 pr-3 gap-2"
                                        >
                                            <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                                                {{ attendee.personName.charAt(0) }}
                                            </div>
                                            {{ attendee.personName }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Map Card -->
                    <div class="card bg-base-100 shadow-sm sm:shadow-xl border-y border-base-content/5 sm:border sm:rounded-2xl rounded-none overflow-hidden h-[350px] sticky top-[400px]">
                        <GigMap :venue-name="gig.venueName" :city="gigVenue?.city" />
                    </div>
                </div>
            </div>
        </div>
    </template>
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
import { getApiGigsById } from '~~/api';
import { getImageUrl } from '~/utils/image-helper';

const { isAuthenticated } = useAuth();

const route = useRoute();
const gigStore = useGigStore();
const gigId = route.params['id'] as string;

// Local state for fetching if not in store
const loading = ref(true);
const gig = ref<GetGigResponse | null>(null);

useHead({
  title: () => gig.value && headliner.value ? `${headliner.value.name} - Gigs` : 'Gig Details - Gigs',
});

// Helper to find headliner
const headliner = computed(() => {
    return gig.value?.acts?.find(a => a.isHeadliner);
});

const supportActs = computed(() => {
    return gig.value?.acts?.filter(a => !a.isHeadliner) || [];
});

const gigVenue = computed(() => {
    if (!gig.value?.venueId) return null;
    return gigStore.venues.find(v => v.id === gig.value?.venueId);
});

// Hero image logic: User Gig Image > Headliner Artist Image > Fallback
const heroImage = computed(() => {
    if (gig.value?.imageUrl) return gig.value.imageUrl;
    if (headliner.value?.imageUrl) return headliner.value.imageUrl;
    return '';
});

const formatDate = (dateString?: string) => {
    if (!dateString) return 'TBA';
    try {
        return format(new Date(dateString), 'EEEE, d MMMM yyyy'); 
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
        // Ensure we have venues loaded for lookups
        if (gigStore.venues.length === 0) await gigStore.fetchVenues();
        
        // Always fetch fresh gig data from API to ensure we have complete setlist information
        const response = await getApiGigsById({ path: { id: gigId } });
        gig.value = response.data || null;
    } catch (error) {
        console.error('Failed to fetch gig:', error);
        gig.value = null;
    } finally {
        loading.value = false;
    }
});
</script>

<style scoped>
.animate-slide-up {
    animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    opacity: 0;
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
