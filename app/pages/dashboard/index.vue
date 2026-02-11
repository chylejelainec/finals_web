<template>
  <v-row>
    <v-col cols="12">
      <h2 class="text-h4 font-weight-bold mb-1">Welcome back, Admin!</h2>
      <p class="text-grey-darken-1 mb-6">Here is what's happening in the Barangay today.</p>
    </v-col>

    <v-col v-for="stat in stats" :key="stat.label" cols="12" sm="6" md="3">
      <v-card class="pa-4 rounded-xl shadow-sm" elevation="0" border>
        <div class="d-flex justify-space-between align-center">
          <div>
            <div class="text-overline text-grey-darken-1">{{ stat.label }}</div>
            <div class="text-h4 font-weight-bold">{{ stat.value }}</div>
          </div>
          <v-avatar :color="stat.color" variant="tonal" rounded="lg" size="52">
            <v-icon :icon="stat.icon" size="28"></v-icon>
          </v-avatar>
        </div>
      </v-card>
    </v-col>

    <v-col cols="12" md="8">
      <v-card class="rounded-xl border" elevation="0">
        <v-card-title class="pa-4 font-weight-bold">Recent Requests</v-card-title>
        <v-table>
          <thead>
            <tr>
              <th class="text-left">Resident</th>
              <th class="text-left">Service</th>
              <th class="text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in recentRequests" :key="item.id">
              <td>{{ item.resident?.fullName }}</td>
              <td>{{ item.service?.serviceName }}</td>
              <td>
                <v-chip size="x-small" :color="item.stats === 'Completed' ? 'green' : 'orange'">
                  {{ item.stats }}
                </v-chip>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })
const API = 'http://localhost:1337/api'
const recentRequests = ref([])
const stats = ref([
  { label: 'Total Residents', value: 0, icon: 'mdi-account-group', color: 'blue' },
  { label: 'Services Offered', value: 0, icon: 'mdi-hand-heart', color: 'purple' },
  { label: 'Pending Requests', value: 0, icon: 'mdi-clock-outline', color: 'orange' },
  { label: 'Completed', value: 0, icon: 'mdi-check-decagram', color: 'green' }
])

onMounted(async () => {
  const [res, ser, req] = await Promise.all([
    $fetch(`${API}/residents`),
    $fetch(`${API}/services`),
    $fetch(`${API}/requests?populate=*`)
  ])
  stats.value[0].value = res.data.length
  stats.value[1].value = ser.data.length
  stats.value[2].value = req.data.filter(r => r.stats !== 'Completed').length
  stats.value[3].value = req.data.filter(r => r.stats === 'Completed').length
  recentRequests.value = req.data.slice(-5).reverse()
})
</script>