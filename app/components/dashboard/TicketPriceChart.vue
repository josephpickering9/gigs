<template>
  <div class="card bg-base-100 shadow-xl border border-primary/20">
    <div class="card-body">
      <h2 class="card-title text-2xl font-bold text-primary mb-4">
        <Icon name="mdi:chart-line" class="w-6 h-6" />
        Average Ticket Price by Year
      </h2>
      <div class="w-full" style="height: 300px;">
        <Line v-if="chartData" :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from 'chart.js';
import type { AverageTicketPriceByYearResponse } from '~~/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const props = defineProps<{
  data: AverageTicketPriceByYearResponse[];
}>();

const chartData = computed(() => {
  if (!props.data || props.data.length === 0) return null;

  // Sort by year
  const sortedData = [...props.data].sort((a, b) => (a.year || 0) - (b.year || 0));

  return {
    labels: sortedData.map(d => d.year?.toString() || ''),
    datasets: [
      {
        label: 'Average Price (£)',
        data: sortedData.map(d => d.averagePrice || 0),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };
});

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      borderColor: 'rgb(99, 102, 241)',
      borderWidth: 1,
      titleFont: {
        size: 14,
        weight: 'bold',
      },
      bodyFont: {
        size: 13,
      },
      callbacks: {
        label: (context) => {
          const value = context.parsed.y;
          return value !== null ? `£${value.toFixed(2)}` : '£0.00';
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => `£${value}`,
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
