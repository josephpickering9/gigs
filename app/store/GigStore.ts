import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { GetGigResponse, UpsertGigRequest, GetArtistResponse, GetVenueResponse } from '~~/api';
import {
    getApiGigs,
    postApiImportCsv,
    postApiGigs,
    putApiGigsById,
    getApiGigsById,
    getApiV1Artists,
    getApiV1Venues,
    postApiGigsByIdEnrich,
    deleteApiGigsById
} from '~~/api';
import { asyncForm, tryCatchFinally } from '~/utils/async-helper';
import type { AsyncForm } from '~/types/AsyncForm';

interface GigState {
    gigForm: AsyncForm<GetGigResponse[]>;
    importForm: AsyncForm<any>;
    upsertForm: AsyncForm<GetGigResponse>;
    enrichForm: AsyncForm<GetGigResponse>;
    artistsForm: AsyncForm<GetArtistResponse[]>;
    venuesForm: AsyncForm<GetVenueResponse[]>;
}

export const useGigStore = defineStore('gig', {
    state: (): GigState => ({
        gigForm: asyncForm<GetGigResponse[]>(),
        importForm: asyncForm<any>(),
        upsertForm: asyncForm<GetGigResponse>(),
        enrichForm: asyncForm<GetGigResponse>(),
        artistsForm: asyncForm<GetArtistResponse[]>(),
        venuesForm: asyncForm<GetVenueResponse[]>(),
    }),

    getters: {
        gigs: (state) => state.gigForm.data || [],
        loading: (state) => state.gigForm.loading,
        error: (state) => state.gigForm.error,
        importing: (state) => state.importForm.loading,
        importError: (state) => state.importForm.error,
        saving: (state) => state.upsertForm.loading,
        saveError: (state) => state.upsertForm.error,
        enriching: (state) => state.enrichForm.loading,
        enrichError: (state) => state.enrichForm.error,
        artists: (state) => state.artistsForm.data || [],
        loadingArtists: (state) => state.artistsForm.loading,
        venues: (state) => state.venuesForm.data || [],
        loadingVenues: (state) => state.venuesForm.loading,
    },

    actions: {
        async fetchGigs() {
            await tryCatchFinally(ref(this.gigForm), async () => {
                const response = await getApiGigs();
                return response.data;
            });
        },

        async fetchGig(id: string) {
            // First check if we already have it in the list
            const existingGig = this.gigs.find(g => g.id === id);
            if (existingGig) {
                return existingGig;
            }

            // If not, fetch it
            const response = await getApiGigsById({ path: { id } });
            return response.data;
        },

        async fetchArtists() {
            await tryCatchFinally(ref(this.artistsForm), async () => {
                const response = await getApiV1Artists();
                return response.data;
            });
        },

        async fetchVenues() {
            await tryCatchFinally(ref(this.venuesForm), async () => {
                const response = await getApiV1Venues();
                return response.data;
            });
        },

        async createGig(gig: UpsertGigRequest) {
            await tryCatchFinally(ref(this.upsertForm), async () => {
                const response = await postApiGigs({ body: gig });
                await this.fetchGigs(); // Refresh list
                return response.data;
            });
        },

        async updateGig(id: string, gig: UpsertGigRequest) {
            await tryCatchFinally(ref(this.upsertForm), async () => {
                const response = await putApiGigsById({ path: { id }, body: gig });
                await this.fetchGigs(); // Refresh list
                return response.data;
            });
        },

        async enrichGig(id: string) {
            await tryCatchFinally(ref(this.enrichForm), async () => {
                // Call enrich endpoint
                await postApiGigsByIdEnrich({ path: { id } });
                // Fetch the updated gig data
                const response = await getApiGigsById({ path: { id } });
                // Refresh the gigs list
                await this.fetchGigs();
                return response.data;
            });
        },

        async deleteGig(id: string) {
            await tryCatchFinally(ref(this.upsertForm), async () => {
                await deleteApiGigsById({ path: { id } });
                // Refresh the gigs list after deletion
                await this.fetchGigs();
                return undefined;
            });
        },

        async importGigs(file: File) {
            await tryCatchFinally(ref(this.importForm), async () => {
                await postApiImportCsv({
                    body: { file },
                    bodySerializer: (params) => {
                        const formData = new FormData();
                        if (params.file) {
                            formData.append('file', params.file);
                        }
                        return formData;
                    },
                });
                // Refresh gigs after successful import
                await this.fetchGigs();
            });
        },
    },
});
