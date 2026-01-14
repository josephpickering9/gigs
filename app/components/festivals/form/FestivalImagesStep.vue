<template>
  <div class="card bg-base-200/50 shadow-sm border border-base-content/5">
    <div class="card-body p-4 sm:p-6 md:p-8">
      <h3 class="card-title text-lg mb-4 flex items-center gap-2">
        <div class="p-2 bg-accent/10 rounded-lg">
           <Icon name="mdi:image-album" class="w-5 h-5 text-accent" />
        </div>
        Festival Imagery
      </h3>

      <div class="space-y-6">
        <div>
            <TextInput
                v-model="imageUrlProxy"
                label="Image URL"
                placeholder="https://..."
                type="url"
                :error="errors['imageUrl']"
            />
            <div v-if="imageUrlProxy" class="mt-4 p-2 bg-base-100/50 rounded-lg border border-base-content/5 inline-block">
                <img :src="imageUrlProxy" alt="Festival Image Preview" class="h-48 w-auto object-cover rounded-md shadow-sm" >
            </div>
        </div>

        <div class="divider"/>

        <div>
            <TextInput
                v-model="posterImageUrlProxy"
                label="Poster Image URL"
                placeholder="https://..."
                type="url"
                :error="errors['posterImageUrl']"
            />
            <div v-if="posterImageUrlProxy" class="mt-4 p-2 bg-base-100/50 rounded-lg border border-base-content/5 inline-block">
                <img :src="posterImageUrlProxy" alt="Poster Image Preview" class="h-64 w-auto object-cover rounded-md shadow-sm" >
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { UpsertFestivalRequest } from '~~/api';
import TextInput from '~/components/ui/input/TextInput.vue';

const props = defineProps<{
  form: UpsertFestivalRequest;
  errors: Record<string, string>;
}>();

const emit = defineEmits<{
  (e: 'update:form', value: UpsertFestivalRequest): void;
}>();

const imageUrlProxy = computed({
    get: () => props.form.imageUrl || '',
    set: (val: string) => emit('update:form', { ...props.form, imageUrl: val })
});

const posterImageUrlProxy = computed({
    get: () => props.form.posterImageUrl || '',
    set: (val: string) => emit('update:form', { ...props.form, posterImageUrl: val })
});
</script>
