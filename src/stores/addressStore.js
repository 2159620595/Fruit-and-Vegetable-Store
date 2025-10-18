// src/stores/addressStore.js
import { defineStore } from 'pinia'
import {
  getAddressList,
  addAddress as addAddressAPI,
  updateAddress as updateAddressAPI,
  deleteAddress as deleteAddressAPI,
} from '@/api/address'

export const useAddressStore = defineStore('address', {
  state: () => ({
    addresses: [],
    loading: false,
    error: null,
  }),

  persist: {
    key: 'address',
    storage: localStorage,
  },

  getters: {
    // 获取默认地址
    defaultAddress: (state) => state.addresses.find((addr) => addr.is_default),

    // 获取地址数量
    addressCount: (state) => state.addresses.length,
  },

  actions: {
    /**
     * 获取地址列表
     */
    async fetchAddresses() {
      this.loading = true
      this.error = null

      try {
        const response = await getAddressList()
        const result = response.data.data || response.data

        this.addresses = Array.isArray(result) ? result : []

        console.log('✅ 获取地址列表成功:', this.addresses.length, '条')

        return this.addresses
      } catch (error) {
        console.error('❌ 获取地址列表失败:', error)
        this.error = error.message || '获取地址列表失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 添加地址
     * @param {Object} addressData - 地址数据
     */
    async addAddress(addressData) {
      this.loading = true
      this.error = null

      try {
        const response = await addAddressAPI(addressData)
        const result = response.data.data || response.data

        console.log('✅ 添加地址成功')

        // 重新获取地址列表
        await this.fetchAddresses()

        return result
      } catch (error) {
        console.error('❌ 添加地址失败:', error)
        this.error = error.message || '添加地址失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新地址
     * @param {Number} id - 地址ID
     * @param {Object} addressData - 地址数据
     */
    async updateAddress(id, addressData) {
      this.loading = true
      this.error = null

      try {
        await updateAddressAPI(id, addressData)

        console.log('✅ 更新地址成功')

        // 重新获取地址列表
        await this.fetchAddresses()

        return true
      } catch (error) {
        console.error('❌ 更新地址失败:', error)
        this.error = error.message || '更新地址失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 删除地址
     * @param {Number} id - 地址ID
     */
    async deleteAddress(id) {
      this.loading = true
      this.error = null

      try {
        await deleteAddressAPI(id)

        // 从本地列表中删除
        this.addresses = this.addresses.filter((addr) => addr.id !== id)

        console.log('✅ 删除地址成功')

        return true
      } catch (error) {
        console.error('❌ 删除地址失败:', error)
        this.error = error.message || '删除地址失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 设置默认地址
     * @param {Number} id - 地址ID
     */
    async setDefaultAddress(id) {
      const address = this.addresses.find((addr) => addr.id === id)
      if (!address) {
        throw new Error('地址不存在')
      }

      // 更新地址，设置为默认
      return await this.updateAddress(id, {
        ...address,
        is_default: true,
      })
    },

    /**
     * 清空错误信息
     */
    clearError() {
      this.error = null
    },
  },
})
