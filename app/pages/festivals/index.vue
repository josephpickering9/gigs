<template>
  <div class="container mx-auto p-4 min-h-screen">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-bold text-primary">Festivals</h1>
    </div>

    <div v-if="gigStore.loadingFestivals && gigStore.festivals.length === 0" class="flex justify-center items-center h-64">
      <span class="loading loading-spinner loading-lg text-primary"/>
    </div>

    <div v-else-if="gigStore.festivals.length === 0" class="text-center text-lg text-gray-500">
      No festivals found.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <FestivalCard
        v-for="festival in gigStore.festivals"
        :key="festival.id"
        :festival="festival"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useGigStore } from '~/store/GigStore';
import FestivalCard from '~/components/gigs/FestivalCard.vue';

const gigStore = useGigStore();

useHead({
  title: 'Festivals - Gigs',
  meta: [
    { name: 'description', content: 'Festivals I have attended.' }
  ]
});

onMounted(() => {
    gigStore.fetchFestivals();
});
</script>
