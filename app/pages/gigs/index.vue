<template>
  <div class="container mx-auto p-4 min-h-screen">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-bold text-primary">Gigs</h1>
      <div class="flex gap-2 items-center">
         <ViewToggle v-model="viewMode" class="mr-2" />
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
      </div>
    </div>
    
    <div v-if="gigStore.loading" class="flex justify-center items-center h-64">
      <span class="loading loading-spinner loading-lg text-primary"/>
    </div>

    <div v-else-if="gigStore.error" class="alert alert-error">
      <Icon name="mdi:alert-circle" class="w-6 h-6" />
      <span>{{ gigStore.error }}</span>
    </div>

    <div v-else-if="gigStore.gigs.length === 0" class="text-center text-lg text-gray-500">
      No gigs found at the moment. Check back later!
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
import { ref, computed } from 'vue';
import { orderBy } from 'lodash-es';
import { useGigStore } from '~/store/GigStore';
import { usePreferencesStore } from '~/store/PreferencesStore';
import { ViewMode } from '~/types/ViewMode';
import GigCard from '~/components/gigs/GigCard.vue';
import GigTableView from '~/components/gigs/GigTableView.vue';
import ImportGigsModal from '~/components/gigs/ImportGigsModal.vue';
import ImportCalendarModal from '~/components/gigs/ImportCalendarModal.vue';
import ViewToggle from '~/components/ui/button/ViewToggle.vue';

const gigStore = useGigStore();
const preferencesStore = usePreferencesStore();
const showImportModal = ref(false);
const showCalendarModal = ref(false);
const sortColumn = ref<string | null>('date');
const sortDirection = ref<'asc' | 'desc'>('desc');

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
    const list = gigStore.gigs || [];
    if (!sortColumn.value) return list;

    return orderBy(
        list,
        [(g) => {
             if (sortColumn.value === 'date') return new Date(g.date || 0).getTime();
             if (sortColumn.value === 'headliner') return g.acts?.find(a => a.isHeadliner)?.name || '';
             if (sortColumn.value === 'venue') return g.venueName || '';
             if (sortColumn.value === 'cost') return g.ticketCost || 0;
             return '';
        }],
        [sortDirection.value]
    );
});

function handleSort(column: string) {
    if (sortColumn.value === column) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn.value = column;
        sortDirection.value = 'asc';
    }
}

const handleImportSuccess = () => {
    showImportModal.value = false;
    gigStore.fetchGigs();
};

const handleCalendarImportSuccess = () => {
    showCalendarModal.value = false;
    gigStore.fetchGigs();
};

// Fetch gigs on mount
onMounted(() => {
    gigStore.fetchGigs();
});
</script>
