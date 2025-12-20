<template>
  <div class="container mx-auto p-4 min-h-screen">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-bold text-primary">Gigs</h1>
      <div class="flex gap-2 items-center">
         <FilterBar v-model:filters="activeFilters" class="mr-2" />
         <ViewToggle v-model="viewMode" class="mr-2" />
        <template v-if="isAuthenticated">
          <NuxtLink to="/gigs/create" class="btn btn-primary">
              <Icon name="mdi:plus" class="w-5 h-5 mr-2" />
              Create Gig
          </NuxtLink>
          <button class="btn btn-secondary" @click="showImportModal = true">
              <Icon name="mdi:file-upload" class="w-5 h-5 mr-2" />
              Import CSV
          </button>
          <button class="btn btn-accent" @click="showCalendarModal = true">
              <Icon name="mdi:calendar-import" class="w-5 h-5 mr-2" />
              Sync Calendar
          </button>
        </template>
      </div>
    </div>
    


    <div v-if="gigStore.loading && gigStore.gigs.length === 0" class="flex justify-center items-center h-64">
      <span class="loading loading-spinner loading-lg text-primary"/>
    </div>

    <div v-else-if="gigStore.error" class="alert alert-error">
      <Icon name="mdi:alert-circle" class="w-6 h-6" />
      <span>{{ gigStore.error }}</span>
    </div>

    <div v-else-if="gigStore.gigs.length === 0" class="text-center text-lg text-gray-500">
      No gigs found matching your criteria.
    </div>

    <div v-else-if="viewMode === ViewMode.TABLE">
      <GigTableView
        :gigs="sortedGigs"
        :sort-column="sortColumn"
        :sort-direction="sortDirection"
        @sort="handleSort"
      />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <GigCard
        v-for="gig in sortedGigs"
        :key="gig.id"
        :gig="gig"
      />
    </div>

    <!-- Infinite Scroll Sentinel -->
    <div ref="loadMoreTrigger" class="h-10 flex justify-center items-center mt-4">
      <span v-if="gigStore.loading" class="loading loading-dots loading-md text-primary"></span>
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
import type { Filter } from '~/types/Filter';
import { FilterType } from '~/types/FilterType';

const { isAuthenticated } = useAuth();

const gigStore = useGigStore();
const preferencesStore = usePreferencesStore();
const showImportModal = ref(false);
const showCalendarModal = ref(false);
const sortColumn = ref<string | null>('date');
const sortDirection = ref<'asc' | 'desc'>('desc');
const loadMoreTrigger = ref<HTMLElement | null>(null);

const activeFilters = ref<Filter[]>([]);

useHead({
  title: 'Gigs',
  meta: [
    { name: 'description', content: 'Gigs I have been to.' }
  ]
});

const viewMode = computed({
  get: () => preferencesStore.gigsViewMode,
  set: (value: ViewMode) => preferencesStore.setGigsViewMode(value),
});

const sortedGigs = computed(() => {
    // Rely on server-side sorting
    return gigStore.gigs || [];
});

// Sync filters from UI to Store
watch(activeFilters, (filters) => {
    const storeFilters: any = {};
    
    filters.forEach(f => {
        if (f.type === FilterType.VENUE) storeFilters.venueId = f.value;
        if (f.type === FilterType.ARTIST) storeFilters.artistId = f.value;
        if (f.type === FilterType.CITY) storeFilters.city = f.value;
        if (f.type === FilterType.SEARCH) storeFilters.search = f.value;
    });

    storeFilters.sortBy = sortColumn.value || undefined;
    storeFilters.sortDirection = sortDirection.value;

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
        sortDirection: sortDirection.value 
    });
}

const handleImportSuccess = () => {
    showImportModal.value = false;
    gigStore.fetchGigs({ page: 1 });
};

const handleCalendarImportSuccess = () => {
    showCalendarModal.value = false;
    gigStore.fetchGigs({ page: 1 });
};

// Infinite Scroll
useIntersectionObserver(
  loadMoreTrigger,
  ([{ isIntersecting }]) => {
    if (isIntersecting && !gigStore.loading && gigStore.pagination.page < gigStore.pagination.totalPages) {
      gigStore.loadMoreGigs();
    }
  },
);

// Fetch gigs on mount
onMounted(() => {
    // Initial fetch
    gigStore.fetchGigs({ page: 1 });
});
</script>
