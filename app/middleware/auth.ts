import { useAuth0 } from '@auth0/auth0-vue'

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const auth0 = useAuth0()

  // Wait for auth to load if it's still loading (though usually checkSession is sync enough for the value to be reactive, 
  // but let's be safe or just check the value directly)
  // Actually, useAuth0 provides reactive properties.

  // If we are definitely not authenticated, redirect.
  // We might want to handle 'isLoading' but typically strictly protected routes can just check isAuthenticated.

  // Note: auth0-vue might be initializing. 
  // For now, simple check:
  if (!auth0.isAuthenticated.value) {
    await auth0.loginWithRedirect({
      appState: {
        target: to.fullPath,
      },
    })
    return abortNavigation()
  }
})
