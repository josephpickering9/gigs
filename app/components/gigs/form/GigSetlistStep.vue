<template>
  <div class="card bg-base-200/50 shadow-sm border border-base-content/5">
    <div class="card-body">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2">
            <div class="p-2 bg-accent/10 rounded-lg">
                <Icon name="mdi:playlist-music" class="w-5 h-5 text-accent" />
            </div>
            <div>
                 <h3 class="card-title text-lg">Setlists</h3>
                 <p class="text-sm text-base-content/60">Manage songs and set orders</p>
            </div>
        </div>
      </div>
      
      <div v-if="acts.length === 0" class="alert alert-info bg-info/10 border-info/20 text-info-content">
        <Icon name="mdi:information" class="w-5 h-5"/>
        <span>No artists selected. Go to the <strong>Lineup</strong> tab to add artists first.</span>
      </div>

      <div v-else class="space-y-4">
        <div v-for="(act, index) in actsModel" :key="act.artistId" class="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
          <input type="checkbox" :name="'setlist-accordion-' + index" :checked="index === 0"> 
          <div class="collapse-title text-base font-medium flex items-center gap-3 py-4">
            <div class="badge gap-1 h-6" :class="act.isHeadliner ? 'badge-accent' : 'badge-ghost'">
              <Icon :name="act.isHeadliner ? 'mdi:star' : 'mdi:account-group'" class="w-3 h-3" />
              {{ act.isHeadliner ? 'Headliner' : 'Support' }}
            </div>
            <span class="font-bold">{{ getArtistName(act.artistId) }}</span>
            <span class="text-xs text-base-content/40 ml-auto mr-2 font-normal">
                {{ (act.setlist?.length || 0) }} song{{ (act.setlist?.length || 0) !== 1 ? 's' : '' }}
            </span>
          </div>
          
          <div class="collapse-content">
            <div class="pt-2">
              <Draggable 
                  v-model="act.setlist" 
                  item-key="order"
                  handle=".drag-handle"
                  class="space-y-2 mb-4"
                  :animation="200"
                  ghost-class="opacity-50"
              >
                  <template #item="{ index: songIndex }">
                       <div class="flex items-center gap-2 group bg-base-200/50 p-2 rounded-lg hover:bg-base-200 transition-colors">
                          <button type="button" class="drag-handle btn btn-ghost btn-sm btn-square cursor-grab active:cursor-grabbing text-base-content/40 hover:text-base-content hover:bg-base-300 touch-manipulation">
                              <Icon name="mdi:drag" class="w-6 h-6" />
                          </button>
                          
                          <div v-if="act.setlist && act.setlist[songIndex]" class="relative flex-1 flex items-center gap-2">
                              <div class="w-6 text-center text-xs font-mono text-base-content/30 select-none">
                                  {{ songIndex + 1 }}
                              </div>
                              <input 
                                  v-model="act.setlist[songIndex].title" 
                                  type="text" 
                                  class="input input-bordered input-sm w-full min-w-[100px] focus:outline-none focus:border-primary" 
                                  placeholder="Song name" 
                                  @keydown.enter.prevent="addSong(index, songIndex + 1)"
                              >
                              
                              <div class="tooltip tooltip-left" :data-tip="act.setlist[songIndex].isEncore ? 'Encore Song' : 'Mark as Encore'">
                                  <label
class="swap swap-rotate btn btn-xs btn-circle transition-all duration-300" 
                                    :class="act.setlist[songIndex].isEncore ? 'btn-secondary text-white shadow-sm' : 'btn-ghost text-base-content/20 hover:text-secondary hover:bg-secondary/10'">
                                      <input v-model="act.setlist[songIndex].isEncore" type="checkbox" >
                                      <Icon name="mdi:star" class="swap-on w-4 h-4" />
                                      <Icon name="mdi:star-outline" class="swap-off w-4 h-4" />
                                  </label>
                              </div>
                          </div>
                          
                          <button 
                              type="button" 
                              class="btn btn-ghost btn-sm btn-square text-error/40 hover:text-error hover:bg-error/10 transition-opacity"
                              @click="removeSong(index, songIndex)"
                          >
                              <Icon name="heroicons:trash" class="w-4 h-4" />
                          </button>
                      </div>
                  </template>
              </Draggable>

               <button 
                  type="button" 
                  class="btn btn-sm btn-ghost gap-2 border-2 border-dashed border-base-content/10 hover:border-primary/50 hover:text-primary hover:bg-primary/5 w-full mt-2 normal-case font-normal"
                  @click="addSong(index)"
              >
                  <Icon name="heroicons:plus" class="w-4 h-4" />
                  Add Song to {{ getArtistName(act.artistId) }}
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGigStore } from '~/store/GigStore';
import Draggable from 'vuedraggable';

// Replicating local type from GigForm
type FormAct = { 
    artistId: string;
    isHeadliner: boolean;
    setlist: Array<{ title: string; order: number; isEncore: boolean }>;
};

const props = defineProps<{
  acts: FormAct[];
}>();

const emit = defineEmits<{
  (e: 'update:acts', value: FormAct[]): void;
}>();

const actsModel = computed({
  get: () => props.acts,
  set: (val) => emit('update:acts', val),
});

const gigStore = useGigStore();

const getArtistName = (id?: string) => {
    if (!id) return 'Unknown Artist';
    if (id.startsWith('new:')) return id.substring(4);
    return gigStore.artists.find(a => a.id === id)?.name || 'Unknown Artist';
};

const addSong = (actIndex: number, afterIndex?: number) => {
    const actsClone = [...props.acts];
    if (!actsClone[actIndex]) return;
    
    const act = actsClone[actIndex];
    if (!act.setlist) act.setlist = [];
    
    const newSong = { title: '', order: (act.setlist.length || 0) + 1, isEncore: false };
    
    if (typeof afterIndex === 'number') {
        act.setlist.splice(afterIndex, 0, newSong);
    } else {
        act.setlist.push(newSong);
    }
    
    // Re-index
    act.setlist.forEach((s, i) => s.order = i + 1);
    
    emit('update:acts', actsClone);
};

const removeSong = (actIndex: number, songIndex: number) => {
    const actsClone = [...props.acts];
    if (!actsClone[actIndex]?.setlist) return;

    const act = actsClone[actIndex];
    
    act.setlist.splice(songIndex, 1);
    act.setlist.forEach((s, i) => s.order = i + 1);
    
    emit('update:acts', actsClone);
};
</script>
