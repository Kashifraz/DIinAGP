import { defineStore } from 'pinia'
import noticeService from '@/services/noticeService'

export const useNoticeStore = defineStore('notice', {
  state: () => ({
    notices: [],
    coordinatorNotices: [],
    currentNotice: null,
    unreadCount: 0,
    loading: false,
    error: null
  }),

  actions: {
    async createNotice(noticeData) {
      this.loading = true
      this.error = null
      try {
        const notice = await noticeService.createNotice(noticeData)
        this.coordinatorNotices.unshift(notice)
        return notice
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Failed to create notice'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchAllNotices() {
      this.loading = true
      this.error = null
      try {
        const notices = await noticeService.getAllNotices()
        this.notices = notices
        return notices
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Failed to fetch notices'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchCoordinatorNotices() {
      this.loading = true
      this.error = null
      try {
        const notices = await noticeService.getAllNoticesForCoordinator()
        this.coordinatorNotices = notices
        return notices
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Failed to fetch notices'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchNoticeById(id) {
      this.loading = true
      this.error = null
      try {
        const notice = await noticeService.getNoticeById(id)
        this.currentNotice = notice
        return notice
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Failed to fetch notice'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateNotice(id, noticeData) {
      this.loading = true
      this.error = null
      try {
        const notice = await noticeService.updateNotice(id, noticeData)
        const index = this.coordinatorNotices.findIndex(n => n.id === id)
        if (index !== -1) {
          this.coordinatorNotices[index] = notice
        }
        return notice
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Failed to update notice'
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteNotice(id) {
      this.loading = true
      this.error = null
      try {
        await noticeService.deleteNotice(id)
        this.coordinatorNotices = this.coordinatorNotices.filter(n => n.id !== id)
        this.notices = this.notices.filter(n => n.id !== id)
        if (this.currentNotice?.id === id) {
          this.currentNotice = null
        }
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Failed to delete notice'
        throw err
      } finally {
        this.loading = false
      }
    },

    async publishNotice(id) {
      this.loading = true
      this.error = null
      try {
        const notice = await noticeService.publishNotice(id)
        const index = this.coordinatorNotices.findIndex(n => n.id === id)
        if (index !== -1) {
          this.coordinatorNotices[index] = notice
        }
        // Refresh published notices list
        await this.fetchAllNotices()
        return notice
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Failed to publish notice'
        throw err
      } finally {
        this.loading = false
      }
    },

    async markAsRead(id) {
      this.error = null
      try {
        // Check if already read to avoid unnecessary API call
        const notice = this.notices.find(n => n.id === id) || this.currentNotice
        if (notice && notice.isRead) {
          return // Already read, no need to call API
        }
        
        await noticeService.markAsRead(id)
        // Update notice read status
        const noticeInList = this.notices.find(n => n.id === id)
        if (noticeInList) {
          noticeInList.isRead = true
        }
        if (this.currentNotice?.id === id) {
          this.currentNotice.isRead = true
        }
        // Refresh unread count
        await this.fetchUnreadCount()
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Failed to mark notice as read'
        throw err
      }
    },

    async fetchUnreadCount() {
      try {
        const count = await noticeService.getUnreadCount()
        this.unreadCount = count
        return count
      } catch (err) {
        console.error('Failed to fetch unread count:', err)
        return 0
      }
    }
  }
})

