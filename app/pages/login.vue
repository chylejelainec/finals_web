<template>
  <v-container fluid class="fill-height bg-grey-lighten-3">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card elevation="12" class="pa-6 rounded-lg">
          <v-card-item class="text-center">
            <v-avatar color="primary" size="64" class="mb-4">
              <v-icon size="32" color="white">mdi-shield-account</v-icon>
            </v-avatar>
            <v-card-title class="text-h5 font-weight-bold">Barangay Admin</v-card-title>
            <v-card-subtitle>Please enter your credentials</v-card-subtitle>
          </v-card-item>

          <v-card-text class="pt-4">
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="uid"
                label="Username or Email"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                class="mb-2"
                required
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Password"
                prepend-inner-icon="mdi-lock"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                required
              ></v-text-field>

              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                class="mt-4 font-weight-bold"
                :loading="loading"
                elevation="2"
              >
                Login
              </v-btn>
            </v-form>
          </v-card-text>

          <v-alert
            v-if="errorMsg"
            type="error"
            variant="tonal"
            class="mt-4"
            closable
          >
            {{ errorMsg }}
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
definePageMeta({ layout: 'blank' }) // Use a blank layout for login

const uid = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''
  
  try {
    const data = await $fetch('http://localhost:1337/api/auth/local', {
      method: 'POST',
      body: { identifier: uid.value, password: password.value }
    })

    const auth = useCookie('auth')
    auth.value = data.jwt
    
    // Redirect to dashboard on success
    navigateTo('/dashboard')
  } catch (e) {
    errorMsg.value = "Invalid credentials. Please try again."
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>