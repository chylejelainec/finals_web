<template>
  <v-container>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="navigateTo('/residents')" class="mb-4">
      Back to Residents
    </v-btn>

    <v-row v-if="resident">
      <v-col cols="12" md="4">
        <v-card border elevation="0" class="rounded-xl pa-6 text-center">
          <v-avatar color="primary" size="100" class="mb-4">
            <span class="text-h3 text-white">{{ resident.fullName?.charAt(0) }}</span>
          </v-avatar>
          <h2 class="text-h5 font-weight-bold">{{ resident.fullName }}</h2>
          <v-chip color="blue-lighten-4" class="text-blue-darken-2 mt-2" size="small" label>Resident</v-chip>
          
          <v-divider class="my-6"></v-divider>
          
          <div class="text-left">
            <div class="text-overline text-grey">Contact Information</div>
            <div class="d-flex align-center mb-2">
              <v-icon start size="small" color="grey">mdi-phone</v-icon>
              <span>{{ resident.contactNumber || 'No contact provided' }}</span>
            </div>
            <div class="d-flex align-center">
              <v-icon start size="small" color="grey">mdi-map-marker</v-icon>
              <span>{{ resident.address || 'No address provided' }}</span>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card border elevation="0" class="rounded-xl">
          <v-card-title class="pa-6 font-weight-bold d-flex align-center">
            <v-icon start color="primary">mdi-history</v-icon>
            Service Request History
          </v-card-title>
          
          <v-divider></v-divider>

          <v-data-table 
            :headers="headers" 
            :items="resident.requests || []" 
            class="bg-transparent"
          >
            <template #item.stats="{ item }">
              <v-chip :color="getStatusColor(item.stats)" size="x-small" label>
                {{ item.stats }}
              </v-chip>
            </template>
            <template #item.requestDate="{ item }">
              {{ item.requestDate || 'N/A' }}
            </template>
          </v-data-table>

          <div v-if="!resident.requests?.length" class="pa-12 text-center text-grey">
            <v-icon size="64" class="mb-2">mdi-file-outline</v-icon>
            <div>No service requests found for this resident.</div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else justify="center" align="center" style="min-height: 400px;">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-row>
  </v-container>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })
const route = useRoute()
const API = 'http://localhost:1337/api/residents'

const resident = ref(null)
const headers = [
  { title: 'Date', key: 'requestDate' },
  { title: 'Service', key: 'service.serviceName' },
  { title: 'Status', key: 'stats' },
  { title: 'Remarks', key: 'remarks' }
]

const getStatusColor = (s) => ({ 'Completed': 'success', 'Pending': 'warning', 'Rejected': 'error' }[s] || 'info')

const fetchResidentDetails = async () => {
  try {
    // We populate 'requests' and 'requests.service' to show full history
    const res = await $fetch(`${API}/${route.params.id}?populate[requests][populate][0]=service`)
    resident.value = res.data
  } catch (e) {
    console.error("Failed to load resident details", e)
  }
}

onMounted(fetchResidentDetails)
</script>