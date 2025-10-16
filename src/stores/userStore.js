// src/stores/userStore.js
import { defineStore } from 'pinia'
import axios from 'axios'
const API_URL = 'https://www.xingyunfeicui.xyz/api'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false,
  }),

  actions: {
    async login(credentials) {
      try {
        const response = await axios.post(`${API_URL}/auth/login`, credentials)
        this.token = response.data.token
        this.user = response.data.user
        this.isAuthenticated = true
        localStorage.setItem('token', this.token)
        return response.data
      } catch (error) {
        throw error.response?.data || error
      }
    },

    async signup(userData) {
      try {
        const response = await axios.post(`${API_URL}/auth/signup`, userData)
        this.token = response.data.token
        this.user = response.data.user
        this.isAuthenticated = true
        localStorage.setItem('token', this.token)
        return response.data
      } catch (error) {
        throw error.response?.data || error
      }
    },

    async fetchProfile() {
      try {
        const response = await axios.get(`${API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        this.user = response.data
        this.isAuthenticated = true
        return response.data
      } catch (error) {
        this.logout()
        throw error
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      localStorage.removeItem('token')
    },
  },
})
