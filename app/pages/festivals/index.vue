<template>
  <div class="container mx-auto px-6 py-8 min-h-screen">
    <div class="flex justify-between items-center mb-10">
      <h1 class="text-4xl font-bold text-primary">Festivals</h1>
      <NuxtLink v-if="isAuthenticated" to="/festivals/create" class="btn btn-primary">
          <Icon name="mdi:plus" class="w-5 h-5 mr-2" />
          Create Festival
      </NuxtLink>
    </div>

    <div v-if="gigStore.loadingFestivals && gigStore.festivals.length === 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       <FestivalCardSkeleton v-for="n in 6" :key="n" />
    </div>

    <div v-else-if="gigStore.festivals.length === 0" class="text-center text-lg text-gray-500">
      No festivals found.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink 
        v-for="festival in gigStore.festivals"
        :key="festival.id"
        :to="`/festivals/${festival.id}`"
        class="block h-full"
      >
        <FestivalCard :festival="festival" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useGigStore } from '~/store/GigStore';
import useAuth from '~/composables/useAuth';
import FestivalCard from '~/components/festivals/FestivalCard.vue';
import FestivalCardSkeleton from '~/components/festivals/FestivalCardSkeleton.vue';

const gigStore = useGigStore();
const { isAuthenticated } = useAuth();

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
