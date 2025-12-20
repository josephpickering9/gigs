<template>
  <Table
    :columns="columns"
    :data="gigs"
    :sort-column="sortColumn"
    :sort-direction="sortDirection"
    @sort="$emit('sort', $event)"
  >
    <template #cell-date="{ row }">
      <div class="font-medium whitespace-nowrap">{{ formatDate(row.date) }}</div>
    </template>

    <template #cell-headliner="{ row }">
      <NuxtLink
        :to="`/gigs/edit/${row.id}`"
        class="font-bold text-primary hover:text-primary-focus transition-colors"
      >
        {{ getHeadliner(row) }}
      </NuxtLink>
    </template>

    <template #cell-venue="{ row }">
        <div class="flex items-center gap-2">
            <Icon name="mdi:map-marker" class="w-4 h-4 text-secondary shrink-0" />
            <span>{{ row.venueName }}</span>
        </div>
    </template>

    <template #cell-support="{ row }">
      <span class="text-sm text-base-content/70 line-clamp-1">{{ getSupportActs(row) }}</span>
    </template>

    <template #cell-cost="{ row }">
        <div class="flex items-center gap-2">
            <span v-if="row.ticketCost" class="font-bold whitespace-nowrap">£{{ row.ticketCost.toFixed(2) }}</span>
            <span class="text-xs text-base-content/60 badge badge-outline badge-sm whitespace-nowrap">{{ row.ticketType }}</span>
        </div>
    </template>

    <template #cell-actions="{ row }">
      <NuxtLink
        :to="`/gigs/edit/${row.id}`"
        class="btn btn-ghost btn-sm btn-square"
      >
        <Icon name="heroicons:pencil-square" class="w-5 h-5 text-primary" />
      </NuxtLink>
    </template>
  </Table>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { format } from 'date-fns'
import type { GetGigResponse } from '~~/api'
import Table, { type TableColumn } from '~/components/ui/table/Table.vue'

interface Props {
  gigs: GetGigResponse[]
  sortColumn?: string | null
  sortDirection?: 'asc' | 'desc'
}

withDefaults(defineProps<Props>(), {
  sortColumn: null,
  sortDirection: 'asc',
})

defineEmits<{
  sort: [column: string]
}>()

const columns = computed<TableColumn[]>(() => [
  {
    key: 'date',
    label: 'Date',
    sortable: true,
    thClass: 'w-32',
  },
  {
    key: 'headliner',
    label: 'Headliner',
    sortable: true,
  },
  {
    key: 'venue',
    label: 'Venue',
    sortable: true,
  },
  {
    key: 'support',
    label: 'Support Acts',
    sortable: false,
    thClass: 'hidden lg:table-cell',
    tdClass: 'hidden lg:table-cell',
  },
  {
    key: 'cost',
    label: 'Ticket',
    sortable: true,
    thClass: 'w-32',
  },
  {
    key: 'actions',
    label: '',
    sortable: false,
    thClass: 'w-16',
  },
])

function formatDate(dateString?: string): string {
    if (!dateString) return 'TBA';
    try {
        return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
        return dateString;
    }
}

function getHeadliner(gig: GetGigResponse): string {
    return gig.acts?.find(act => act.isHeadliner)?.name || 'TBA';
}

function getSupportActs(gig: GetGigResponse): string {
    return gig.acts?.filter(act => !act.isHeadliner).map(act => act.name).join(', ') || '-';
}
</script>
