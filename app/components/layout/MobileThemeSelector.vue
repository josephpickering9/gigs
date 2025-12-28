<template>
  <div class="flex items-center gap-2">
    <!-- Trigger Button -->
    <button
      class="flex w-full items-center justify-between gap-3 rounded-lg justify-between transition-colors hover:bg-base-200 active:bg-base-300"
      @click="isOpen = true"
    >
      <div class="flex w-full items-center gap-3">
        <div
          class="grid shrink-0 grid-cols-2 gap-1 rounded-md border border-base-content/10 bg-base-100 p-1.5"
        >
          <div class="size-2 rounded-full bg-base-content" />
          <div class="size-2 rounded-full bg-primary" />
          <div class="size-2 rounded-full bg-secondary" />
          <div class="size-2 rounded-full bg-accent" />
        </div>
        <span class="text-base font-medium">Theme</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-base-content/60">{{ capitalize(selectedTheme) }}</span>
        <Icon name="mdi:chevron-right" size="1.2em" class="text-base-content/40" />
      </div>
    </button>

    <!-- Drawer Overlay -->
    <Teleport to="body">
      <Transition name="backdrop">
        <div
          v-if="isOpen"
          class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
          @click="isOpen = false"
        />
      </Transition>

      <!-- Drawer -->
      <Transition name="drawer">
        <div
          v-if="isOpen"
          class="fixed bottom-0 left-0 right-0 z-[101] flex max-h-[85vh] flex-col rounded-t-3xl bg-base-100 shadow-2xl"
        >
          <!-- Header -->
          <div class="sticky top-0 z-10 flex items-center justify-between border-b border-base-content/10 bg-base-100 px-6 py-4">
            <h3 class="text-lg font-semibold">Choose Theme</h3>
            <button
              class="btn btn-circle btn-ghost btn-sm"
              @click="isOpen = false"
              aria-label="Close"
            >
              <Icon name="mdi:close" size="1.5em" />
            </button>
          </div>

          <!-- Theme Grid -->
          <div class="overflow-y-auto px-6 py-6">
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="theme in themes"
                :key="theme"
                class="group relative flex flex-col gap-3 rounded-xl border-2 p-4 transition-all active:scale-95"
                :class="[
                  selectedTheme === theme
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-base-content/10 hover:border-base-content/20 active:border-primary/50'
                ]"
                @click="changeTheme(theme)"
              >
                <!-- Color Preview -->
                <div
                  :data-theme="theme"
                  class="grid grid-cols-4 gap-1.5 rounded-lg bg-base-100 p-2 shadow-sm"
                >
                  <div class="aspect-square rounded-full bg-base-content" />
                  <div class="aspect-square rounded-full bg-primary" />
                  <div class="aspect-square rounded-full bg-secondary" />
                  <div class="aspect-square rounded-full bg-accent" />
                </div>

                <!-- Theme Name -->
                <div class="flex items-center justify-between gap-2">
                  <span class="truncate text-sm font-medium capitalize">{{ theme }}</span>
                  <Transition name="check">
                    <Icon
                      v-if="selectedTheme === theme"
                      name="mdi:check-circle"
                      size="1.2em"
                      class="shrink-0 text-primary"
                    />
                  </Transition>
                </div>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, capitalize } from 'vue'
import { useThemeStore } from '~/store/ThemeStore'

const themes = [
  'light',
  'dark',
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'synthwave',
  'retro',
  'cyberpunk',
  'valentine',
  'halloween',
  'garden',
  'forest',
  'aqua',
  'lofi',
  'pastel',
  'fantasy',
  'wireframe',
  'black',
  'luxury',
  'dracula',
  'cmyk',
  'autumn',
  'business',
  'acid',
  'lemonade',
  'night',
  'coffee',
  'winter',
  'dim',
  'nord',
  'sunset',
]

const themeStore = useThemeStore()
const selectedTheme = computed(() => themeStore.selectedTheme)
const isOpen = ref(false)

const changeTheme = (theme: string) => {
  themeStore.selectedTheme = theme
  if (import.meta.client) {
    document.documentElement.setAttribute('data-theme', theme)
  }
  // Close drawer after a short delay for visual feedback
  setTimeout(() => {
    isOpen.value = false
  }, 300)
}
</script>

<style scoped>
/* Backdrop transitions */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* Drawer transitions */
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateY(100%);
}

/* Checkmark transitions */
.check-enter-active,
.check-leave-active {
  transition: all 0.2s ease;
}

.check-enter-from,
.check-leave-to {
  opacity: 0;
  transform: scale(0.5);
}
</style>
