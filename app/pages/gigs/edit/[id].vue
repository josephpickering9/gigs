<template>
  <div class="container mx-auto p-4 max-w-2xl">
    <div class="flex items-center mb-8">
        <button class="btn btn-ghost mr-4" @click="router.back()">
            <Icon name="mdi:arrow-left" class="w-6 h-6" />
        </button>
        <h1 class="text-4xl font-bold text-primary">Edit Gig</h1>
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else-if="gig" class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <GigForm 
                :initial-data="gig"
                :loading="gigStore.saving" 
                submit-label="Update Gig" 
                @submit="handleUpdate" 
                @cancel="router.back()" 
            />
             <div v-if="gigStore.saveError" class="alert alert-error mt-4">
                <Icon name="mdi:alert-circle" class="w-6 h-6" />
                <span>{{ gigStore.saveError }}</span>
            </div>
        </div>
    </div>
    
    <div v-else class="alert alert-warning">
        <span>Gig not found</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGigStore } from '~/store/GigStore';
import GigForm from '~/components/gigs/GigForm.vue';
import type { UpsertGigRequest, GetGigResponse } from '~~/api';

const route = useRoute();
const router = useRouter();
const gigStore = useGigStore();

const gigId = route.params.id as string;
const gig = ref<GetGigResponse | null>(null);
const loading = ref(true);

useHead({
  title: 'Edit Gig - Gigs',
});

onMounted(async () => {
    try {
        gig.value = await gigStore.fetchGig(gigId) || null;
    } catch (e) {
        console.error("Failed to load gig", e);
    } finally {
        loading.value = false;
    }
});

const handleUpdate = async (data: UpsertGigRequest) => {
    try {
        await gigStore.updateGig(gigId, data);
        router.push('/gigs');
    } catch (e) {
        // Error handled in store
    }
};
</script>
