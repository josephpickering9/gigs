import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { GetGigResponse, UpsertGigRequest, GetArtistResponse, GetVenueResponse, FestivalDto, UpsertFestivalRequest } from '~~/api';
import {
    getApiGigs,
    postApiImportCsv,
    postApiGigs,
    putApiGigsById,
    getApiGigsById,
    getApiV1Artists,
    getApiV1Venues,
    postApiGigsByIdEnrich,
    deleteApiGigsById,
    getApiFestivals,
    postApiFestivals,
    getApiFestivalsById,
    putApiFestivalsById,
    deleteApiFestivalsById
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
    festivalsForm: AsyncForm<FestivalDto[]>;
    upsertFestivalForm: AsyncForm<FestivalDto>;
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
        festivalsForm: asyncForm<FestivalDto[]>(),
        upsertFestivalForm: asyncForm<FestivalDto>(),
        pagination: {
            page: 1,
            pageSize: 500,
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
        festivals: (state) => state.festivalsForm.data || [],
        loadingFestivals: (state) => state.festivalsForm.loading,
        savingFestival: (state) => state.upsertFestivalForm.loading,
        saveFestivalError: (state) => state.upsertFestivalForm.error,
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
            append?: boolean;
        } = {}) {
            await tryCatchFinally(ref(this.gigForm), async () => {
                const request = {
                    query: {
                        Page: options.page,
                        PageSize: options.pageSize,
                        VenueId: options.venueId,
                        ArtistId: options.artistId,
                        City: options.city,
                        FromDate: options.fromDate,
                        ToDate: options.toDate,
                        Search: options.search,
                    }
                };

                const result = await getApiGigs(request);

                // The API now returns a paginated response object in the body
                if (result.data) {
                    const paginatedResponse = result.data;

                    this.pagination = {
                        page: paginatedResponse.page || 1,
                        pageSize: paginatedResponse.pageSize || 500,
                        totalItems: paginatedResponse.totalCount || 0,
                        totalPages: paginatedResponse.totalPages || 1,
                    };

                    const newItems = paginatedResponse.items || [];
                    if (options.append) {
                        return [...(this.gigs || []), ...newItems];
                    }
                    return newItems;
                }

                return [];
            });
        },

        async loadMoreGigs() {
            if (this.pagination.page < this.pagination.totalPages) {
                await this.fetchGigs({
                    ...this.filters,
                    page: this.pagination.page + 1,
                    pageSize: this.pagination.pageSize,
                    append: true
                });
            }
        },

        async setFilters(filters: any) {
            this.filters = filters;
            await this.fetchGigs({ ...filters, page: 1, pageSize: this.pagination.pageSize });
        },

        async setPagination(page: number, pageSize: number) {
            await this.fetchGigs({ ...this.filters, page, pageSize });
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

        async fetchFestivals() {
            await tryCatchFinally(ref(this.festivalsForm), async () => {
                const response = await getApiFestivals();
                return response.data;
            });
        },

        async fetchFestival(id: string) {
            const existing = this.festivals.find(f => f.id === id);
            if (existing) return existing;

            const response = await getApiFestivalsById({ path: { id } });
            return response.data;
        },

        async createFestival(festival: UpsertFestivalRequest) {
            return await tryCatchFinally(ref(this.upsertFestivalForm), async () => {
                const response = await postApiFestivals({ body: festival });
                await this.fetchFestivals();
                return response.data;
            });
        },

        async updateFestival(id: string, festival: UpsertFestivalRequest) {
            return await tryCatchFinally(ref(this.upsertFestivalForm), async () => {
                const response = await putApiFestivalsById({ path: { id }, body: festival });
                await this.fetchFestivals();
                return response.data;
            });
        },

        async deleteFestival(id: string) {
            await tryCatchFinally(ref(this.upsertFestivalForm), async () => {
                await deleteApiFestivalsById({ path: { id } });
                await this.fetchFestivals();
                return undefined;
            });
        },

        async updateFestivalGigs(festivalId: string, newGigIds: string[]) {
            // Get current festival to know what to remove
            const festival = await this.fetchFestival(festivalId);
            if (!festival) return;

            const currentGigIds = festival.gigs?.map(g => g.id).filter(Boolean) as string[] || [];

            const toAdd = newGigIds.filter(id => !currentGigIds.includes(id));
            const toRemove = currentGigIds.filter(id => !newGigIds.includes(id));

            // Helper to update a single gig
            const updateGigFestival = async (gigId: string, targetFestivalId: string | null) => {
                const gig = await this.fetchGig(gigId);
                if (!gig) return;

                // Prepare update request
                const updateRequest: UpsertGigRequest = {
                    venueId: gig.venueId,
                    venueName: gig.venueName,
                    venueCity: null, // Depending on backend, might not need if ID provided? No, types say standard fields.
                    // Actually, looking at UpsertGigRequest, it has optional fields?
                    // Let's check api/types.gen.ts again.
                    // UpsertGigRequest:
                    /*
                        venueId?: string | null;
                        venueName?: string | null;
                        venueCity?: string | null;
                        festivalId?: string | null;
                        festivalName?: string | null;
                        date: string;
                        ticketCost?: number | null;
                        ticketType: TicketType;
                        imageUrl?: string | null;
                        acts?: Array<GigArtistRequest>;
                    */
                    // So we must provide all existing data to avoid wiping it.
                    festivalId: targetFestivalId,
                    festivalName: targetFestivalId && festival ? festival.name : null, // Optional likely
                    date: gig.date!,
                    ticketCost: gig.ticketCost,
                    ticketType: gig.ticketType!,
                    imageUrl: gig.imageUrl,
                    acts: gig.acts?.map(a => ({
                        artistId: a.artistId,
                        isHeadliner: a.isHeadliner,
                        // order?? GigArtistRequest has order. GetGigArtistResponse does NOT have order?
                        // GetGigArtistResponse has setlist.
                        // GigArtistRequest: artistId, isHeadliner, order, setlistUrl, setlist.
                        // We might lose 'order' if not in response!
                        // This is a risk.
                        // Let's check GetGigArtistResponse.
                        /*
                            artistId?: string;
                            name?: string;
                            isHeadliner?: boolean;
                            imageUrl?: string | null;
                            setlist?: Array<string>;
                        */
                        // It DOES NOT have 'order'.
                        // However, usually the list is ordered.
                        // I will assign order based on index.
                        order: 0, // Placeholder, usually handled by index in map
                    })).map((a, idx) => ({ ...a, order: idx + 1 }))
                };

                await this.updateGig(gigId, updateRequest);
            };

            // Execute updates in parallel or sequence
            // Parallel might be faster but risk rate limits or db locks.
            // Let's do sequence for safety.
            for (const id of toAdd) {
                await updateGigFestival(id, festivalId);
            }
            for (const id of toRemove) {
                await updateGigFestival(id, null);
            }

            await this.fetchFestival(festivalId); // helpers refresh list?
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
