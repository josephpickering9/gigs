<template>
  <div class="container mx-auto p-4 min-h-screen">
    <div class="flex flex-col gap-4 mb-4">
      <div class="flex flex-row justify-between items-center">
        <h1 class="text-3xl md:text-4xl font-bold text-primary">Gigs</h1>
        <div class="flex gap-2 items-center">
            <!-- Desktop Filter Bar Position -->
            <div class="hidden md:block">
              <FilterBar v-model:filters="activeFilters" />
            </div>

            <ViewToggle v-if="!isMobile" v-model="viewMode" />
             <template v-if="isAuthenticated">
               <div class="dropdown dropdown-bottom dropdown-end">
                 <div tabindex="0" role="button" class="btn btn-ghost btn-square">
                     <Icon name="heroicons:ellipsis-vertical" size="1.5em" />
                 </div>
                 <ul tabindex="0" class="dropdown-content z-[60] menu p-2 shadow-xl bg-base-100 rounded-box w-52 border border-base-content/10">
                     <li>
                       <button @click="navigateToCreate" class="flex gap-2 items-center w-full text-left">
                           <Icon name="mdi:plus" class="w-5 h-5" />
                           Create Gig
                       </button>
                     </li>
                     <li>
                         <button @click="openImportModal" class="flex gap-2 items-center w-full text-left">
                             <Icon name="mdi:file-upload" class="w-5 h-5" />
                             Import CSV
                         </button>
                     </li>
                     <li>
                         <button @click="openCalendarModal" class="flex gap-2 items-center w-full text-left">
                             <Icon name="mdi:calendar-import" class="w-5 h-5" />
                             Sync Calendar
                         </button>
                     </li>
                 </ul>
               </div>
             </template>
        </div>
      </div>
      
      <!-- Sticky Filter Bar (Mobile Only) -->
      <div class="md:hidden sticky top-0 z-40 bg-base-100/95 backdrop-blur-sm -mx-4 px-4 py-2 border-b border-base-content/5 mb-4 shadow-sm transition-all duration-200">
         <FilterBar v-model:filters="activeFilters" />
      </div>
    </div>
    


    <!-- Skeleton Loading State -->
    <div v-if="gigStore.loading && gigStore.gigs.length === 0">
      <!-- Table View Skeleton -->
      <div v-if="viewMode === ViewMode.TABLE" class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Artist</th>
              <th>Venue</th>
              <th>Festival</th>
              <th>City</th>
              <th>Date</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in 8" :key="i">
              <td><div class="skeleton h-4 w-32"/></td>
              <td><div class="skeleton h-4 w-24"/></td>
              <td><div class="skeleton h-4 w-20"/></td>
              <td><div class="skeleton h-4 w-20"/></td>
              <td><div class="skeleton h-4 w-24"/></td>
              <td><div class="skeleton h-4 w-16"/></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Card View Skeleton -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="card bg-base-100 shadow-xl">
          <div class="skeleton h-48 w-full"/>
          <div class="card-body">
            <div class="skeleton h-6 w-3/4 mb-2"/>
            <div class="skeleton h-4 w-1/2 mb-2"/>
            <div class="skeleton h-4 w-2/3"/>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="gigStore.error" class="alert alert-error">
      <Icon name="mdi:alert-circle" class="w-6 h-6" />
      <span>{{ gigStore.error }}</span>
    </div>

    <div v-else-if="gigStore.gigs.length === 0" class="text-center text-lg text-gray-500">
      No gigs found matching your criteria.
    </div>

    <div v-else>
      <!-- Upcoming Gigs Section -->
      <section v-if="upcomingGigs.length > 0" class="mb-12">
        <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
          <Icon name="mdi:calendar-clock" class="text-primary" />
          Upcoming Gigs
        </h2>
        
        <div v-if="viewMode === ViewMode.TABLE">
          <GigTableView
            :gigs="upcomingGigs"
            :sort-column="sortColumn"
            :sort-direction="sortDirection"
            @sort="handleSort"
          />
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GigCard
            v-for="gig in upcomingGigs"
            :key="gig.id"
            :gig="gig"
          />
        </div>
      </section>

      <!-- Past Gigs Section -->
      <section v-if="pastGigs.length > 0">
        <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
          <Icon name="mdi:history" class="text-secondary" />
          Past Gigs
        </h2>

        <div v-if="viewMode === ViewMode.TABLE">
          <GigTableView
            :gigs="pastGigs"
            :sort-column="sortColumn"
            :sort-direction="sortDirection"
            @sort="handleSort"
          />
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GigCard
            v-for="gig in pastGigs"
            :key="gig.id"
            :gig="gig"
          />
        </div>
      </section>
    </div>

    <!-- Infinite Scroll Sentinel -->
    <div ref="loadMoreTrigger" class="h-10 flex justify-center items-center mt-4">
      <span v-if="gigStore.loading" class="loading loading-dots loading-md text-primary"/>
    </div>

    <ImportGigsModal 
      v-if="showImportModal" 
      @close="showImportModal = false"
      @success="handleImportSuccess"
    />

    <ImportCalendarModal 
      v-if="showCalendarModal" 
      @close="showCalendarModal = false"
      @success="handleCalendarImportSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';
import { useGigStore } from '~/store/GigStore';
import { usePreferencesStore } from '~/store/PreferencesStore';
import { ViewMode } from '~/types/ViewMode';
import GigCard from '~/components/gigs/GigCard.vue';
import GigTableView from '~/components/gigs/GigTableView.vue';
import ImportGigsModal from '~/components/gigs/ImportGigsModal.vue';
import ImportCalendarModal from '~/components/gigs/ImportCalendarModal.vue';
import ViewToggle from '~/components/ui/button/ViewToggle.vue';
import FilterBar from '~/components/filters/FilterBar.vue';
import useAuth from '~/composables/useAuth';
import { useDevice } from '~/composables/useDevice';
import type { Filter } from '~/types/Filter';
import { FilterType } from '~/types/FilterType';
import type { GetGigResponse } from '~~/api';

const { isAuthenticated } = useAuth();
const { isMobile } = useDevice();

const gigStore = useGigStore();
const preferencesStore = usePreferencesStore();
const showImportModal = ref(false);
const showCalendarModal = ref(false);
const sortColumn = ref<string | null>('date');
const sortDirection = ref<'asc' | 'desc'>('desc');
const loadMoreTrigger = ref<HTMLElement | null>(null);

const router = useRouter();
const route = useRoute();

const activeFilters = ref<Filter[]>([]);

useHead({
  title: 'Gigs',
  meta: [
    { name: 'description', content: 'Gigs I have been to.' }
  ]
});

const viewMode = computed({
  get: () => {
    // Force card view on mobile
    if (isMobile.value) {
      return ViewMode.CARD;
    }
    return preferencesStore.gigsViewMode;
  },
  set: (value: ViewMode) => {
    // Only update preference if not on mobile
    if (!isMobile.value) {
      preferencesStore.setGigsViewMode(value);
    }
  },
});

const sortedGigs = computed(() => {
    // Rely on server-side sorting
    return gigStore.gigs || [];
});

const upcomingGigs = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sortedGigs.value.filter((gig: GetGigResponse) => {
        if (!gig.date) return false;
        const gigDate = new Date(gig.date);
        return gigDate >= today;
    });
});

const pastGigs = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sortedGigs.value.filter((gig: GetGigResponse) => {
        if (!gig.date) return true; // Treat no date as past or handle elsewhere, usually implies old/imcomplete
        const gigDate = new Date(gig.date);
        return gigDate < today;
    });
});

// Sync filters from UI to Store and URL
watch(activeFilters, (filters) => {
    const storeFilters: any = {};
    const query: any = {};
    
    filters.forEach(f => {
        if (f.type === FilterType.VENUE) {
            storeFilters.venueId = f.value;
            query.venueId = f.value;
        }
        if (f.type === FilterType.ARTIST) {
            storeFilters.artistId = f.value;
            query.artistId = f.value;
        }
        if (f.type === FilterType.CITY) {
            storeFilters.city = f.value;
            query.city = f.value;
        }
        if (f.type === FilterType.ATTENDEE) {
            storeFilters.attendeeId = f.value;
            query.attendeeId = f.value;
        }
        if (f.type === FilterType.SEARCH) {
            storeFilters.search = f.value;
            query.search = f.value;
        }
    });

    storeFilters.sortBy = sortColumn.value || undefined;
    storeFilters.sortDirection = sortDirection.value;

    // Update URL without reloading
    router.replace({ query: { ...query } });

    gigStore.setFilters(storeFilters);
}, { deep: true });


function handleSort(column: string) {
    if (sortColumn.value === column) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn.value = column;
        sortDirection.value = 'asc';
    }
    
    // Fetch with new sort (reset to page 1)
    gigStore.fetchGigs({ 
        page: 1,
        sortBy: column, 
        sortDirection: sortDirection.value,
        ...gigStore.filters // Keep existing filters
    });
}

const handleImportSuccess = () => {
    showImportModal.value = false;
    gigStore.fetchGigs({ page: 1 });
};

const navigateToCreate = async () => {
    closeDropdown();
    await router.push('/gigs/create');
};

const openImportModal = () => {
    closeDropdown();
    showImportModal.value = true;
};

const openCalendarModal = () => {
    closeDropdown();
    showCalendarModal.value = true;
};

const closeDropdown = () => {
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
};

const handleCalendarImportSuccess = () => {
    showCalendarModal.value = false;
    gigStore.fetchGigs({ page: 1 });
};

// Infinite Scroll
useIntersectionObserver(
  loadMoreTrigger,
  (entries) => {
    const isIntersecting = entries[0]?.isIntersecting;
    if (isIntersecting && !gigStore.loading && gigStore.pagination.page < gigStore.pagination.totalPages) {
      gigStore.loadMoreGigs();
    }
  },
);

// Fetch gigs on mount
onMounted(async () => {
    const query = route.query;
    const newFilters: Filter[] = [];

    if (query['search']) {
        newFilters.push({ type: FilterType.SEARCH, value: query['search'] as string, label: 'Search' });
    }
    
    if (query['city']) {
        newFilters.push({ type: FilterType.CITY, value: query['city'] as string, label: 'City', displayValue: query['city'] as string });
    }

    if (query['venueId']) {
        if (!gigStore.venues.length) await gigStore.fetchVenues();
        const venue = gigStore.venues.find(v => v.id === query['venueId']);
        if (venue) {
            newFilters.push({ type: FilterType.VENUE, value: query['venueId'] as string, label: 'Venue', displayValue: venue.name });
        }
    }

    if (query['artistId']) {
        if (!gigStore.artists.length) await gigStore.fetchArtists();
        const artist = gigStore.artists.find(a => a.id === query['artistId']);
        if (artist) {
             newFilters.push({ type: FilterType.ARTIST, value: query['artistId'] as string, label: 'Artist', displayValue: artist.name });
        }
    }

    if (query['attendeeId']) {
        if (!gigStore.attendees.length) await gigStore.fetchAttendees();
        const attendee = gigStore.attendees.find(a => a.id === query['attendeeId']);
        if (attendee) {
             newFilters.push({ type: FilterType.ATTENDEE, value: query['attendeeId'] as string, label: 'Attendee', displayValue: attendee.name });
        }
    }

    if (newFilters.length > 0) {
        activeFilters.value = newFilters;
    } else {
        // Initial fetch if no filters (if filters exist, watcher will trigger fetch via setFilters)
        gigStore.fetchGigs({ page: 1 });
    }
});
</script>
