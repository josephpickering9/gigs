<template>
  <div class="container mx-auto p-4 max-w-2xl">
    <div class="flex items-center mb-8">
        <button class="btn btn-ghost mr-4" @click="router.back()">
            <Icon name="mdi:arrow-left" class="w-6 h-6" />
        </button>
        <h1 class="text-4xl font-bold text-primary">Edit Festival</h1>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg text-primary" />
    </div>

    <div v-else-if="!festival" class="alert alert-error">
        Festival not found
    </div>

    <div v-else class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <FestivalForm 
                :initial-data="festival"
                :loading="gigStore.savingFestival" 
                submit-label="Save Changes" 
                @submit="handleUpdate" 
                @cancel="router.back()" 
            >
                <template #left-actions>
                    <button type="button" class="btn btn-error btn-outline" @click="confirmDelete">
                        <Icon name="mdi:delete" class="w-5 h-5" />
                        Delete Festival
                    </button>
                </template>
            </FestivalForm>
            
             <div v-if="gigStore.saveFestivalError" class="alert alert-error mt-4">
                <Icon name="mdi:alert-circle" class="w-6 h-6" />
                <span>{{ gigStore.saveFestivalError }}</span>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGigStore } from '~/store/GigStore';
import FestivalForm from '~/components/festivals/FestivalForm.vue';
import type { UpsertFestivalRequest, FestivalDto } from '~~/api';

definePageMeta({
  middleware: 'auth',
})

const route = useRoute();
const router = useRouter();
const gigStore = useGigStore();
const festivalId = route.params['id'] as string;

const festival = ref<FestivalDto | undefined>(undefined);
const loading = ref(true);

useHead({
  title: 'Edit Festival - Gigs',
});

onMounted(async () => {
    try {
        festival.value = await gigStore.fetchFestival(festivalId);
    } catch (e) {
        console.error('Failed to fetch festival', e);
    } finally {
        loading.value = false;
    }
});

const handleUpdate = async (data: UpsertFestivalRequest) => {
    try {
        await gigStore.updateFestival(festivalId, data);
        router.push('/festivals');
    } catch {
        // Error handled in store
    }
};

const confirmDelete = async () => {
    if (confirm('Are you sure you want to delete this festival? This action cannot be undone.')) {
        try {
             await gigStore.deleteFestival(festivalId);
             router.push('/festivals');
        } catch (e) {
             console.error('Failed to delete', e);
        }
    }
};
</script>
