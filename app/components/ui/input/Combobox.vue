<template>
  <FormElementContainer :label="label">
    <div ref="containerRef" class="relative">
      <div 
        class="input input-bordered flex flex-wrap gap-2 min-h-[3rem] h-auto p-2"
        :class="{ 'input-focus': isFocused }"
        @click="focusInput"
      >
        <span 
            v-for="(item, index) in modelValue" 
            :key="item.value || item.text" 
            class="badge badge-primary gap-1 p-3"
        >
            {{ item.text }}
            <button type="button" class="hover:text-white/80" @click.stop="removeItem(index)">
                <Icon name="heroicons:x-mark" class="w-4 h-4" />
            </button>
        </span>
        
        <input
            ref="inputRef"
            v-model="query"
            type="text"
            class="bg-transparent outline-none flex-1 min-w-[150px]"
            :placeholder="modelValue?.length === 0 ? placeholder : ''"
            @focus="open"
            @blur="handleBlur"
            @keydown.backspace="handleBackspace"
            @keydown.enter.prevent="handleEnter"
            @keydown.down.prevent="highlightNext"
            @keydown.up.prevent="highlightPrev"
            @keydown.tab="close"
            @keydown.escape="close"
        >
        
         <!-- Clear Button -->
         <button 
            v-if="modelValue?.length > 0"
            type="button" 
            class="ml-auto text-base-content/40 hover:text-base-content"
            @click.stop="clear"
          >
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
      </div>

      <!-- Dropdown -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="isOpen && (filteredOptions.length > 0 || query)"
          class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-base-100 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:ring-white/10 sm:text-sm"
        >
          <ul class="w-full">
            <li
              v-for="(option, index) in filteredOptions"
              :key="option.value.toString()"
              class="relative cursor-pointer select-none px-4 py-2 hover:bg-base-200 flex items-center justify-between"
              :class="{ 'bg-base-200': highlightedIndex === index }"
              @mousedown.prevent.stop="selectOption(option)"
              @mouseenter="highlightedIndex = index"
            >
              <div class="flex items-center gap-2">
                  <Icon v-if="option.icon" :name="option.icon" class="w-5 h-5 text-gray-400" />
                  <span class="block truncate" :class="{ 'font-semibold': isSelected(option) }">
                    {{ option.text }}
                  </span>
              </div>
              <Icon v-if="isSelected(option)" name="heroicons:check" class="w-5 h-5 text-primary" />
            </li>
            
            <li 
                v-if="query && !filteredOptions.some(o => o.text.toLowerCase() === query.toLowerCase())"
                 class="relative cursor-pointer select-none px-4 py-2 hover:bg-base-200 text-info"
                 :class="{ 'bg-base-200': highlightedIndex === filteredOptions.length }"
                 @mousedown.prevent="selectCustom"
                 @mouseenter="highlightedIndex = filteredOptions.length"
            >
                <span class="block truncate">
                    Create "<strong>{{ query }}</strong>"
                </span>
            </li>
          </ul>
        </div>
      </Transition>
    </div>
  </FormElementContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import FormElementContainer from '~/components/ui/form/FormElementContainer.vue';
import type { SelectListItem } from '~/types/SelectListItem';

const props = withDefaults(defineProps<{
    modelValue?: SelectListItem[];
    options?: SelectListItem[];
    label?: string;
    placeholder?: string;
    multiple?: boolean;
}>(), {
    modelValue: () => [],
    options: () => [],
    label: '',
    placeholder: 'Search...',
    multiple: true,
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: SelectListItem[]): void;
}>();

const containerRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const query = ref('');
const isOpen = ref(false);
const isFocused = ref(false);
const highlightedIndex = ref(0);
const blurTimeout = ref<NodeJS.Timeout | null>(null); // Add blurTimeout ref

const filteredOptions = computed(() => {
    if (!query.value) return props.options;
    return props.options.filter(opt => 
        opt.text.toLowerCase().includes(query.value.toLowerCase())
    );
});

const isSelected = (option: SelectListItem) => {
    return props.modelValue?.some(item => item.value === option.value);
};

const focusInput = () => {
    inputRef.value?.focus();
};

const open = () => {
    isOpen.value = true;
    isFocused.value = true;
    highlightedIndex.value = 0;
};

const close = () => {
    isOpen.value = false;
    highlightedIndex.value = 0;
};

const handleBlur = () => {
    // Just track focus state
    if (blurTimeout.value) clearTimeout(blurTimeout.value);
    
    blurTimeout.value = setTimeout(() => {
        // Only close if we didn't just click an option (which handles close/focus via selectOption)
        // But here we mainly want to close if clicking strictly OUTSIDE.
        // Actually, logic is usually handled by clickOutside.
        // But we want to clear query on blur?
        isFocused.value = false;
        // query.value = ''; // Optional
    }, 200);
};

const cancelBlur = () => { // Helper
    if (blurTimeout.value) {
        clearTimeout(blurTimeout.value);
        blurTimeout.value = null;
    }
};

const selectOption = (option: SelectListItem) => {
    cancelBlur();

    if (props.multiple) {
        if (!isSelected(option)) {
            emit('update:modelValue', [...(props.modelValue ?? []), option]);
        }
        // Keep open and focus
        isOpen.value = true;
        inputRef.value?.focus();
    } else {
        // Single select: Replace entire value
        emit('update:modelValue', [option]);
        close(); 
        isFocused.value = false; // Blur
    }
    
    query.value = '';
};

const selectCustom = () => {
    cancelBlur();
    if (!query.value.trim()) return;
    
    const newOption: SelectListItem = {
        text: query.value.trim(),
        value: `new:${query.value.trim()}`, 
    };
    
    if (props.multiple) {
        if (!props.modelValue?.some(item => item.text.toLowerCase() === newOption.text.toLowerCase())) {
             emit('update:modelValue', [...(props.modelValue ?? []), newOption]);
        }
        isOpen.value = true;
        inputRef.value?.focus();
    } else {
         emit('update:modelValue', [newOption]);
         close();
    }
    
    query.value = '';
};

const removeItem = (index: number) => {
    const newValue = [...props.modelValue ?? []];
    newValue.splice(index, 1);
    emit('update:modelValue', newValue);
};

const clear = () => {
    emit('update:modelValue', []);
};

const handleBackspace = () => {
    // Safe check for modelValue length
    const len = props.modelValue?.length || 0;
    if (!query.value && len > 0) {
        removeItem(len - 1);
    }
};

const handleEnter = () => {
    if (!isOpen.value) {
        open();
        return;
    }
    
    if (highlightedIndex.value < filteredOptions.value.length) {
        selectOption(filteredOptions.value[highlightedIndex.value]);
    } else if (query.value) {
        selectCustom();
    }
};

const highlightNext = () => {
    if (!isOpen.value) {
        open();
        return;
    }
    const maxIndex = filteredOptions.value.length + (query.value ? 1 : 0) - 1;
    if (highlightedIndex.value < maxIndex) {
        highlightedIndex.value++;
    } else {
        highlightedIndex.value = 0;
    }
};

const highlightPrev = () => {
    if (!isOpen.value) {
        open();
        return;
    }
     const maxIndex = filteredOptions.value.length + (query.value ? 1 : 0) - 1;
    if (highlightedIndex.value > 0) {
        highlightedIndex.value--;
    } else {
        highlightedIndex.value = maxIndex;
    }
};

const onClickOutside = (event: MouseEvent) => {
    if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
        close();
        isFocused.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', onClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', onClickOutside);
});


</script>

<style scoped>
.input-focus {

}
</style>
