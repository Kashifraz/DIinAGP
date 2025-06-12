/**
 * Sync Manager - handles offline transaction queuing and synchronization
 */

import syncService, { type SyncOperation } from '@/services/syncService'
import { dbManager } from './indexedDB'
import { isOnline } from './offlineDetector'
import { offlineDetector } from './offlineDetector'

export interface QueuedTransaction {
  id: string // Local ID (UUID)
  store_id: number
  transaction_data: any
  status: 'pending' | 'syncing' | 'synced' | 'failed'
  created_at: string
  synced_at?: string
  error?: string
}

class SyncManager {
  private syncInProgress = false
  private syncInterval: number | null = null

  constructor() {
    // Auto-sync when coming back online
    offlineDetector.onStatusChange(() => {
      if (isOnline.value && !this.syncInProgress) {
        this.syncPendingTransactions()
      }
    })

    // Periodic sync check (every 30 seconds when online)
    if (typeof window !== 'undefined') {
      this.startPeriodicSync()
    }
  }

  /**
   * Start periodic sync
   */
  private startPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    this.syncInterval = window.setInterval(() => {
      if (isOnline.value && !this.syncInProgress) {
        this.syncPendingTransactions()
      }
    }, 30000) // 30 seconds
  }

  /**
   * Queue a transaction for offline sync
   */
  async queueTransaction(transactionData: any, storeId: number): Promise<string> {
    const queueId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const queuedTransaction: QueuedTransaction = {
      id: queueId,
      store_id: storeId,
      transaction_data: transactionData,
      status: 'pending',
      created_at: new Date().toISOString()
    }

    // Store in IndexedDB
    await dbManager.put('transactions', {
      ...transactionData,
      id: queueId,
      sync_status: 'pending',
      is_local: true
    })

    await dbManager.put('sync_queue', {
      id: queueId,
      store_id: storeId,
      user_id: parseInt(localStorage.getItem('user_id') || '0'),
      operation_type: 'create',
      entity_type: 'transaction',
      entity_id: null,
      data: JSON.stringify(transactionData),
      status: 'pending',
      created_at: new Date().toISOString(),
      synced_at: null
    })

    // Try to sync immediately if online
    if (isOnline.value) {
      this.syncPendingTransactions()
    }

    return queueId
  }

  /**
   * Sync pending transactions
   */
  async syncPendingTransactions(): Promise<void> {
    if (this.syncInProgress || !isOnline.value) {
      return
    }

    this.syncInProgress = true

    try {
      // Get pending transactions from IndexedDB
      const pendingTransactions = await dbManager.query(
        'sync_queue',
        'status',
        'pending'
      )

      if (pendingTransactions.length === 0) {
        return
      }

      // Group by store
      const transactionsByStore = new Map<number, any[]>()

      for (const item of pendingTransactions) {
        const storeId = item.store_id
        if (!transactionsByStore.has(storeId)) {
          transactionsByStore.set(storeId, [])
        }

        const transactionData = JSON.parse(item.data)
        transactionsByStore.get(storeId)!.push({
          operation_type: item.operation_type,
          entity_type: item.entity_type,
          entity_id: item.entity_id,
          data: transactionData
        })
      }

      // Sync each store's transactions
      for (const [storeId, operations] of transactionsByStore) {
        try {
          const result = await syncService.push({
            store_id: storeId,
            operations
          })

          // Update sync status for successful operations
          for (let i = 0; i < operations.length; i++) {
            const operation = operations[i]
            const syncResult = result.results[i]

            if (syncResult.status === 'success') {
              // Find the queue item
              const queueItems = await dbManager.query(
                'sync_queue',
                'status',
                'pending'
              )

              const queueItem = queueItems.find(
                (item) =>
                  item.entity_type === operation.entity_type &&
                  JSON.parse(item.data).transaction_number === operation.data.transaction_number
              )

              if (queueItem) {
                // Update queue item status
                await dbManager.put('sync_queue', {
                  ...queueItem,
                  status: 'synced',
                  synced_at: new Date().toISOString()
                })

                // Update transaction sync status
                const transaction = await dbManager.get('transactions', queueItem.id)
                if (transaction) {
                  await dbManager.put('transactions', {
                    ...transaction,
                    sync_status: 'synced',
                    server_id: syncResult.entity_id
                  })
                }
              }
            } else {
              // Mark as failed
              const queueItems = await dbManager.query(
                'sync_queue',
                'status',
                'pending'
              )

              const queueItem = queueItems.find(
                (item) =>
                  item.entity_type === operation.entity_type &&
                  JSON.parse(item.data).transaction_number === operation.data.transaction_number
              )

              if (queueItem) {
                await dbManager.put('sync_queue', {
                  ...queueItem,
                  status: 'failed',
                  error: syncResult.error
                })
              }
            }
          }
        } catch (error: any) {
          console.error('Sync error for store', storeId, error)
          // Mark all operations as failed for this store
          for (const operation of operations) {
            const queueItems = await dbManager.query(
              'sync_queue',
              'status',
              'pending'
            )

            const queueItem = queueItems.find(
              (item) =>
                item.entity_type === operation.entity_type &&
                JSON.parse(item.data).transaction_number === operation.data.transaction_number
            )

            if (queueItem) {
              await dbManager.put('sync_queue', {
                ...queueItem,
                status: 'failed',
                error: error.message || 'Sync failed'
              })
            }
          }
        }
      }
    } catch (error) {
      console.error('Error syncing pending transactions:', error)
    } finally {
      this.syncInProgress = false
    }
  }

  /**
   * Get pending transactions count
   */
  async getPendingCount(): Promise<number> {
    const pending = await dbManager.query('sync_queue', 'status', 'pending')
    return pending.length
  }

  /**
   * Get failed transactions count
   */
  async getFailedCount(): Promise<number> {
    const failed = await dbManager.query('sync_queue', 'status', 'failed')
    return failed.length
  }

  /**
   * Retry failed transactions
   */
  async retryFailed(): Promise<void> {
    const failed = await dbManager.query('sync_queue', 'status', 'failed')
    
    for (const item of failed) {
      await dbManager.put('sync_queue', {
        ...item,
        status: 'pending',
        error: null
      })
    }

    // Trigger sync
    await this.syncPendingTransactions()
  }

  /**
   * Pull latest data from server
   */
  async pullData(storeId: number, lastSyncTime?: string): Promise<void> {
    if (!isOnline.value) {
      return
    }

    try {
      const result = await syncService.pull({
        store_id: storeId,
        last_sync: lastSyncTime,
        entity_types: 'transactions,products,inventory'
      })

      // Update local cache
      if (result.data.products) {
        await dbManager.putAll('products', result.data.products)
      }

      if (result.data.inventory) {
        await dbManager.putAll('inventory', result.data.inventory)
      }

      // Update last sync time
      await dbManager.setMetadata('last_sync', result.sync_time)
    } catch (error) {
      console.error('Error pulling data:', error)
      throw error
    }
  }

  /**
   * Manual sync trigger
   */
  async manualSync(storeId: number): Promise<void> {
    await this.syncPendingTransactions()
    await this.pullData(storeId)
  }
}

export const syncManager = new SyncManager()

