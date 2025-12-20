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

                // We need to access the full response to get pagination headers if they exist
                // The generated client might not expose headers easily in the data property
                // But getApiGigs returns a promise that resolves to { data, response, ... } usually?
                // Let's check sdk.gen.ts. It returns `(options?.client ?? client).get...`
                // functionality depends on the client implementation. 
                // Assuming standard hey-api, it might return { data, error, request, response }

                const result = await getApiGigs({ query } as any);

                // If the backend returns paged data in body (e.g. { items: [], totalCount: 100 }) 
                // we would handle it here. If it returns headers, we check result.response.headers.
                // Since types say Array<GetGigResponse>, I'll assume for now it returns just the array
                // and maybe headers.

                // Let's store pagination metadata if we can find it.
                // Assuming X-Pagination header for now as it's common in .NET
                const paginationHeader = (result as any).response?.headers?.get('X-Pagination');
                if (paginationHeader) {
                    try {
                        const pagination = JSON.parse(paginationHeader);
                        this.pagination = {
                            page: pagination.PageNumber || pagination.currentPage || 1,
                            pageSize: pagination.PageSize || pagination.itemsPerPage || 10,
                            totalItems: pagination.TotalCount || pagination.totalItems || 0,
                            totalPages: pagination.TotalPages || pagination.totalPages || 0,
                        };
                    } catch (e) {
                        console.warn('Failed to parse pagination header', e);
                    }
                }

                return result.data;
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
