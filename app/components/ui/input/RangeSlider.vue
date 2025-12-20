<template>
  <FormElementContainer :label="label" :error="error">
    <div class="flex items-center gap-4">
      <input 
        type="range" 
        :min="min" 
        :max="max" 
        :step="step" 
        :value="modelValue || 0" 
        class="range range-primary range-sm flex-1" 
        @input="handleInput"
      />
      <div class="badge badge-lg font-mono min-w-[3rem]">
        £{{ Number(modelValue || 0).toFixed(2) }}
      </div>
    </div>
  </FormElementContainer>
</template>

<script setup lang="ts">
import FormElementContainer from '~/components/ui/form/FormElementContainer.vue';

interface Props {
  modelValue?: number | null;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  label: undefined,
  min: 0,
  max: 100,
  step: 1,
  error: undefined,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', Number(target.value));
};
</script>
