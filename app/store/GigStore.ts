import { defineStore } from 'pinia';
import { ref } from 'vue';
import type {
    GetGigResponse, UpsertGigRequest, GetArtistResponse, GetVenueResponse, GetFestivalResponse, UpsertFestivalRequest, GetAttendeeResponse, FestivalGigOrderRequest
} from '~~/api';
import {
    getApiGigs,
    postApiImportCsv,
    postApiGigs,
    putApiGigsById,
    getApiGigsById,
    getApiArtists,
    getApiVenues,
    postApiGigsByIdEnrich,
    deleteApiGigsById,
    getApiFestivals,
    postApiFestivals,
    getApiFestivalsById,
    putApiFestivalsById,
    postApiFestivalsByIdEnrich,
    deleteApiFestivalsById,
    getApiAttendees,
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
    festivalsForm: AsyncForm<GetFestivalResponse[]>;
    upsertFestivalForm: AsyncForm<GetFestivalResponse>;
    enrichFestivalForm: AsyncForm<GetFestivalResponse>;
    attendeesForm: AsyncForm<GetAttendeeResponse[]>;
    pagination: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    };
    filters: {
        venueId?: string;
        artistId?: string;
        attendeeId?: string;
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
        festivalsForm: asyncForm<GetFestivalResponse[]>(),
        upsertFestivalForm: asyncForm<GetFestivalResponse>(),
        enrichFestivalForm: asyncForm<GetFestivalResponse>(),
        attendeesForm: asyncForm<GetAttendeeResponse[]>(),
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
        enrichingFestival: (state) => state.enrichFestivalForm.loading,
        enrichFestivalError: (state) => state.enrichFestivalForm.error,
        attendees: (state) => state.attendeesForm.data || [],
        loadingAttendees: (state) => state.attendeesForm?.loading || false,
    },

    actions: {
        async fetchGigs(options: {
            page?: number;
            pageSize?: number;
            venueId?: string;
            artistId?: string;
            attendeeId?: string;
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
                        AttendeeId: options.attendeeId,
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
                const response = await getApiArtists();
                return response.data;
            });
        },

        async fetchVenues() {
            await tryCatchFinally(ref(this.venuesForm), async () => {
                const response = await getApiVenues();
                return response.data;
            });
        },

        async fetchFestivals() {
            await tryCatchFinally(ref(this.festivalsForm), async () => {
                const response = await getApiFestivals();
                return response.data;
            });
        },

        async fetchFestival(id: string, force = false) {
            if (!force) {
                const existing = this.festivals.find(f => f.id === id);
                if (existing) return existing;
            }

            const response = await getApiFestivalsById({ path: { id } });
            if (response.data) {
                const index = this.festivals.findIndex(f => f.id === id);
                if (index !== -1) {
                    this.festivals[index] = response.data;
                } else {
                    this.festivals.push(response.data);
                }
            }
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

        async fetchAttendees() {
            await tryCatchFinally(ref(this.attendeesForm), async () => {
                const response = await getApiAttendees();
                return response.data;
            });
        },

        async updateFestivalGigs(festivalId: string, newGigs: FestivalGigOrderRequest[]) {
            const festival = await this.fetchFestival(festivalId);
            if (!festival) return;

            const currentGigIds = festival.gigs?.map(g => g.id).filter(Boolean) as string[] || [];
            const newGigIds = newGigs.map(g => g.gigId).filter(Boolean) as string[];

            const toAdd = newGigIds.filter(id => !currentGigIds.includes(id));
            const toRemove = currentGigIds.filter(id => !newGigIds.includes(id));

            // Also need to update existing gigs if their order changed
            const existingToUpdate = newGigIds.filter(id => currentGigIds.includes(id));

            const updateGigFestival = async (gigId: string, targetFestivalId: string | null) => {
                const gig = await this.fetchGig(gigId);
                if (!gig) return;

                // Find the new order if we are adding or updating
                let newOrder = 0;
                if (targetFestivalId) {
                    const gigOrderReq = newGigs.find(g => g.gigId === gigId);
                    if (gigOrderReq && gigOrderReq.order !== undefined) {
                        newOrder = gigOrderReq.order;
                    }
                }

                const updateRequest: UpsertGigRequest = {
                    venueId: gig.venueId,
                    venueName: gig.venueName,
                    venueCity: null,
                    festivalId: targetFestivalId,
                    festivalName: targetFestivalId && festival ? festival.name : null,
                    date: gig.date!,
                    order: newOrder,
                    ticketCost: gig.ticketCost,
                    ticketType: gig.ticketType!,
                    imageUrl: gig.imageUrl,
                    acts: gig.acts?.map(a => ({
                        artistId: a.artistId,
                        isHeadliner: a.isHeadliner,
                        order: 0,
                        // Preserve setlist as array of strings (just titles)
                        setlist: a.setlist?.map(s => s.title || '') || []
                    })).map((a, idx) => ({ ...a, order: idx + 1 }))
                };

                await this.updateGig(gigId, updateRequest);
            };

            for (const id of toAdd) {
                await updateGigFestival(id, festivalId);
            }
            for (const id of toRemove) {
                await updateGigFestival(id, null);
            }
            // Update order for existing gigs
            for (const id of existingToUpdate) {
                await updateGigFestival(id, festivalId);
            }

            await this.fetchFestival(festivalId, true);
        },

        async createGig(gig: UpsertGigRequest) {
            return await tryCatchFinally(ref(this.upsertForm), async () => {
                const response = await postApiGigs({ body: gig });
                await this.fetchGigs();
                return response.data;
            });
        },

        async updateGig(id: string, gig: UpsertGigRequest) {
            return await tryCatchFinally(ref(this.upsertForm), async () => {
                const response = await putApiGigsById({ path: { id }, body: gig });
                await this.fetchGigs();
                return response.data;
            });
        },

        async enrichGig(id: string) {
            return await tryCatchFinally(ref(this.enrichForm), async () => {
                const response = await postApiGigsByIdEnrich({ path: { id } });
                await this.fetchGigs();
                return response.data;
            });
        },

        async deleteGig(id: string) {
            return await tryCatchFinally(ref(this.upsertForm), async () => {
                await deleteApiGigsById({ path: { id } });
                await this.fetchGigs();
                return undefined;
            });
        },

        async enrichFestival(id: string) {
            return await tryCatchFinally(ref(this.enrichFestivalForm), async () => {
                const response = await postApiFestivalsByIdEnrich({ path: { id } });
                return response.data;
            });
        },

        async importGigs(file: File) {
            return await tryCatchFinally(ref(this.importForm), async () => {
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
                await this.fetchGigs();
            });
        },
    },
});
