<template>
  <v-container>
    <v-card elevation="3" class="pa-4">
      <v-card-title class="d-flex justify-space-between align-center">
        <div class="text-h5 font-weight-bold">Service Requests</div>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">New Request</v-btn>
      </v-card-title>

      <v-data-table :headers="headers" :items="requests" class="mt-4" hover>
        <template #item.resident="{ item }">
          {{ item.resident?.fullName || '—' }}
        </template>
        <template #item.service="{ item }">
          {{ item.service?.serviceName || '—' }}
        </template>
        
        <template #item.stats="{ item }">
          <v-chip :color="getStatusColor(item.stats)" size="small" label>
            {{ item.stats }}
          </v-chip>
        </template>
        
        <template #item.actions="{ item }">
          <v-btn icon="mdi-pencil" size="small" color="blue" variant="text" @click="openEdit(item)"></v-btn>
          <v-btn icon="mdi-delete" size="small" color="red" variant="text" @click="deleteRequest(item)"></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="pa-4 bg-primary text-white">
          {{ isEdit ? 'Update Request' : 'Create New Request' }}
        </v-card-title>
        <v-card-text class="pt-4">
          <v-select
            label="Resident"
            :items="residents"
            item-title="fullName"
            item-value="documentId"
            v-model="form.resident"
            variant="outlined"
          />
          <v-select
            label="Service"
            :items="services"
            item-title="serviceName"
            item-value="documentId"
            v-model="form.service"
            variant="outlined"
          />
          <v-select
            label="Status"
            :items="['Pending', 'Approved', 'Rejected', 'Completed']"
            v-model="form.stats"
            variant="outlined"
          />
          <v-textarea label="Remarks" v-model="form.remarks" variant="outlined" rows="3" />
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="elevated" @click="saveRequest">Save Request</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

const API = 'http://localhost:1337/api'
const requests = ref([])
const residents = ref([])
const services = ref([])
const dialog = ref(false)
const isEdit = ref(false)
const activeId = ref(null)

const form = ref({
  resident: null,
  service: null,
  stats: 'Pending', // Changed from status to stats
  remarks: ''
})

const headers = [
  { title: 'Resident', key: 'resident', align: 'start' },
  { title: 'Service', key: 'service' },
  { title: 'Status', key: 'stats' }, // Key changed to stats
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
]

const getStatusColor = (s) => {
  const colors = { 'Completed': 'success', 'Pending': 'warning', 'Rejected': 'error', 'Approved': 'info' }
  return colors[s] || 'grey'
}

const fetchData = async () => {
  try {
    const [reqData, resData, serData] = await Promise.all([
      $fetch(`${API}/requests?populate=*`),
      $fetch(`${API}/residents`),
      $fetch(`${API}/services`)
    ])
    requests.value = reqData.data || []
    residents.value = resData.data || []
    services.value = serData.data || []
  } catch (e) {
    console.error("Fetch failed", e)
  }
}

const openCreate = () => {
  isEdit.value = false
  activeId.value = null
  form.value = { resident: null, service: null, stats: 'Pending', remarks: '' }
  dialog.value = true
}

const openEdit = (item) => {
  isEdit.value = true
  activeId.value = item.documentId || item.id
  form.value = {
    resident: item.resident?.documentId,
    service: item.service?.documentId,
    stats: item.stats, // Changed to stats
    remarks: item.remarks || ''
  }
  dialog.value = true
}

const saveRequest = async () => {
  if (!form.value.resident || !form.value.service) {
    alert("Please select both a Resident and a Service.")
    return
  }

  const payload = {
    data: {
      resident: form.value.resident,
      service: form.value.service,
      stats: form.value.stats, // Matches your Strapi 'stats' field
      remarks: form.value.remarks || "",
      requestDate: new Date().toISOString().split('T')[0] // Sending today's date for your requestDate field
    }
  }

  try {
    const url = isEdit.value ? `${API}/requests/${activeId.value}` : `${API}/requests`
    const method = isEdit.value ? 'PUT' : 'POST'
    
    await $fetch(url, { method, body: payload })
    
    dialog.value = false
    await fetchData()
    alert("Request saved successfully!")
  } catch (e) {
    const errorDetail = e.response?._data?.error?.message || "Unknown error"
    alert(`Strapi Error: ${errorDetail}`)
  }
}

const deleteRequest = async (item) => {
  const idToDelete = item.documentId || item.id
  if (confirm('Are you sure you want to delete this request?')) {
    try {
      await $fetch(`${API}/requests/${idToDelete}`, { method: 'DELETE' })
      await fetchData()
    } catch (e) {
      console.error("Delete failed", e)
    }
  }
}

onMounted(fetchData)
</script>