<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <div>
          <h2 class="text-h4 font-weight-bold">Barangay Services</h2>
          <p class="text-grey">Manage services and assign responsible officials</p>
        </div>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">Add Service</v-btn>
      </v-col>

      <v-col cols="12">
        <v-card border elevation="0" class="rounded-xl">
          <v-data-table :headers="headers" :items="services">
            <template #item.official="{ item }">
              <v-chip 
                v-if="item.barangay_officials && item.barangay_officials.length > 0" 
                color="indigo" 
                size="small" 
                variant="tonal"
              >
                {{ item.barangay_officials[0].name }} 
                <span class="ml-1 text-caption">({{ item.barangay_officials[0].position }})</span>
              </v-chip>
              <span v-else class="text-grey text-caption">Unassigned</span>
            </template>

            <template #item.actions="{ item }">
              <v-btn icon="mdi-pencil-outline" variant="text" color="blue" @click="openEdit(item)"></v-btn>
              <v-btn icon="mdi-trash-can-outline" variant="text" color="red" @click="deleteService(item)"></v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>

    <v-dialog v-model="dialog" max-width="500">
      <v-card class="rounded-xl pa-4">
        <v-card-title class="font-weight-bold">
          {{ isEdit ? 'Update Service' : 'New Service' }}
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="form.serviceName" label="Service Name" variant="outlined" class="mb-2" />
          <v-textarea v-model="form.description" label="Description" variant="outlined" rows="2" class="mb-2" />
          
          <v-select
            label="Assigned Official"
            v-model="form.barangay_officials" 
            :items="officials"
            item-title="name"
            item-value="documentId"
            variant="outlined"
            hint="Choose which official handles this service"
            persistent-hint
          />

          <v-switch v-model="form.isActive" label="Is Service Active?" color="success" class="mt-4" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="elevated" @click="saveService" class="px-6">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })
const API = 'http://localhost:1337/api'

const services = ref([])
const officials = ref([])
const dialog = ref(false)
const isEdit = ref(false)
const activeId = ref(null)
const snackbar = ref({ show: false, text: '', color: '' })

const form = ref({ 
  serviceName: '', 
  description: '', 
  isActive: true, 
  barangay_officials: null 
})

const headers = [
  { title: 'Service Name', key: 'serviceName' },
  { title: 'Handled By', key: 'official' },
  { title: 'Actions', key: 'actions', align: 'end', sortable: false }
]

const showMsg = (text, color = 'success') => {
  snackbar.value = { show: true, text, color }
}

const fetchData = async () => {
  try {
    const [ser, off] = await Promise.all([
      $fetch(`${API}/services?populate=*`),
      $fetch(`${API}/barangay-officials`)
    ])
    services.value = ser.data
    officials.value = off.data
  } catch (e) {
    showMsg('Failed to load data from server', 'error')
  }
}

const openCreate = () => {
  isEdit.value = false
  form.value = { serviceName: '', description: '', isActive: true, barangay_officials: null }
  dialog.value = true
}

const openEdit = (item) => {
  isEdit.value = true
  activeId.value = item.documentId || item.id
  form.value = { 
    serviceName: item.serviceName, 
    description: item.description,
    isActive: item.isActive,
    // Ensure we select the current official's ID in the dropdown
    barangay_officials: item.barangay_officials?.[0]?.documentId || item.barangay_officials?.documentId || null
  }
  dialog.value = true
}

const saveService = async () => {
  const url = isEdit.value ? `${API}/services/${activeId.value}` : `${API}/services`
  try {
    // Wrapping the ID in an array [id] is the most stable way for Strapi 5 relationships
    const relationshipData = form.value.barangay_officials ? [form.value.barangay_officials] : []
    
    await $fetch(url, { 
      method: isEdit.value ? 'PUT' : 'POST', 
      body: { 
        data: {
          serviceName: form.value.serviceName,
          description: form.value.description,
          isActive: form.value.isActive,
          barangay_officials: relationshipData
        }
      } 
    })
    
    showMsg(isEdit.value ? 'Service updated successfully' : 'New service added')
    dialog.value = false
    fetchData()
  } catch (e) { 
    const errorMsg = e.response?._data?.error?.message || 'Check Strapi permissions'
    showMsg(errorMsg, 'error') 
  }
}

const deleteService = async (item) => {
  if(confirm('Are you sure you want to delete this service?')) {
    try {
      await $fetch(`${API}/services/${item.documentId || item.id}`, { method: 'DELETE' })
      showMsg('Service removed', 'orange')
      fetchData()
    } catch (e) { showMsg('Delete failed', 'error') }
  }
}

onMounted(fetchData)
</script>