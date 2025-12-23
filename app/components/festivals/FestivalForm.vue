<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div class="card bg-base-200/50 shadow-sm">
      <div class="card-body">
        <h3 class="card-title text-lg mb-4">
          <Icon name="mdi:party-popper" class="w-5 h-5" />
          Festival Details
        </h3>
        
        <div class="space-y-4">
          <TextInput
            v-model="form.name"
            label="Name"
            placeholder="e.g. Glastonbury"
            :error="errors['name']"
          />

          <TextInput
            v-model="imageUrlProxy"
            label="Image URL"
            placeholder="https://..."
            :error="errors['imageUrl']"
          />

          <TextInput
            v-model="yearProxy"
            label="Year"
            placeholder="e.g. 2023"
            type="number"
            :error="errors['year']"
          />

          <GigSelector
            v-model="selectedGigIds"
            :initial-gigs="initialData?.gigs || undefined"
          />
        </div>
      </div>
    </div>

    <!-- Form Actions -->
    <div class="flex justify-between items-center gap-3 pt-4">
      <div>
        <slot name="left-actions" />
      </div>
      
      <div class="flex gap-3">
        <button type="button" class="btn btn-ghost" @click="$emit('cancel')">
            Cancel
        </button>
        <button type="submit" class="btn btn-primary gap-2" :disabled="loading">
            <span v-if="loading" class="loading loading-spinner" />
            <Icon v-else name="mdi:content-save" class="w-5 h-5" />
            {{ submitLabel }}
        </button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { UpsertFestivalRequest, FestivalDto } from '~~/api';
import TextInput from '~/components/ui/input/TextInput.vue';
import GigSelector from '~/components/gigs/GigSelector.vue';

const props = defineProps<{
  initialData?: FestivalDto;
  loading?: boolean;
  submitLabel?: string;
}>();

const emit = defineEmits<{
  (e: 'submit', data: UpsertFestivalRequest, gigIds: string[]): void;
  (e: 'cancel'): void;
}>();

const form = ref<UpsertFestivalRequest>({
  name: '',
  year: null,
  imageUrl: '',
});

const selectedGigIds = ref<string[]>([]);

const imageUrlProxy = computed({
    get: () => form.value.imageUrl || '',
    set: (val: string) => form.value.imageUrl = val
});

const yearProxy = computed({
    get: () => form.value.year?.toString() || '',
    set: (val: string) => form.value.year = val ? parseInt(val) : null
});

const errors = ref<Record<string, string>>({});

watch(() => props.initialData, (newData) => {
    if (newData) {
        form.value = {
            name: newData.name || '',
            year: newData.year || null,
            imageUrl: newData.imageUrl || '',
        };
        selectedGigIds.value = newData.gigs?.map(g => g.id!).filter(Boolean) || [];
    }
}, { immediate: true });

const validate = () => {
    errors.value = {};
    let isValid = true;

    if (!form.value.name) {
        errors.value['name'] = 'Name is required';
        isValid = false;
    }

    return isValid;
};

const handleSubmit = () => {
    if (!validate()) return;
    emit('submit', form.value, selectedGigIds.value);
};
</script>
