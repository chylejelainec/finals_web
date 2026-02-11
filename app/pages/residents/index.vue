<template>
  <v-container>
    <v-card border elevation="0" class="rounded-xl overflow-hidden">
      <v-toolbar color="white" class="px-4 py-2 border-b">
        <v-toolbar-title class="font-weight-bold">Residents Directory</v-toolbar-title>
        <v-spacer></v-spacer>
        
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search resident name..."
          variant="solo-filled"
          flat
          hide-details
          density="compact"
          class="me-4"
          style="max-width: 300px;"
        ></v-text-field>

        <v-btn color="primary" prepend-icon="mdi-plus" variant="elevated" @click="openCreate">
          Add Resident
        </v-btn>
      </v-toolbar>

      <v-data-table 
        :headers="headers" 
        :items="residents" 
        :search="search"
        hover 
        class="bg-transparent"
      >
        <template #item.fullName="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar color="primary-lighten-4" size="32" class="me-3">
              <span class="text-primary text-caption font-weight-bold">
                {{ item.fullName?.charAt(0) }}
              </span>
            </v-avatar>
            <span class="font-weight-medium">{{ item.fullName }}</span>
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-end">
            <v-tooltip text="View Profile" location="top">
              <template v-slot:activator="{ props }">
                <v-btn 
                  v-bind="props"
                  icon="mdi-eye-outline" 
                  size="small" 
                  color="green" 
                  variant="text" 
                  @click="navigateTo(`/residents/${item.documentId || item.id}`)"
                ></v-btn>
              </template>
            </v-tooltip>

            <v-btn icon="mdi-pencil-outline" size="small" color="blue" variant="text" @click="openEdit(item)"></v-btn>
            <v-btn icon="mdi-trash-can-outline" size="small" color="red" variant="text" @click="deleteResident(item)"></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>

    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card class="rounded-xl">
        <v-card-title class="pa-4 bg-primary text-white">
          {{ isEdit ? 'Edit Resident Profile' : 'Register New Resident' }}
        </v-card-title>
        <v-card-text class="pt-6">
          <v-text-field v-model="form.fullName" label="Full Name" variant="outlined" class="mb-2" />
          <v-text-field v-model="form.address" label="Home Address" variant="outlined" class="mb-2" />
          <v-text-field v-model="form.contactNumber" label="Contact Number" variant="outlined" class="mb-2" />
          <v-text-field v-model="form.email" label="Email Address" variant="outlined" />
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="elevated" @click="saveResident" class="px-6">Save Changes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

const API = 'http://localhost:1337/api/residents'
const residents = ref([])
const search = ref('')
const dialog = ref(false)
const isEdit = ref(false)
const activeId = ref(null)
const snackbar = ref({ show: false, text: '', color: '' })

const form = ref({ fullName: '', address: '', contactNumber: '', email: '' })

const headers = [
  { title: 'Resident Name', key: 'fullName', align: 'start' },
  { title: 'Home Address', key: 'address' },
  { title: 'Contact', key: 'contactNumber' },
  { title: 'Actions', key: 'actions', align: 'end', sortable: false }
]

const showNotify = (text, color = 'success') => {
  snackbar.value = { show: true, text, color }
}

const fetchResidents = async () => {
  try {
    const res = await $fetch(API)
    residents.value = res.data
  } catch (e) {
    showNotify("Could not load residents", "error")
  }
}

const openCreate = () => {
  isEdit.value = false
  form.value = { fullName: '', address: '', contactNumber: '', email: '' }
  dialog.value = true
}

const openEdit = (item) => {
  isEdit.value = true
  activeId.value = item.documentId || item.id 
  form.value = { 
    fullName: item.fullName, 
    address: item.address, 
    contactNumber: item.contactNumber, 
    email: item.email 
  }
  dialog.value = true
}

const saveResident = async () => {
  try {
    const payload = { data: { ...form.value } }
    const method = isEdit.value ? 'PUT' : 'POST'
    const url = isEdit.value ? `${API}/${activeId.value}` : API
    
    await $fetch(url, { method, body: payload })
    
    showNotify(isEdit.value ? "Profile updated" : "Resident registered")
    dialog.value = false
    fetchResidents()
  } catch (e) { 
    showNotify("Error saving data. Check permissions.", "error")
  }
}

const deleteResident = async (item) => {
  const idToDelete = item.documentId || item.id
  if (confirm('Delete this resident record permanently?')) {
    try {
      await $fetch(`${API}/${idToDelete}`, { method: 'DELETE' })
      showNotify("Record deleted", "orange")
      fetchResidents()
    } catch (e) {
      showNotify("Delete failed", "error")
    }
  }
}

onMounted(fetchResidents)
</script>