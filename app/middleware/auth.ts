export default defineNuxtRouteMiddleware(() => {
  if (import.meta.client) {
    if (localStorage.getItem('loggedIn') !== 'true') {
      return navigateTo('/login')
    }
  }
})
