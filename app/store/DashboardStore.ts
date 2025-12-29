import { defineStore } from 'pinia';
import type {
    DashboardStatsResponse,
    AverageTicketPriceByYearResponse,
    GigsPerYearResponse,
    GigsPerMonthResponse,
    TemporalStatsResponse,
    TopArtistResponse,
    TopVenueResponse,
    TopCityResponse,
    TopAttendeeResponse,
    InterestingInsightsResponse,
    MostHeardSongResponse,
} from '~~/api';
import {
    getApiDashboardStats,
    getApiDashboardAverageTicketPriceByYear,
    getApiDashboardGigsPerYear,
    getApiDashboardGigsPerMonth,
    getApiDashboardTemporalStats,
    getApiDashboardTopArtists,
    getApiDashboardTopVenues,
    getApiDashboardTopCities,
    getApiDashboardTopAttendees,
    getApiDashboardInterestingInsights,
    getApiDashboardMostHeardSongs,
} from '~~/api';
import { asyncForm, tryCatchFinally } from '~/utils/async-helper';
import type { AsyncForm } from '~/types/AsyncForm';

interface DashboardState {
    statsForm: AsyncForm<DashboardStatsResponse>;
    priceChartForm: AsyncForm<AverageTicketPriceByYearResponse[]>;
    gigsPerYearForm: AsyncForm<GigsPerYearResponse[]>;
    gigsPerMonthForm: AsyncForm<GigsPerMonthResponse[]>;
    temporalStatsForm: AsyncForm<TemporalStatsResponse>;
    topArtistsForm: AsyncForm<TopArtistResponse[]>;
    topVenuesForm: AsyncForm<TopVenueResponse[]>;
    topCitiesForm: AsyncForm<TopCityResponse[]>;
    topAttendeesForm: AsyncForm<TopAttendeeResponse[]>;
    interestingInsightsForm: AsyncForm<InterestingInsightsResponse>;
    mostHeardSongsForm: AsyncForm<MostHeardSongResponse[]>;
}

export const useDashboardStore = defineStore('dashboard', {
    state: (): DashboardState => ({
        statsForm: asyncForm<DashboardStatsResponse>(),
        priceChartForm: asyncForm<AverageTicketPriceByYearResponse[]>(),
        gigsPerYearForm: asyncForm<GigsPerYearResponse[]>(),
        gigsPerMonthForm: asyncForm<GigsPerMonthResponse[]>(),
        temporalStatsForm: asyncForm<TemporalStatsResponse>(),
        topArtistsForm: asyncForm<TopArtistResponse[]>(),
        topVenuesForm: asyncForm<TopVenueResponse[]>(),
        topCitiesForm: asyncForm<TopCityResponse[]>(),
        topAttendeesForm: asyncForm<TopAttendeeResponse[]>(),
        interestingInsightsForm: asyncForm<InterestingInsightsResponse>(),
        mostHeardSongsForm: asyncForm<MostHeardSongResponse[]>(),
    }),

    getters: {
        stats: (state) => state.statsForm.data,
        loadingStats: (state) => state.statsForm.loading,
        statsError: (state) => state.statsForm.error,

        priceChartData: (state) => state.priceChartForm.data || [],
        loadingPriceChart: (state) => state.priceChartForm.loading,

        gigsPerYearData: (state) => state.gigsPerYearForm.data || [],
        loadingGigsPerYear: (state) => state.gigsPerYearForm.loading,

        gigsPerMonthData: (state) => state.gigsPerMonthForm.data || [],
        loadingGigsPerMonth: (state) => state.gigsPerMonthForm.loading,

        temporalStats: (state) => state.temporalStatsForm.data,
        loadingTemporalStats: (state) => state.temporalStatsForm.loading,

        topArtists: (state) => state.topArtistsForm.data || [],
        loadingTopArtists: (state) => state.topArtistsForm.loading,

        topVenues: (state) => state.topVenuesForm.data || [],
        loadingTopVenues: (state) => state.topVenuesForm.loading,

        topCities: (state) => state.topCitiesForm.data || [],
        loadingTopCities: (state) => state.topCitiesForm.loading,

        topAttendees: (state) => state.topAttendeesForm.data || [],
        loadingTopAttendees: (state) => state.topAttendeesForm.loading,

        interestingInsights: (state) => state.interestingInsightsForm.data,
        loadingInterestingInsights: (state) => state.interestingInsightsForm.loading,

        mostHeardSongs: (state) => state.mostHeardSongsForm.data || [],
        loadingMostHeardSongs: (state) => state.mostHeardSongsForm.loading,

        isLoading: (state) =>
            state.statsForm.loading ||
            state.priceChartForm.loading ||
            state.gigsPerYearForm.loading ||
            state.gigsPerMonthForm.loading ||
            state.temporalStatsForm.loading ||
            state.topArtistsForm.loading ||
            state.topVenuesForm.loading ||
            state.topCitiesForm.loading ||
            state.topAttendeesForm.loading ||
            state.interestingInsightsForm.loading ||
            state.mostHeardSongsForm.loading,
    },

    actions: {
        async fetchStats() {
            await tryCatchFinally(ref(this.statsForm), async () => {
                const response = await getApiDashboardStats();
                return response.data;
            });
        },

        async fetchPriceChart() {
            await tryCatchFinally(ref(this.priceChartForm), async () => {
                const response = await getApiDashboardAverageTicketPriceByYear();
                return response.data;
            });
        },

        async fetchGigsPerYear() {
            await tryCatchFinally(ref(this.gigsPerYearForm), async () => {
                const response = await getApiDashboardGigsPerYear();
                return response.data;
            });
        },

        async fetchGigsPerMonth() {
            await tryCatchFinally(ref(this.gigsPerMonthForm), async () => {
                const response = await getApiDashboardGigsPerMonth();
                return response.data;
            });
        },

        async fetchTemporalStats() {
            await tryCatchFinally(ref(this.temporalStatsForm), async () => {
                const response = await getApiDashboardTemporalStats();
                return response.data;
            });
        },

        async fetchTopArtists(limit: number = 10) {
            await tryCatchFinally(ref(this.topArtistsForm), async () => {
                const response = await getApiDashboardTopArtists({ query: { limit } });
                return response.data;
            });
        },

        async fetchTopVenues(limit: number = 10) {
            await tryCatchFinally(ref(this.topVenuesForm), async () => {
                const response = await getApiDashboardTopVenues({ query: { limit } });
                return response.data;
            });
        },

        async fetchTopCities(limit: number = 10) {
            await tryCatchFinally(ref(this.topCitiesForm), async () => {
                const response = await getApiDashboardTopCities({ query: { limit } });
                return response.data;
            });
        },

        async fetchTopAttendees(limit: number = 10) {
            await tryCatchFinally(ref(this.topAttendeesForm), async () => {
                const response = await getApiDashboardTopAttendees({ query: { limit } });
                return response.data;
            });
        },

        async fetchInterestingInsights() {
            await tryCatchFinally(ref(this.interestingInsightsForm), async () => {
                const response = await getApiDashboardInterestingInsights();
                return response.data;
            });
        },

        async fetchMostHeardSongs(limit: number = 10) {
            await tryCatchFinally(ref(this.mostHeardSongsForm), async () => {
                const response = await getApiDashboardMostHeardSongs({ query: { limit } });
                return response.data;
            });
        },

        async fetchAll() {
            await Promise.all([
                this.fetchStats(),
                this.fetchPriceChart(),
                this.fetchGigsPerYear(),
                this.fetchGigsPerMonth(),
                this.fetchTemporalStats(),
                this.fetchTopArtists(10),
                this.fetchTopVenues(10),
                this.fetchTopCities(10),
                this.fetchTopAttendees(10),
                this.fetchInterestingInsights(),
                this.fetchMostHeardSongs(10),
            ]);
        },
    },
});
