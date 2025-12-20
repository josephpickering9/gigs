<template>
  <header class="navbar bg-base-100">
    <div class="flex-1 flex items-center gap-2">
      <NuxtLink to="/" class="btn btn-ghost text-xl px-1">Gigs</NuxtLink>

    </div>
    <div class="hidden flex-none gap-2 md:flex md:items-center">
      <ul class="menu menu-horizontal px-1">
        <li>
          <NuxtLink to="/dashboard">
            <Icon name="mdi:chart-box" size="1.2em" />
            Dashboard
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/gigs">
            <Icon name="heroicons:clipboard-list" size="1.2em" />
            Gigs
          </NuxtLink>
        </li>
      </ul>
      <ThemeController />
      <UserDropdown
        :linked-in-url="linkedInUrl"
        :is-authenticated="isAuthenticated ?? false"
        @login="login"
        @logout="logout"
        @install-pwa="installPwa"
      />
    </div>
    <div class="flex-none md:hidden">
      <button class="btn-square" @click="toggleMobileMenu">
        <Icon v-if="!showMobileMenu" name="mdi:hamburger-menu" size="2em" />
        <Icon v-else name="mdi:close" size="2em" />
      </button>
    </div>

    <MobileMenu
      v-if="showMobileMenu"
      :linked-in-url="linkedInUrl"
      :is-authenticated="isAuthenticated ?? false"
      @close="toggleMobileMenu"
      @login="login"
      @logout="logout"
      @install-pwa="installPwa"
    />
  </header>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import useAuth from '~/composables/useAuth'
import ThemeController from '~/components/layout/ThemeController.vue'
import UserDropdown from '~/components/layout/navigation/UserDropdown.vue'
import MobileMenu from '~/components/layout/navigation/MobileMenu.vue'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

const route = useRoute()
const { isAuthenticated, login, logout } = useAuth()

const showMobileMenu = ref(false)
const installPrompt = ref<BeforeInstallPromptEvent | undefined>(undefined)

function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value
}

async function installPwa() {
  if (installPrompt.value) {
    installPrompt.value.prompt()
    await installPrompt.value.userChoice
    installPrompt.value = undefined
  }
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    installPrompt.value = e as BeforeInstallPromptEvent
  })
})


watch(() => route.path, () => {
  showMobileMenu.value = false
})

watch(showMobileMenu, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = 'auto'
  }
})
</script>
