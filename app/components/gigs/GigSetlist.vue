<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title text-2xl mb-4 font-bold text-primary">
        <Icon name="mdi:playlist-music" class="w-6 h-6 mr-2" />
        Setlist
      </h2>
      
      <div v-if="!hasSongs" class="text-gray-500 italic">
        No setlist available for this gig.
      </div>

      <div v-else>
        <div v-for="act in actsWithSetlists" :key="act.artistId" class="mb-6 last:mb-0">
          <div class="flex items-center gap-3 mb-3">
            <img 
              v-if="!isEmpty(act.imageUrl)" 
              :src="getImageUrl(act.imageUrl)" 
              :alt="act.name"
              class="w-12 h-12 rounded-full object-cover ring-2 ring-base-300"
            >
            <div>
              <h3 class="text-lg font-semibold text-secondary flex items-center gap-2">
                {{ act.name }}
                <span v-if="act.isHeadliner" class="badge badge-primary badge-sm">Headliner</span>
                <span v-else class="badge badge-ghost badge-sm">Support</span>
              </h3>
            </div>
          </div>
          <ol class="list-decimal list-inside space-y-1 ml-2">
            <li v-for="(song, index) in act.setlist" :key="index" class="text-gray-700 dark:text-gray-300">
              <span class="mr-2">{{ song.title }}</span>
              <span v-if="song.isEncore" class="badge badge-xs badge-secondary badge-outline gap-1" title="Encore">
                <Icon name="mdi:star" class="w-3 h-3" />
                Encore
              </span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GetGigResponse } from '~~/api';
import { getImageUrl } from '~/utils/image-helper';
import { isEmpty } from 'lodash-es';

const props = defineProps<{
  gig: GetGigResponse;
}>();

const actsWithSetlists = computed(() => {
  if (!props.gig.acts) return [];
  return props.gig.acts.filter(act => act.setlist && act.setlist.length > 0);
});

const hasSongs = computed(() => actsWithSetlists.value.length > 0);
</script>
