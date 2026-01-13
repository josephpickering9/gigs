import { createAuth0 } from '@auth0/auth0-vue'
import { client } from '@api/client.gen'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const auth0 = createAuth0({
    domain: config.public.auth0Domain,
    clientId: config.public.auth0ClientId,
    authorizationParams: {
      redirect_uri: window.location.origin,
      audience: config.public.auth0Audience,
      scope: 'openid profile email offline_access',
    },
    useRefreshTokens: true,
    cacheLocation: 'localstorage',
  })

  if (import.meta.client) {
    nuxtApp.vueApp.use(auth0)

    watchEffect(async () => {
      if (auth0.isAuthenticated.value) {
        try {
          const token = await auth0.getAccessTokenSilently()
          if (token) {
            client.setConfig({
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
          }
        } catch (e: any) {
          // eslint-disable-next-line no-console
          console.log('token error', e)

          // If the refresh token is missing, we need to logout to clear the invalid state
          if (e?.message?.includes('Missing Refresh Token')) {
            auth0.logout({ logoutParams: { returnTo: window.location.origin } })
          }
        }
      }
    })
  }
})
