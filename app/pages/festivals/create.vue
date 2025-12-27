<template>
  <div class="container mx-auto p-4 max-w-2xl">
    <div class="flex items-center mb-8">
        <button class="btn btn-ghost mr-4" @click="router.back()">
            <Icon name="mdi:arrow-left" class="w-6 h-6" />
        </button>
        <h1 class="text-4xl font-bold text-primary">Create Festival</h1>
    </div>

    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <FestivalForm 
                :loading="gigStore.savingFestival" 
                submit-label="Create Festival" 
                @submit="handleCreate" 
                @cancel="router.back()" 
            />
             <div v-if="gigStore.saveFestivalError" class="alert alert-error mt-4">
                <Icon name="mdi:alert-circle" class="w-6 h-6" />
                <span>{{ gigStore.saveFestivalError }}</span>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useGigStore } from '~/store/GigStore';
import FestivalForm from '~/components/festivals/FestivalForm.vue';
import type { UpsertFestivalRequest } from '~~/api';

definePageMeta({
  middleware: 'auth',
})

const router = useRouter();
const gigStore = useGigStore();

useHead({
  title: 'Create Festival - Gigs',
});

const handleCreate = async (data: UpsertFestivalRequest, gigIds: string[]) => {
    const newFestival = await gigStore.createFestival(data);
    if (newFestival && newFestival.id && gigIds.length > 0) {
        await gigStore.updateFestivalGigs(newFestival.id, gigIds);
    }
    if (newFestival?.id) {
        router.push(`/festivals/${newFestival.id}`);
    } else {
        router.push('/festivals');
    }
};
</script>
