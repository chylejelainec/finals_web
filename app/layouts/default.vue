<template>
  <v-app id="barangay-os">
    <v-navigation-drawer v-model="drawer" app elevation="0" class="border-e-sm bg-grey-lighten-4">
      <div class="pa-6 text-center">
        <v-avatar color="primary" size="64" class="mb-3 border-md border-white">
          <v-icon size="32" color="white">mdi-home-city</v-icon>
        </v-avatar>
        <div class="text-h6 font-weight-bold">Barangay Connect</div>
        <div class="text-caption text-grey">Administrator Panel</div>
      </div>

      <v-divider class="mx-4 mb-4"></v-divider>

      <v-list nav density="comfortable">
        <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard" to="/dashboard" rounded="lg" color="primary"></v-list-item>
        <v-list-item 
  prepend-icon="mdi-account-star" 
  title="Officials" 
  to="/officials" 
  rounded="lg"
>
</v-list-item>
        <v-list-item prepend-icon="mdi-account-group" title="Residents" to="/residents" rounded="lg" color="primary"></v-list-item>
        <v-list-item prepend-icon="mdi-hammer-wrench" title="Services" to="/services" rounded="lg" color="primary"></v-list-item>
        <v-list-item prepend-icon="mdi-file-clock" title="Service Requests" to="/requests" rounded="lg" color="primary"></v-list-item>
        
      </v-list>

      <template v-slot:append>
        <div class="pa-4">
          <v-btn block color="red-lighten-1" variant="tonal" prepend-icon="mdi-logout" @click="logout">
            Logout
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar flat border="b" color="white">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="font-weight-medium">Management System</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-bell-outline" class="me-2"></v-btn>
      <v-chip class="ma-2" color="primary" label>
        <v-icon start icon="mdi-account-circle"></v-icon>
        Admin
      </v-chip>
    </v-app-bar>

    <v-main class="bg-grey-lighten-5">
      <v-container fluid class="pa-8">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
const drawer = ref(true)
const logout = () => {
  const auth = useCookie('auth')
  auth.value = null
  navigateTo('/login')
}
</script>

<style>
/* Modern Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 10px; }
</style>