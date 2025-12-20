<template>
  <div class="card bg-base-100 shadow-xl border border-secondary/20">
    <div class="card-body">
      <h2 class="card-title text-2xl font-bold text-secondary mb-4">
        <Icon name="mdi:chart-bar" class="w-6 h-6" />
        Gigs Per Year
      </h2>
      <div class="w-full" style="height: 300px;">
        <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';
import type { GigsPerYearResponse } from '~~/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const props = defineProps<{
  data: GigsPerYearResponse[];
}>();

const chartData = computed(() => {
  if (!props.data || props.data.length === 0) return null;

  const sortedData = [...props.data].sort((a, b) => (a.year || 0) - (b.year || 0));

  return {
    labels: sortedData.map(d => d.year?.toString() || ''),
    datasets: [
      {
        label: 'Gigs',
        data: sortedData.map(d => d.gigCount || 0),
        backgroundColor: 'rgba(168, 85, 247, 0.7)',
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };
});

const chartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      borderColor: 'rgb(168, 85, 247)',
      borderWidth: 1,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        font: {
          size: 12,
        },
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
    },
    x: {
      ticks: {
        font: {
          size: 12,
        },
      },
      grid: {
        display: false,
      },
    },
  },
};
</script>
