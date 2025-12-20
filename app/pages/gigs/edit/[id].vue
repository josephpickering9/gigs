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
            
            <!-- Delete Button -->
            <div class="divider"></div>
            <div class="flex justify-end">
                <button 
                    class="btn btn-error btn-outline"
                    :disabled="gigStore.saving"
                    @click="showDeleteConfirm = true"
                >
                    <Icon name="mdi:delete" class="w-5 h-5" />
                    Delete Gig
                </button>
            </div>
        </div>
    </div>
    
    <div v-else class="alert alert-warning">
        <span>Gig not found</span>
    </div>

    <!-- Delete Confirmation Modal -->
    <dialog :class="['modal', { 'modal-open': showDeleteConfirm }]">
        <div class="modal-box">
            <h3 class="font-bold text-lg mb-4">
                <Icon name="mdi:alert" class="w-6 h-6 inline text-error" />
                Confirm Delete
            </h3>
            <p class="py-4">
                Are you sure you want to delete this gig? This action cannot be undone.
            </p>
            <div v-if="gig" class="bg-base-200 p-4 rounded-lg mb-4">
                <p class="font-semibold">{{ gig.acts?.find(a => a.isHeadliner)?.name || 'Gig' }}</p>
                <p class="text-sm text-base-content/70">{{ gig.venueName }}</p>
                <p class="text-sm text-base-content/70">{{ formatDate(gig.date) }}</p>
            </div>
            <div class="modal-action">
                <button 
                    class="btn btn-ghost" 
                    :disabled="gigStore.saving"
                    @click="showDeleteConfirm = false"
                >
                    Cancel
                </button>
                <button 
                    class="btn btn-error"
                    :disabled="gigStore.saving"
                    @click="handleDelete"
                >
                    <span v-if="gigStore.saving" class="loading loading-spinner loading-sm"></span>
                    <Icon v-else name="mdi:delete" class="w-5 h-5" />
                    Delete
                </button>
            </div>
        </div>
        <div class="modal-backdrop" @click="showDeleteConfirm = false"></div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGigStore } from '~/store/GigStore';
import GigForm from '~/components/gigs/GigForm.vue';
import type { UpsertGigRequest, GetGigResponse } from '~~/api';
import { format } from 'date-fns';

const route = useRoute();
const router = useRouter();
const gigStore = useGigStore();

const gigId = route.params.id as string;
const gig = ref<GetGigResponse | null>(null);
const loading = ref(true);
const showDeleteConfirm = ref(false);

useHead({
  title: 'Edit Gig - Gigs',
});

const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'TBA';
    return format(new Date(dateStr), 'dd MMM yyyy');
};

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

const handleDelete = async () => {
    try {
        await gigStore.deleteGig(gigId);
        showDeleteConfirm.value = false;
        router.push('/gigs');
    } catch (e) {
        // Error handled in store
        showDeleteConfirm.value = false;
    }
};
</script>
