<template>
  <div class="space-y-6">
    <div class="card bg-base-200/50 shadow-sm border border-base-content/5">
      <div class="card-body p-4 sm:p-6 md:p-8">
        <h3 class="card-title text-lg mb-4 flex items-center gap-2">
            <div class="p-2 bg-accent/10 rounded-lg">
                <Icon name="mdi:music-note-eighth" class="w-5 h-5 text-accent" />
            </div>
            Festival Lineup
        </h3>
        
        <p class="text-sm text-base-content/60 mb-6">Search and add gigs to this festival.</p>

        <GigSelector
            v-model="selectedGigIdsProxy"
            :initial-gigs="initialGigs"
            :hide-selected-gigs="true"
        />
      </div>
    </div>

    <div v-if="selectedGigIds.length > 0" class="card bg-base-200/50 shadow-sm border border-base-content/5">
      <div class="card-body p-4 sm:p-6 md:p-8">
        <div v-if="loadingGigs" class="flex justify-center py-12">
            <span class="loading loading-spinner loading-lg text-primary" />
        </div>

        <div v-else class="space-y-6">
            <div v-for="group in gigGroups" :key="group.dateKey" class="bg-base-100 rounded-xl p-4 shadow-sm border border-base-content/5">
                <h4 class="font-bold text-md mb-3 flex items-center gap-2 text-base-content/80 uppercase tracking-wide text-xs">
                    <Icon name="mdi:calendar" class="w-4 h-4 text-secondary" />
                    {{ group.title }}
                </h4>
                
                <Draggable 
                    v-model="group.gigs" 
                    item-key="id"
                    handle=".drag-handle"
                    class="space-y-2"
                    @end="$emit('updateOrders', group.dateKey, group.gigs)"
                >
                    <template #item="{ element }">
                        <div class="flex items-center gap-3 bg-base-200/50 p-3 rounded-lg hover:bg-base-200 transition-colors border border-transparent hover:border-base-300 group">
                            <button type="button" class="drag-handle btn btn-circle btn-ghost btn-sm cursor-grab active:cursor-grabbing touch-manipulation">
                                <Icon name="mdi:drag" class="w-5 h-5 text-base-content/50 group-hover:text-base-content" />
                            </button>
                            
                            <div class="flex-1 min-w-0">
                                <div class="font-bold truncate">
                                    {{ getHeadlinerName(element) }}
                                </div>
                                <div class="text-xs text-base-content/60 flex flex-wrap gap-2 truncate">
                                    <span v-if="element.venueName" class="flex items-center gap-1">
                                        <Icon name="mdi:map-marker" class="w-3 h-3" />
                                        {{ element.venueName }}
                                    </span>
                                    <span v-if="getSupportActs(element)" class="flex items-center gap-1">
                                        <Icon name="mdi:account-group" class="w-3 h-3" />
                                        {{ getSupportActs(element) }}
                                    </span>
                                </div>
                            </div>
                            
                            <button type="button" class="btn btn-ghost btn-sm btn-circle text-error/70 hover:text-error" @click="$emit('removeGig', element.id)">
                                <Icon name="heroicons:trash" class="w-5 h-5" />
                            </button>
                        </div>
                    </template>
                </Draggable>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { GetGigResponse } from '~~/api';
import GigSelector from '~/components/gigs/GigSelector.vue';
import Draggable from 'vuedraggable';

const props = defineProps<{
  selectedGigIds: string[];
  initialGigs?: GetGigResponse[];
  gigGroups: any[];
  loadingGigs: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:selectedGigIds', value: string[]): void;
  (e: 'updateOrders', dateKey: string, gigs: GetGigResponse[]): void;
  (e: 'removeGig', id: string): void;
}>();

const selectedGigIdsProxy = computed({
    get: () => props.selectedGigIds,
    set: (val) => emit('update:selectedGigIds', val)
});

const getHeadlinerName = (gig: GetGigResponse) => {
    return gig.acts?.find((a: any) => a.isHeadliner)?.name || 'Unknown Artist';
};

const getSupportActs = (gig: GetGigResponse) => {
    return gig.acts?.filter((a: any) => !a.isHeadliner).map((a: any) => a.name).join(', ');
};
</script>
