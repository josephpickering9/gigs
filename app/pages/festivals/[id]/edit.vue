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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGigStore } from '~/store/GigStore';
import { useNotificationStore } from '~/store/NotificationStore';
import FestivalForm from '~/components/festivals/FestivalForm.vue';
import type { UpsertFestivalRequest, GetFestivalResponse } from '~~/api';

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
        festival.value = await gigStore.fetchFestival(festival.value.id) || undefined;
    } else {
        useNotificationStore().displayErrorNotification('Failed to enrich festival');
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
