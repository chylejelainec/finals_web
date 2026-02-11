<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <div>
          <h2 class="text-h4 font-weight-bold">Barangay Officials</h2>
          <p class="text-subtitle-2 text-grey">Monitor official assignments and availability</p>
        </div>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">Add Official</v-btn>
      </v-col>

      <v-col cols="12">
        <v-card border elevation="0" class="rounded-xl">
          <v-data-table :headers="headers" :items="officials">
            
            <template #item.servicesCount="{ item }">
              <v-chip 
                :color="getWorkloadColor(item.services?.length || 0)" 
                variant="flat"
                size="small" 
                label
                class="font-weight-bold px-4"
              >
                {{ item.services?.length || 0 }} {{ (item.services?.length === 1) ? 'Service' : 'Services' }}
              </v-chip>
            </template>

            <template #item.actions="{ item }">
              <v-btn icon="mdi-pencil" variant="text" color="blue" @click="openEdit(item)"></v-btn>
              <v-btn icon="mdi-delete" variant="text" color="red" @click="deleteOfficial(item)"></v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500">
      <v-card class="rounded-xl pa-4">
        <v-card-title class="font-weight-bold">{{ isEdit ? 'Update Official' : 'Register Official' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.name" label="Full Name" variant="outlined" class="mb-2" />
          <v-text-field v-model="form.position" label="Position" variant="outlined" class="mb-2" />
          <v-text-field v-model="form.contactNumber" label="Contact Number" variant="outlined" />
        </v-card-text>
        <v-card-actions>
          <v-spacer /><v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="elevated" @click="saveOfficial">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })
const API = 'http://localhost:1337/api/barangay-officials'

const officials = ref([]); const dialog = ref(false)
const isEdit = ref(false); const activeId = ref(null)
const form = ref({ name: '', position: '', contactNumber: '' })

const headers = [
  { title: 'Official Name', key: 'name' },
  { title: 'Position', key: 'position' },
  { title: 'Workload Status', key: 'servicesCount', sortable: true },
  { title: 'Actions', key: 'actions', align: 'end' }
]

// Logic to define color based on service count
const getWorkloadColor = (count) => {
  if (count === 0) return 'grey-lighten-1'  // No tasks
  if (count <= 1) return 'success'          // Low workload (Green)
  if (count <= 2) return 'warning'          // Medium workload (Orange)
  return 'error'                            // High workload (Red)
}

const fetchData = async () => {
  try {
    const res = await $fetch(`${API}?populate=services`)
    officials.value = res.data
  } catch (e) { console.error("Fetch error", e) }
}

const openCreate = () => {
  isEdit.value = false; form.value = { name: '', position: '', contactNumber: '' }; dialog.value = true
}

const openEdit = (item) => {
  isEdit.value = true; activeId.value = item.documentId || item.id
  form.value = { name: item.name, position: item.position, contactNumber: item.contactNumber }
  dialog.value = true
}

const saveOfficial = async () => {
  const url = isEdit.value ? `${API}/${activeId.value}` : API
  try {
    await $fetch(url, { method: isEdit.value ? 'PUT' : 'POST', body: { data: form.value } })
    dialog.value = false; fetchData()
  } catch (e) { alert("Save failed") }
}

const deleteOfficial = async (item) => {
  if (confirm("Delete this official?")) {
    try {
      await $fetch(`${API}/${item.documentId || item.id}`, { method: 'DELETE' })
      fetchData()
    } catch (e) { alert("Delete failed") }
  }
}

onMounted(fetchData)
</script>