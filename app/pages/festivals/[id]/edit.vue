<template>
  <div class="container mx-auto p-4 max-w-2xl">
    <div class="flex items-center justify-between mb-8">
        <div class="flex items-center">
            <button class="btn btn-ghost mr-4" @click="router.back()">
                <Icon name="mdi:arrow-left" class="w-6 h-6" />
            </button>
            <h1 class="text-4xl font-bold text-primary">Edit Festival</h1>
        </div>
        <button 
            v-if="festival"
            type="button" 
            class="btn btn-secondary gap-2" 
            :disabled="gigStore.enrichingFestival"
            @click="handleEnrich"
        >
            <span v-if="gigStore.enrichingFestival" class="loading loading-spinner" />
            <Icon v-else name="mdi:auto-fix" class="w-5 h-5" />
            Enrich Festival Data
        </button>
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
                    <button 
                        type="button"
                        class="btn btn-error btn-outline gap-2"
                        :disabled="gigStore.savingFestival"
                        @click="showDeleteConfirm = true"
                    >
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

    <dialog :class="['modal', { 'modal-open': showDeleteConfirm }]">
        <div class="modal-box">
            <h3 class="font-bold text-lg mb-4">
                <Icon name="mdi:alert" class="w-6 h-6 inline text-error" />
                Confirm Delete
            </h3>
            <p class="py-4">
                Are you sure you want to delete this festival? This action cannot be undone.
            </p>
            <div v-if="festival" class="bg-base-200 p-4 rounded-lg mb-4">
                <p class="font-semibold">{{ festival.name }}</p>
                <p v-if="festival.year" class="text-sm text-base-content/70">{{ festival.year }}</p>
                <p v-if="festival.gigs?.length" class="text-sm text-base-content/70">
                    {{ festival.gigs.length }} gig{{ festival.gigs.length !== 1 ? 's' : '' }}
                </p>
            </div>
            <div class="modal-action">
                <button 
                    class="btn btn-ghost" 
                    :disabled="gigStore.savingFestival"
                    @click="showDeleteConfirm = false"
                >
                    Cancel
                </button>
                <button 
                    class="btn btn-error"
                    :disabled="gigStore.savingFestival"
                    @click="handleDelete"
                >
                    <span v-if="gigStore.savingFestival" class="loading loading-spinner loading-sm"/>
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
import FestivalForm from '~/components/festivals/FestivalForm.vue';
import ImageSelectionModal from '~/components/ui/modal/ImageSelectionModal.vue';
import type { UpsertFestivalRequest, GetFestivalResponse, GetGigResponse, GetPersonResponse } from '~~/api';

definePageMeta({
  middleware: 'auth',
})

const route = useRoute();
const router = useRouter();
const gigStore = useGigStore();
const festivalId = route.params['id'] as string;

const festival = ref<GetFestivalResponse | undefined>(undefined);
const loading = ref(true);
const showDeleteConfirm = ref(false);

const showImageSelection = ref(false);
const imageCandidates = ref<string[]>([]);

useHead({
  title: 'Edit Festival - Gigs',
});

onMounted(async () => {
    try {
        festival.value = await gigStore.fetchFestival(festivalId);
    } finally {
        loading.value = false;
    }
});

const handleUpdate = async (data: UpsertFestivalRequest) => {
    const result = await gigStore.updateFestival(festivalId, data);
    
    if (result) {
        if (data.gigs) {
             await gigStore.updateFestivalGigs(festivalId, data.gigs);
        }
        await gigStore.fetchFestival(festivalId, true);
        useNotificationStore().displaySuccessNotification('Festival updated successfully');
        router.push(`/festivals/${festivalId}`);
    } else {
        useNotificationStore().displayErrorNotification('Failed to update festival');
    }
};

const handleEnrich = async () => {
    if (!festival.value?.id) return;
    
    const result = await gigStore.enrichFestival(festival.value.id);
    
    if (result) {
        useNotificationStore().displaySuccessNotification('Festival enriched successfully');
        // Fetch the updated festival data
        festival.value = result;

        if (result.imageCandidates && result.imageCandidates.length > 0) {
            imageCandidates.value = result.imageCandidates;
            showImageSelection.value = true;
        }
    } else {
        useNotificationStore().displayErrorNotification('Failed to enrich festival');
    }
};

const handleImageSelection = async (imageUrl: string) => {
    if (!festival.value) return;

    // Create a request with the new image URL, preserving other fields
    const updateRequest: UpsertFestivalRequest = {
        name: festival.value.name!,
        year: festival.value.year,
        imageUrl: imageUrl, 
        posterImageUrl: festival.value.posterImageUrl,
        venueId: festival.value.venueId,
        startDate: festival.value.startDate,
        endDate: festival.value.endDate,
        price: festival.value.price,
        // We need to pass the gigs and attendees back to avoid wiping them if the API requires it
        // based on UpsertFestivalRequest type:
        // gigs?: Array<FestivalGigOrderRequest>;
        // attendees?: Array<string>;
        
        // However, based on how generic update usually works, check if we need to map complex objects back to IDs/Requests.
        // Looking at GigStore.updateFestival, it takes UpsertFestivalRequest.
        // Let's assume we need to be careful with existing data.

        // Mapping existing gigs to order request
        gigs: festival.value.gigs?.map((g: GetGigResponse) => ({
            gigId: g.id,
            order: g.order
        })),
        attendees: festival.value.attendees?.map((a: GetPersonResponse) => a.id!)
    };
    
    // Note: The API types show 'venueName' in UpsertFestivalRequest, but usually ID is enough. 
    // Let's check the type def again.
    // UpsertFestivalRequest has venueId and venueName.
    if (festival.value.venueName) {
        updateRequest.venueName = festival.value.venueName;
    }

    const result = await gigStore.updateFestival(festivalId, updateRequest);
    if (result) {
        useNotificationStore().displaySuccessNotification('Image updated successfully');
        festival.value = result;
    } else {
        useNotificationStore().displayErrorNotification('Failed to update image');
    }
};

const handleDelete = async () => {
    const result = await gigStore.deleteFestival(festivalId);
    
    // deleteFestival returns undefined on success (same pattern as deleteGig)
    if (result === undefined && !gigStore.saveFestivalError) {
        useNotificationStore().displaySuccessNotification('Festival deleted successfully');
        showDeleteConfirm.value = false;
        router.push('/festivals');
    } else {
        useNotificationStore().displayErrorNotification('Failed to delete festival');
        showDeleteConfirm.value = false;
    }
};
</script>
