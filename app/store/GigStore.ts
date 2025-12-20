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
    pagination: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    };
    filters: {
        venueId?: string;
        artistId?: string;
        city?: string;
        fromDate?: string;
        toDate?: string;
        search?: string;
        sortBy?: string;
        sortDirection?: string;
    };
}

export const useGigStore = defineStore('gig', {
    state: (): GigState => ({
        gigForm: asyncForm<GetGigResponse[]>(),
        importForm: asyncForm<any>(),
        upsertForm: asyncForm<GetGigResponse>(),
        enrichForm: asyncForm<GetGigResponse>(),
        artistsForm: asyncForm<GetArtistResponse[]>(),
        venuesForm: asyncForm<GetVenueResponse[]>(),
        pagination: {
            page: 1,
            pageSize: 20,
            totalItems: 0,
            totalPages: 1,
        },
        filters: {},
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
        async fetchGigs(options: {
            page?: number;
            pageSize?: number;
            venueId?: string;
            artistId?: string;
            city?: string;
            fromDate?: string;
            toDate?: string;
            sortBy?: string;
            sortDirection?: string;
            search?: string;
        } = {}) {
            await tryCatchFinally(ref(this.gigForm), async () => {
                const query: any = {};

                if (options.page) query.Page = options.page;
                if (options.pageSize) query.PageSize = options.pageSize;
                if (options.venueId) query.VenueId = options.venueId;
                if (options.artistId) query.ArtistId = options.artistId;
                if (options.city) query.City = options.city;
                if (options.fromDate) query.FromDate = options.fromDate;
                if (options.toDate) query.ToDate = options.toDate;
                // Keep passing sort params even if not explicitly in types yet, as backend likely handles them
                if (options.sortBy) query.SortBy = options.sortBy;
                if (options.sortDirection) query.SortDirection = options.sortDirection;
                if (options.search) query.Search = options.search;

                const result = await getApiGigs({ query } as any);

                // The API now returns a paginated response object in the body
                if (result.data) {
                    const paginatedResponse = result.data as any; // Cast to any to access properties if strict types fail initially, or better: use type guard if possible. 
                    // Actually types.gen.ts defines GetGigResponsePaginatedResponse, so result.data SHOULD be that.

                    // Update pagination state from response body
                    this.pagination = {
                        page: paginatedResponse.page || 1,
                        pageSize: paginatedResponse.pageSize || 20,
                        totalItems: paginatedResponse.totalCount || 0,
                        totalPages: paginatedResponse.totalPages || 1,
                    };

                    return paginatedResponse.items || [];
                }

                return [];
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
