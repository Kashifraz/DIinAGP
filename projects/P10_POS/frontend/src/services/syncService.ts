import apiClient from './api'
import type { ApiResponse } from '@/types/api'

export interface SyncStatus {
  stats: {
    total: number
    pending: number
    syncing: number
    synced: number
    failed: number
  }
  last_sync: string | null
  has_pending: boolean
  has_failed: boolean
}

export interface SyncOperation {
  operation_type: 'create' | 'update' | 'delete'
  entity_type: string
  entity_id?: number
  data: any
}

export interface SyncPushRequest {
  store_id: number
  operations: SyncOperation[]
}

export interface SyncPushResponse {
  synced: number
  failed: number
  results: Array<{
    operation: SyncOperation
    status: 'success' | 'failed'
    entity_id?: number
    error?: string
  }>
}

export interface SyncPullRequest {
  store_id: number
  last_sync?: string
  entity_types?: string
}

export interface SyncPullResponse {
  data: {
    transactions?: any[]
    products?: any[]
    inventory?: any[]
  }
  sync_time: string
}

export interface SyncQueueItem {
  id: number
  store_id: number
  user_id: number
  operation_type: string
  entity_type: string
  entity_id: number | null
  data: string
  status: 'pending' | 'syncing' | 'synced' | 'failed'
  created_at: string
  synced_at: string | null
}

class SyncService {
  /**
   * Get sync status
   */
  async getStatus(storeId?: number): Promise<SyncStatus> {
    const response = await apiClient.get<ApiResponse<SyncStatus>>('/sync/status', {
      params: storeId ? { store_id: storeId } : {}
    })
    return response.data.data
  }

  /**
   * Pull updated data from server
   */
  async pull(params: SyncPullRequest): Promise<SyncPullResponse> {
    const response = await apiClient.get<ApiResponse<SyncPullResponse>>('/sync/pull', {
      params
    })
    return response.data.data
  }

  /**
   * Push queued operations to server
   */
  async push(data: SyncPushRequest): Promise<SyncPushResponse> {
    const response = await apiClient.post<ApiResponse<SyncPushResponse>>('/sync/push', data)
    return response.data.data
  }

  /**
   * Get sync queue items
   */
  async getQueue(params: {
    store_id?: number
    status?: string
    limit?: number
  } = {}): Promise<SyncQueueItem[]> {
    const response = await apiClient.get<ApiResponse<SyncQueueItem[]>>('/sync/queue', {
      params
    })
    return response.data.data
  }

  /**
   * Retry failed sync items
   */
  async retry(syncIds: number[]): Promise<{ retried: number; failed: number }> {
    const response = await apiClient.post<ApiResponse<{ retried: number; failed: number }>>(
      '/sync/retry',
      { sync_ids: syncIds }
    )
    return response.data.data
  }
}

export default new SyncService()

