<template>
  <div class="container mx-auto p-4 max-w-2xl">
    <div class="flex items-center justify-between mb-8">
        <div class="flex items-center">
            <button class="btn btn-ghost mr-4" @click="router.back()">
                <Icon name="mdi:arrow-left" class="w-6 h-6" />
            </button>
            <h1 class="text-4xl font-bold text-primary">Edit Gig</h1>
        </div>
        <button 
            v-if="gig"
            type="button" 
            class="btn btn-secondary gap-2" 
            :disabled="gigStore.enriching"
            @click="handleEnrich"
        >
            <span v-if="gigStore.enriching" class="loading loading-spinner" />
            <Icon v-else name="mdi:auto-fix" class="w-5 h-5" />
            Enrich Gig Data
        </button>
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <span class="loading loading-spinner loading-lg text-primary"/>
    </div>

    <div v-else-if="gig" class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <GigForm 
                :initial-data="gig"
                :loading="gigStore.saving" 
                submit-label="Update Gig" 
                @submit="handleUpdate" 
                @cancel="router.back()" 
            >
                <template #left-actions>
                    <button 
                        type="button"
                        class="btn btn-error btn-outline gap-2"
                        :disabled="gigStore.saving"
                        @click="showDeleteConfirm = true"
                    >
                        <Icon name="mdi:delete" class="w-5 h-5" />
                        Delete Gig
                    </button>
                </template>
            </GigForm>
            
            <div v-if="gigStore.saveError" class="alert alert-error mt-4">
                <Icon name="mdi:alert-circle" class="w-6 h-6" />
                <span>{{ gigStore.saveError }}</span>
            </div>
        </div>
    </div>
    
    <div v-else class="alert alert-warning">
        <span>Gig not found</span>
    </div>

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
                    <span v-if="gigStore.saving" class="loading loading-spinner loading-sm"/>
                    <Icon v-else name="mdi:delete" class="w-5 h-5" />
                    Delete
                </button>
            </div>
        </div>
        <div class="modal-backdrop" @click="showDeleteConfirm = false"/>
    </dialog>

    <ImageSelectionModal 
        v-model="showImageSelection"
        :images="imageCandidates"
        @select="handleImageSelection"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGigStore } from '~/store/GigStore';
import { useNotificationStore } from '~/store/NotificationStore';
import GigForm from '~/components/gigs/GigForm.vue';
import ImageSelectionModal from '~/components/ui/modal/ImageSelectionModal.vue';
import type { UpsertGigRequest, GetGigResponse } from '~~/api';
import { format } from 'date-fns';

definePageMeta({
  middleware: 'auth',
});

const route = useRoute();
const router = useRouter();
const gigStore = useGigStore();

const gigId = route.params['id'] as string;
const gig = ref<GetGigResponse | null>(null);
const loading = ref(true);
const showDeleteConfirm = ref(false);

const showImageSelection = ref(false);
const imageCandidates = ref<string[]>([]);

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
    } catch {
        // Error handled in store
    } finally {
        loading.value = false;
    }
});

const handleUpdate = async (data: UpsertGigRequest) => {
    const result = await gigStore.updateGig(gigId, data);
    if (result) {
        useNotificationStore().displaySuccessNotification('Gig updated successfully');
        router.back();
    } else {
        useNotificationStore().displayErrorNotification('Failed to update gig');
    }
};


const handleEnrich = async () => {
    if (!gig.value?.id) return;
    
    // store.enrichGig now returns the updated gig object
    const updatedGig = await gigStore.enrichGig(gig.value.id);
    
    if (updatedGig) {
        useNotificationStore().displaySuccessNotification('Gig enriched successfully');
        gig.value = updatedGig;
        
        // If we have image candidates, show the selection modal
        if (updatedGig.imageCandidates && updatedGig.imageCandidates.length > 0) {
            imageCandidates.value = updatedGig.imageCandidates;
            showImageSelection.value = true;
        }
    } else {
        useNotificationStore().displayErrorNotification('Failed to enrich gig');
    }
};

const handleImageSelection = async (imageUrl: string) => {
    if (!gig.value) return;

    // Create a request with the new image URL, preserving other fields
    // We need to map GetGigResponse to UpsertGigRequest
    const updateRequest: UpsertGigRequest = {
        venueId: gig.value.venueId,
        date: gig.value.date!,
        ticketType: gig.value.ticketType!,
        ticketCost: gig.value.ticketCost,
        imageUrl: imageUrl, 
        festivalId: gig.value.festivalId,
        acts: gig.value.acts?.map(a => ({
             artistId: a.artistId,
             isHeadliner: a.isHeadliner,
             setlist: a.setlist?.map(s => ({
                 title: s.title || '',
                 order: s.order || 0,
                 isEncore: s.isEncore || false
             })) || []
        }))
    };

    console.log('Sending Update Request:', JSON.stringify(updateRequest, null, 2));

    const result = await gigStore.updateGig(gigId, updateRequest);
    if (result) {
        useNotificationStore().displaySuccessNotification('Image updated successfully');
        gig.value = result;
    } else {
        useNotificationStore().displayErrorNotification('Failed to update image');
    }
};

const handleDelete = async () => {
    const result = await gigStore.deleteGig(gigId);
    if (result === undefined && !gigStore.saveError) {
         // delete returns undefined on success, so we check for error
         useNotificationStore().displaySuccessNotification('Gig deleted successfully');
         showDeleteConfirm.value = false;
         router.push('/gigs');
    } else {
         useNotificationStore().displayErrorNotification('Failed to delete gig');
         showDeleteConfirm.value = false;
    }
};
</script>
