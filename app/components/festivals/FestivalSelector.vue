<template>
  <div class="form-control w-full">
    <Combobox
      v-model="selected"
      label="Festival"
      placeholder="Search or add festival..."
      :options="options"
      :multiple="false"
      :loading="loading"
      :error="error"
      class="w-full"
      @update:modelValue="onUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useGigStore } from '~/store/GigStore';
import Combobox from '~/components/ui/input/Combobox.vue';
import type { SelectListItem } from '~/types/SelectListItem';

const props = defineProps<{
  modelValue?: string | null;
  initialName?: string | null;
  error?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void;
  (e: 'update:name', value: string | null): void;
}>();

const gigStore = useGigStore();
const festivals = computed(() => gigStore.festivals);
const loading = computed(() => gigStore.loadingFestivals);

const selected = ref<SelectListItem[]>([]);

const options = computed<SelectListItem[]>(() => 
  festivals.value.map(f => ({ 
    text: f.year ? `${f.name} (${f.year})` : (f.name || 'Unknown'), 
    value: f.id || '' 
  }))
);

onMounted(() => {
  if (gigStore.festivals.length === 0) {
    gigStore.fetchFestivals();
  }
});

// Watch for external model changes
watch(() => props.modelValue, (newVal) => {
  syncSelected(newVal, props.initialName);
}, { immediate: true });

// Watch for festivals loading to re-sync if needed
watch(festivals, () => {
  syncSelected(props.modelValue, props.initialName);
});

function syncSelected(id?: string | null, name?: string | null) {
  if (id) {
    const fest = festivals.value.find(f => f.id === id);
    if (fest) {
      const text = fest.year ? `${fest.name} (${fest.year})` : (fest.name || 'Unknown');
      selected.value = [{ text, value: fest.id || '' }];
      return;
    }
  }
  
  // If we have a name but no ID match (or no ID), it might be a new festival or just name provided
  if (!id && name) {
       // Check if we can find by name
       const fest = festivals.value.find(f => f.name === name);
       if(fest) {
           const text = fest.year ? `${fest.name} (${fest.year})` : (fest.name || 'Unknown');
           selected.value = [{ text, value: fest.id || '' }];
       } else {
           // Truly new or not found
           selected.value = [{ text: name, value: name }]; 
       }
  } else if (!id && !name) {
      selected.value = [];
  }
}

const onUpdate = (val: SelectListItem[]) => {
  const first = val[0];
  if (first) {
    const value = String(first.value); // This is ID if found, or text if new/typed
    const text = first.text;

    const existing = festivals.value.find(f => f.id === value);
    if (existing) {
      emit('update:modelValue', existing.id || null);
      emit('update:name', existing.name || null);
    } else {
      // Assuming new festival
      emit('update:modelValue', null); // No ID for new festival
      emit('update:name', text);
    }
  } else {
    emit('update:modelValue', null);
    emit('update:name', null);
  }
};
</script>
