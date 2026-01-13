<template>
  <div class="card bg-base-200/50 shadow-sm border border-base-content/5">
    <div class="card-body">
      <div class="flex items-center gap-2 mb-6">
        <div class="p-2 bg-primary/10 rounded-lg">
           <Icon name="mdi:account-music" class="w-5 h-5 text-primary" />
        </div>
        <div>
           <h3 class="card-title text-lg">Artists &amp; Lineup</h3>
           <p class="text-sm text-base-content/60">Select the performers for this gig</p>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Headliners Section -->
        <div class="space-y-4">
          <div class="flex items-center gap-2 pb-2 border-b border-base-content/10">
            <div class="badge badge-accent badge-lg gap-2 shadow-sm">
              <Icon name="mdi:star" class="w-4 h-4" />
              Headliners
            </div>
            <span class="text-xs text-base-content/50 uppercase tracking-widest font-semibold ml-auto">Main Acts</span>
          </div>
          
          <div class="bg-base-100 rounded-xl p-4 border border-base-300">
             <Combobox
                v-model="headlinersModel"
                :options="artistOptions"
                placeholder="Search or add headliners..."
                class="w-full"
                :error="errors['artistIds']"
            />
            <p class="text-xs text-base-content/40 mt-2 ml-1">
                <Icon name="mdi:information-outline" class="w-3 h-3 inline mr-1"/>
                These artists will be highlighted on the event page.
            </p>
          </div>
        </div>

        <!-- Support Acts Section -->
        <div class="space-y-4">
          <div class="flex items-center gap-2 pb-2 border-b border-base-content/10">
            <div class="badge badge-ghost badge-lg gap-2 shadow-sm">
              <Icon name="mdi:account-group" class="w-4 h-4" />
              Support Acts
            </div>
            <span class="text-xs text-base-content/50 uppercase tracking-widest font-semibold ml-auto">Opening Acts</span>
          </div>
          
           <div class="bg-base-100 rounded-xl p-4 border border-base-300">
            <Combobox
                v-model="supportActsModel"
                :options="artistOptions"
                placeholder="Search or add support..."
                class="w-full"
            />
             <p class="text-xs text-base-content/40 mt-2 ml-1">
                <Icon name="mdi:information-outline" class="w-3 h-3 inline mr-1"/>
                Supporting artists and opening acts.
            </p>
          </div>
        </div>
      </div>
      
      <div class="mt-6 flex items-start gap-3 text-sm text-base-content/70 bg-base-300/30 rounded-xl p-4 border border-base-content/5">
        <Icon name="mdi:lightbulb-on-outline" class="w-5 h-5 text-warning flex-shrink-0" />
        <div class="space-y-1">
            <p class="font-medium text-base-content">Tip: Multiple Selections</p>
            <span class="leading-relaxed">You can select multiple artists. New artists can be typed in but may need to be saved separately in the Artist Manager if they don't exist.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Combobox from '~/components/ui/input/Combobox.vue';
import type { SelectListItem } from '~/types/SelectListItem';

const props = defineProps<{
  headliners: SelectListItem[];
  supportActs: SelectListItem[];
  artistOptions: SelectListItem[];
  errors: Record<string, string>;
}>();

const emit = defineEmits<{
  (e: 'update:headliners' | 'update:supportActs', value: SelectListItem[]): void;
}>();

const headlinersModel = computed({
  get: () => props.headliners,
  set: (val) => emit('update:headliners', val),
});

const supportActsModel = computed({
  get: () => props.supportActs,
  set: (val) => emit('update:supportActs', val),
});
</script>
