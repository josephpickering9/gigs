<template>
  <div class="container mx-auto p-4 max-w-2xl">
    <div class="flex items-center mb-8">
        <button class="btn btn-ghost mr-4" @click="router.back()">
            <Icon name="mdi:arrow-left" class="w-6 h-6" />
        </button>
        <h1 class="text-4xl font-bold text-primary">Create Gig</h1>
    </div>

    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <GigForm 
                :loading="gigStore.saving" 
                submit-label="Create Gig" 
                @submit="handleCreate" 
                @cancel="router.back()" 
            />
             <div v-if="gigStore.saveError" class="alert alert-error mt-4">
                <Icon name="mdi:alert-circle" class="w-6 h-6" />
                <span>{{ gigStore.saveError }}</span>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useGigStore } from '~/store/GigStore';
import GigForm from '~/components/gigs/GigForm.vue';
import type { UpsertGigRequest } from '~~/api';

definePageMeta({
  middleware: 'auth',
})

const router = useRouter();
const gigStore = useGigStore();

useHead({
  title: 'Create Gig - Gigs',
});

const handleCreate = async (data: UpsertGigRequest) => {
    await gigStore.createGig(data);
    router.push('/gigs');
};
</script>
