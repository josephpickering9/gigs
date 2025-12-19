<template>
  <div class="container mx-auto p-4 min-h-screen">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-bold text-primary">Upcoming Gigs</h1>
      <div class="flex gap-2">
         <NuxtLink to="/gigs/create" class="btn btn-primary">
            <Icon name="mdi:plus" class="w-5 h-5 mr-2" />
            Create Gig
        </NuxtLink>
        <button class="btn btn-secondary" @click="showImportModal = true">
            <Icon name="mdi:file-upload" class="w-5 h-5 mr-2" />
            Import CSV
        </button>
      </div>
    </div>
    
    <div v-if="gigStore.loading" class="flex justify-center items-center h-64">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else-if="gigStore.error" class="alert alert-error">
      <Icon name="mdi:alert-circle" class="w-6 h-6" />
      <span>{{ gigStore.error }}</span>
    </div>

    <div v-else-if="gigStore.gigs.length === 0" class="text-center text-lg text-gray-500">
      No gigs found at the moment. Check back later!
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <GigCard 
        v-for="gig in gigStore.gigs" 
        :key="gig.id" 
        :gig="gig" 
      />
    </div>

    <ImportGigsModal 
      v-if="showImportModal" 
      @close="showImportModal = false"
      @success="handleImportSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useGigStore } from '~/store/GigStore';
import GigCard from '~/components/gigs/GigCard.vue';
import ImportGigsModal from '~/components/gigs/ImportGigsModal.vue';

const gigStore = useGigStore();
const showImportModal = ref(false);

useHead({
  title: 'Gigs - Upcoming Events',
  meta: [
    { name: 'description', content: 'Check out our upcoming gigs and events.' }
  ]
});

const handleImportSuccess = () => {
    // Optionally show a toast notification here
    showImportModal.value = false;
};

// Fetch gigs on mount
onMounted(() => {
    gigStore.fetchGigs();
});
</script>
