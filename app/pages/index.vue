<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h2 class="text-h4 font-weight-bold">Barangay Services</h2>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">Add Service</v-btn>
      </v-col>

      <v-col cols="12">
        <v-card border elevation="0" class="rounded-xl">
          <v-data-table :headers="headers" :items="services">
            <template #item.official="{ item }">
              <v-chip v-if="item.barangay_official" color="indigo" size="small" variant="tonal">
                {{ item.barangay_official.name }} ({{ item.barangay_official.position }})
              </v-chip>
              <span v-else class="text-grey text-caption italic">Unassigned</span>
            </template>

            <template #item.actions="{ item }">
              <v-btn icon="mdi-pencil" variant="text" color="blue" @click="openEdit(item)"></v-btn>
              <v-btn icon="mdi-delete" variant="text" color="red" @click="deleteService(item)"></v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500">
      <v-card class="rounded-xl pa-4">
        <v-card-title class="font-weight-bold">{{ isEdit ? 'Edit Service' : 'New Service' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.serviceName" label="Service Name" variant="outlined" class="mb-2" />
          <v-textarea v-model="form.description" label="Description" variant="outlined" rows="2" class="mb-2" />
          
          <v-select
            label="Assign Official (Handled By)"
            v-model="form.barangay_official" 
            :items="officials"
            item-title="name"
            item-value="documentId"
            variant="outlined"
          />

          <v-switch v-model="form.isActive" label="Service Active" color="success" hide-details />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="elevated" @click="saveService">Save Service</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })
const API = 'http://localhost:1337/api'

const services = ref([]); const officials = ref([]); const dialog = ref(false)
const isEdit = ref(false); const activeId = ref(null)
const form = ref({ serviceName: '', description: '', isActive: true, barangay_official: null })

const headers = [
  { title: 'Service Name', key: 'serviceName' },
  { title: 'Handled By', key: 'official' },
  { title: 'Actions', key: 'actions', align: 'end' }
]

const fetchData = async () => {
  const [ser, off] = await Promise.all([
    $fetch(`${API}/services?populate=*`),
    $fetch(`${API}/barangay-officials`)
  ])
  services.value = ser.data
  officials.value = off.data
}

const openCreate = () => {
  isEdit.value = false
  form.value = { serviceName: '', description: '', isActive: true, barangay_official: null }
  dialog.value = true
}

const openEdit = (item) => {
  isEdit.value = true
  activeId.value = item.documentId || item.id
  form.value = { 
    serviceName: item.serviceName, 
    description: item.description,
    isActive: item.isActive,
    barangay_official: item.barangay_official?.documentId || null 
  }
  dialog.value = true
}

const saveService = async () => {
  const url = isEdit.value ? `${API}/services/${activeId.value}` : `${API}/services`
  try {
    await $fetch(url, { 
      method: isEdit.value ? 'PUT' : 'POST', 
      body: { data: form.value } 
    })
    dialog.value = false
    fetchData()
  } catch (e) { alert("Save failed. Make sure you added the 'barangay_official' relation to the Service collection in Strapi.") }
}

onMounted(fetchData)
</script>