<template>
  <div class="mobile-menu fixed left-0 top-16 z-50 flex w-full flex-col overflow-y-auto bg-base-100/95 backdrop-blur-md md:hidden animate-slide-in-right">
    <div class="flex flex-1 flex-col items-center px-6 py-8">
      <ul class="menu flex w-full flex-col items-stretch justify-start gap-2 p-0 text-lg">
        <li class="animate-fade-in-up" style="animation-delay: 100ms">
          <ThemeController class="w-full justify-between" />
        </li>
        
        <div class="divider my-4 animate-fade-in-up" style="animation-delay: 150ms" />

        <li class="animate-fade-in-up" style="animation-delay: 200ms">
          <NuxtLink to="/dashboard" class="active:bg-primary/10 active:text-primary" @click="$emit('close')">
            <Icon name="mdi:chart-box" size="1.5em" class="text-primary" />
            Dashboard
          </NuxtLink>
        </li>
        <li class="animate-fade-in-up" style="animation-delay: 250ms">
          <NuxtLink to="/gigs" class="active:bg-primary/10 active:text-primary" @click="$emit('close')">
            <Icon name="heroicons:clipboard-list" size="1.5em" class="text-secondary" />
            Gigs
          </NuxtLink>
        </li>

        <ClientOnly>
          <div class="divider my-4 animate-fade-in-up" style="animation-delay: 600ms" />
          
          <li v-if="!isAuthenticated" class="animate-fade-in-up" style="animation-delay: 650ms">
            <FormButton type="primary" class="w-full" label="Login" @click="$emit('login')" />
          </li>
          <li v-else class="animate-fade-in-up" style="animation-delay: 700ms">
            <FormButton type="error" outline class="w-full mt-2" label="Logout" @click="$emit('logout')" />
          </li>
        </ClientOnly>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import ThemeController from '~/components/layout/ThemeController.vue'
import FormButton from '~/components/ui/form/FormButton.vue'
import Spinner from '~/components/feedback/loading/Spinner.vue'

defineProps<{
  linkedInUrl: string
  isAuthenticated: boolean
  optimising: boolean
  optimiseError?: string
}>()

defineEmits<{
  (e: 'close' | 'login' | 'logout' | 'installPwa' | 'optimiseImages'): void
}>()
</script>

<style scoped>
.mobile-menu {
  height: calc(100vh - 64px);
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}

.animate-slide-in-right {
  animation: slideInRight 0.3s ease-out forwards;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-up {
  opacity: 0; /* Important for staggered delay to work without flashing */
  animation: fadeInUp 0.4s ease-out forwards;
}
</style>
