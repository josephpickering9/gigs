<template>
  <div class="container mx-auto p-4 min-h-screen">
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-primary mb-2">Dashboard</h1>
      <p class="text-base-content/70">Overview of your gig statistics and trends</p>
    </div>

    <!-- Loading State -->
    <div v-if="dashboardStore.isLoading && !hasAnyData" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="i in 8" :key="i" class="skeleton h-32 rounded-lg"/>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="skeleton h-96 rounded-lg"/>
        <div class="skeleton h-96 rounded-lg"/>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="dashboardStore.statsError" class="alert alert-error">
      <Icon name="mdi:alert-circle" class="w-6 h-6" />
      <span>{{ dashboardStore.statsError }}</span>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="space-y-8">
      <!-- Main Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Gigs"
          :value="dashboardStore.stats?.totalGigs || 0"
          icon="mdi:music-note"
          subtitle="All time"
        />
        <StatCard
          label="Top Artist"
          :value="dashboardStore.stats?.topArtist?.artistName || 'N/A'"
          :subtitle="`${dashboardStore.stats?.topArtist?.gigCount || 0} gigs`"
          icon="mdi:account-music"
        />
        <StatCard
          label="Top Attendee"
          :value="dashboardStore.stats?.topAttendee?.personName || 'N/A'"
          :subtitle="`${dashboardStore.stats?.topAttendee?.gigCount || 0} gigs`"
          icon="mdi:account-star"
        />
        <StatCard
          label="Top Venue"
          :value="dashboardStore.stats?.topVenue?.venueName || 'N/A'"
          :subtitle="`${dashboardStore.stats?.topVenue?.gigCount || 0} gigs`"
          icon="mdi:map-marker"
        />
        <StatCard
          label="Top City"
          :value="dashboardStore.stats?.topCity?.cityName || 'N/A'"
          :subtitle="`${dashboardStore.stats?.topCity?.gigCount || 0} gigs`"
          icon="mdi:city"
        />
        <StatCard
          label="Busiest Year"
          :value="dashboardStore.temporalStats?.busiestYear || 'N/A'"
          :subtitle="`${dashboardStore.temporalStats?.busiestYearGigCount || 0} gigs`"
          icon="mdi:calendar-star"
        />
        <StatCard
          label="Days Since Last Gig"
          :value="dashboardStore.temporalStats?.daysSinceLastGig ?? 'N/A'"
          icon="mdi:calendar-clock"
        />
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Gigs Per Year Chart -->
        <div v-if="dashboardStore.gigsPerYearData.length > 0">
          <GigsPerYearChart :data="dashboardStore.gigsPerYearData" />
        </div>
        
        <!-- Ticket Price Chart -->
        <div v-if="dashboardStore.priceChartData.length > 0">
          <TicketPriceChart :data="dashboardStore.priceChartData" />
        </div>
      </div>

      <!-- Interesting Insights Section -->
      <div v-if="dashboardStore.interestingInsights" class="card bg-gradient-to-br from-accent/10 to-accent/5 shadow-xl border border-accent/20">
        <div class="card-body">
          <h2 class="card-title text-2xl font-bold text-accent mb-4">
            <Icon name="mdi:lightbulb" class="w-6 h-6" />
            Interesting Insights
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="stat bg-base-100 rounded-lg shadow">
              <div class="stat-title">Longest Setlist</div>
              <div class="stat-value text-2xl text-accent">{{ dashboardStore.interestingInsights.longestSetlist?.songCount || 0 }}</div>
              <div class="stat-desc">{{ dashboardStore.interestingInsights.longestSetlist?.artistName || 'N/A' }}</div>
              <div class="stat-desc text-xs">{{ dashboardStore.interestingInsights.longestSetlist?.venueName || '' }}</div>
            </div>
            <div class="stat bg-base-100 rounded-lg shadow">
              <div class="stat-title">Longest Gig Streak</div>
              <div class="stat-value text-2xl text-accent">{{ dashboardStore.interestingInsights.longestGigStreak || 0 }}</div>
              <div class="stat-desc">consecutive days</div>
            </div>
            <div class="stat bg-base-100 rounded-lg shadow">
              <div class="stat-title">Average Gigs Per Year</div>
              <div class="stat-value text-2xl text-accent">{{ dashboardStore.interestingInsights.averageGigsPerYear?.toFixed(1) || 0 }}</div>
              <div class="stat-desc">across all years</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Lists Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Top Artists -->
        <div class="card bg-base-100 shadow-xl border border-primary/20">
          <div class="card-body">
            <h3 class="card-title text-xl font-bold text-primary">
              <Icon name="mdi:trophy" class="w-5 h-5" />
              Top Artists
            </h3>
            <div class="overflow-x-auto">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Artist</th>
                    <th>Gigs</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(artist, index) in dashboardStore.topArtists.slice(0, 5)" :key="artist.artistId">
                    <td>{{ index + 1 }}</td>
                    <td class="font-semibold">{{ artist.artistName }}</td>
                    <td class="text-primary font-bold">{{ artist.totalAppearances }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Top Venues -->
        <div class="card bg-base-100 shadow-xl border border-secondary/20">
          <div class="card-body">
            <h3 class="card-title text-xl font-bold text-secondary">
              <Icon name="mdi:trophy" class="w-5 h-5" />
              Top Venues
            </h3>
            <div class="overflow-x-auto">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Venue</th>
                    <th>Gigs</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(venue, index) in dashboardStore.topVenues.slice(0, 5)" :key="venue.venueId">
                    <td>{{ index + 1 }}</td>
                    <td class="font-semibold">{{ venue.venueName }}</td>
                    <td class="text-secondary font-bold">{{ venue.gigCount }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Top Cities -->
        <div class="card bg-base-100 shadow-xl border border-accent/20">
          <div class="card-body">
            <h3 class="card-title text-xl font-bold text-accent">
              <Icon name="mdi:trophy" class="w-5 h-5" />
              Top Cities
            </h3>
            <div class="overflow-x-auto">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>City</th>
                    <th>Gigs</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(city, index) in dashboardStore.topCities.slice(0, 5)" :key="city.city">
                    <td>{{ index + 1 }}</td>
                    <td class="font-semibold">{{ city.city }}</td>
                    <td class="text-accent font-bold">{{ city.gigCount }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Most Heard Songs -->
      <div v-if="dashboardStore.mostHeardSongs.length > 0" class="card bg-base-100 shadow-xl border border-primary/20">
        <div class="card-body">
          <h3 class="card-title text-2xl font-bold text-primary mb-4">
            <Icon name="mdi:music-note-eighth" class="w-6 h-6" />
            Most Heard Songs
          </h3>
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Song</th>
                  <th>Artist</th>
                  <th>Times Heard</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(song, index) in dashboardStore.mostHeardSongs.slice(0, 10)" :key="song.songId">
                  <td>{{ index + 1 }}</td>
                  <td class="font-semibold">{{ song.songTitle }}</td>
                  <td class="text-sm">{{ song.artistName }}</td>
                  <td class="text-primary font-bold">{{ song.timesHeard }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDashboardStore } from '~/store/DashboardStore';
import StatCard from '~/components/dashboard/StatCard.vue';
import TicketPriceChart from '~/components/dashboard/TicketPriceChart.vue';
import GigsPerYearChart from '~/components/dashboard/GigsPerYearChart.vue';
import { format, parseISO } from 'date-fns';

const dashboardStore = useDashboardStore();

const hasAnyData = computed(() => {
  return dashboardStore.stats || 
         dashboardStore.priceChartData.length > 0 ||
         dashboardStore.gigsPerYearData.length > 0;
});

useHead({
  title: 'Home - Gig Stats',
  meta: [
    { name: 'description', content: 'Welcome to my gigs dashboard with statistics and trends.' }
  ]
});

// Fetch dashboard data on mount
onMounted(() => {
  dashboardStore.fetchAll();
});
</script>
