<template>
  <div class="delivery-address-page">
 
    <!-- Main Content -->
    <div class="main-content">
      <!-- Page Title -->
      <h1 class="page-title">Delivery Addresses</h1>

      <!-- Saved Addresses Section -->
      <div class="saved-addresses-section">
        <h2 class="section-title">Saved Addresses</h2>

        <div class="address-list">
          <div class="address-item">
            <div class="address-info">
              <div class="address-header">
                <div class="contact-info">Sophia Carter, 555-123-4567</div>
                <button class="edit-btn">✏️</button>
              </div>
              <div class="address-type">Home</div>
              <div class="address-details">
                123 Oak Street, Apt 4B, Anytown, CA 91234
              </div>
            </div>
          </div>

          <div class="address-item">
            <div class="address-info">
              <div class="address-header">
                <div class="contact-info">Ethan Bennett, 555-987-6543</div>
                <button class="edit-btn">✏️</button>
              </div>
              <div class="address-type">Work</div>
              <div class="address-details">
                456 Maple Avenue, Unit 2A, Anytown, CA 91234
              </div>
            </div>
          </div>
        </div>

        <button class="add-address-btn">Add New Address</button>
      </div>

      <!-- Add New Address Form -->
      <div class="add-address-section">
        <h2 class="section-title">Add New Address</h2>

        <form class="address-form">
          <div class="form-group">
            <label class="form-label">Recipient Name</label>
            <input
              type="text"
              class="form-input"
              placeholder="Enter recipient name"
              v-model="newAddress.recipientName"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input
              type="tel"
              class="form-input"
              placeholder="Enter phone number"
              v-model="newAddress.phoneNumber"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Region</label>
            <div class="select-wrapper">
              <select class="form-select" v-model="newAddress.region">
                <option value="">Select region</option>
                <option value="california">California</option>
                <option value="texas">Texas</option>
                <option value="florida">Florida</option>
                <option value="new-york">New York</option>
              </select>
              <span class="select-arrow">▼</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Detailed Address</label>
            <textarea
              class="form-textarea"
              placeholder="Enter detailed address"
              rows="4"
              v-model="newAddress.detailedAddress"
            ></textarea>
          </div>

          <button type="submit" class="save-address-btn">Save Address</button>
        </form>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/userStore'
import axios from 'axios'

const userStore = useUserStore()
const addresses = ref([
  {
    id: 1,
    name: 'Sophia Carter',
    phone: '555-123-4567',
    label: 'Home',
    address: '123 Oak Street, Apt 4B',
    city: 'Anytown',
    state: 'CA',
    zipCode: '91234',
    isDefault: true
  },
  {
    id: 2,
    name: 'Ethan Bennett',
    phone: '555-987-6543',
    label: 'Work',
    address: '456 Maple Avenue, Unit 2A',
    city: 'Anytown',
    state: 'CA',
    zipCode: '91234',
    isDefault: false
  }
])

const showAddForm = ref(false)
const editingAddress = ref(null)
// const formData = ref({
//   name: '',
//   phone: '',
//   region: '',
//   address: '',
//   city: '',
//   state: '',
//   zipCode: '',
//   isDefault: false
// })
const newAddress = ref({
        recipientName: "",
        phoneNumber: "",
        region: "",
        detailedAddress: "",
})
const editAddress = (address) => {
  editingAddress.value = address
  formData.value = { ...address }
  showAddForm.value = true
}

const deleteAddress = (id) => {
  if (confirm('Are you sure you want to delete this address?')) {
    addresses.value = addresses.value.filter(a => a.id !== id)
    // Call API to delete address
  }
}

const setDefault = (id) => {
  addresses.value = addresses.value.map(a => ({
    ...a,
    isDefault: a.id === id
  }))
  // Call API to update default address
}

const saveAddress = async () => {
  try {
    if (editingAddress.value) {
      // Update existing address
      const index = addresses.value.findIndex(a => a.id === editingAddress.value.id)
      addresses.value[index] = { ...formData.value }
    } else {
      // Add new address
      const newAddress = {
        ...formData.value,
        id: Date.now()
      }
      addresses.value.push(newAddress)
      
      // Call API
      await axios.post(
        'http://localhost:3000/api/users/addresses',
        newAddress,
        { headers: { Authorization: `Bearer ${userStore.token}` } }
      )
    }
    
    cancelForm()
    alert('Address saved successfully!')
  } catch (error) {
    alert('Failed to save address: ' + error)
  }
}

const cancelForm = () => {
  showAddForm.value = false
  editingAddress.value = null
  formData.value = {
    name: '',
    phone: '',
    region: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false
  }
}

onMounted(() => {
  // Load addresses from API if needed
})
</script>

<style scoped>
.delivery-address-page {
  min-height: 100vh;
  background-color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* Header Styles */
.header {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e5e5;
  padding: 16px 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.leaf-icon {
  font-size: 16px;
  color: #2d5a27;
}

.brand-name {
  font-size: 18px;
  font-weight: 600;
  color: #000000;
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-link {
  color: #000000;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #2d5a27;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  width: 40px;
  height: 40px;
  border: none;
  background-color: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 16px;
}

.action-btn:hover {
  background-color: #e5e5e5;
}

.profile-pic {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
}

.profile-pic img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Main Content */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 40px 0;
}

/* Saved Addresses Section */
.saved-addresses-section {
  margin-bottom: 48px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 24px 0;
}

.address-list {
  margin-bottom: 24px;
}

.address-item {
  background-color: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  transition: box-shadow 0.2s;
}

.address-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.address-item:last-child {
  margin-bottom: 0;
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.contact-info {
  font-size: 16px;
  font-weight: 500;
  color: #000000;
}

.edit-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: #666666;
  cursor: pointer;
  transition: color 0.2s;
  padding: 4px;
}

.edit-btn:hover {
  color: #2d5a27;
}

.address-type {
  font-size: 14px;
  color: #2d5a27;
  font-weight: 500;
  margin-bottom: 8px;
}

.address-details {
  font-size: 14px;
  color: #2d5a27;
  line-height: 1.4;
}

.add-address-btn {
  background-color: #2d5a27;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-address-btn:hover {
  background-color: #1e3d1a;
}

/* Add Address Form */
.add-address-section {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 32px;
}

.address-form {
  max-width: 600px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  background-color: #ffffff;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #2d5a27;
}

.select-wrapper {
  position: relative;
}

.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  background-color: #ffffff;
  appearance: none;
  cursor: pointer;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-select:focus {
  outline: none;
  border-color: #2d5a27;
}

.select-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #666666;
  pointer-events: none;
  font-size: 12px;
}

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  background-color: #ffffff;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s;
  box-sizing: border-box;
  font-family: inherit;
}

.form-textarea:focus {
  outline: none;
  border-color: #2d5a27;
}

.save-address-btn {
  background-color: #2d5a27;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 8px;
}

.save-address-btn:hover {
  background-color: #1e3d1a;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .nav-links {
    gap: 16px;
  }

  .main-content {
    padding: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .add-address-section {
    padding: 20px;
  }

  .address-form {
    max-width: none;
  }
}
</style>
