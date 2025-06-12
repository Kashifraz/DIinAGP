/**
 * IndexedDB utilities for offline data storage
 */

const DB_NAME = 'pos_offline_db'
const DB_VERSION = 1

export interface DBStore {
  name: string
  keyPath: string
  indexes?: Array<{ name: string; keyPath: string; unique?: boolean }>
}

const STORES: DBStore[] = [
  {
    name: 'products',
    keyPath: 'id',
    indexes: [
      { name: 'updated_at', keyPath: 'updated_at' },
      { name: 'status', keyPath: 'status' }
    ]
  },
  {
    name: 'inventory',
    keyPath: 'id',
    indexes: [
      { name: 'store_id', keyPath: 'store_id' },
      { name: 'product_id', keyPath: 'product_id' },
      { name: 'updated_at', keyPath: 'updated_at' }
    ]
  },
  {
    name: 'transactions',
    keyPath: 'id',
    indexes: [
      { name: 'store_id', keyPath: 'store_id' },
      { name: 'status', keyPath: 'status' },
      { name: 'created_at', keyPath: 'created_at' },
      { name: 'sync_status', keyPath: 'sync_status' }
    ]
  },
  {
    name: 'sync_queue',
    keyPath: 'id',
    indexes: [
      { name: 'status', keyPath: 'status' },
      { name: 'store_id', keyPath: 'store_id' },
      { name: 'created_at', keyPath: 'created_at' }
    ]
  },
  {
    name: 'sync_metadata',
    keyPath: 'key',
    indexes: []
  }
]

class IndexedDBManager {
  private db: IDBDatabase | null = null
  private initPromise: Promise<IDBDatabase> | null = null

  /**
   * Initialize IndexedDB
   */
  async init(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db
    }

    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create stores
        STORES.forEach((store) => {
          if (!db.objectStoreNames.contains(store.name)) {
            const objectStore = db.createObjectStore(store.name, {
              keyPath: store.keyPath
            })

            // Create indexes
            if (store.indexes) {
              store.indexes.forEach((index) => {
                objectStore.createIndex(index.name, index.keyPath, {
                  unique: index.unique || false
                })
              })
            }
          }
        })
      }
    })

    return this.initPromise
  }

  /**
   * Get database instance
   */
  async getDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init()
    }
    return this.db!
  }

  /**
   * Add or update item in store
   */
  async put(storeName: string, data: any): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(data)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Add multiple items
   */
  async putAll(storeName: string, items: any[]): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)

      let completed = 0
      const total = items.length

      if (total === 0) {
        resolve()
        return
      }

      items.forEach((item) => {
        const request = store.put(item)
        request.onsuccess = () => {
          completed++
          if (completed === total) {
            resolve()
          }
        }
        request.onerror = () => {
          reject(request.error)
        }
      })
    })
  }

  /**
   * Get item by key
   */
  async get(storeName: string, key: any): Promise<any> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get all items from store
   */
  async getAll(storeName: string): Promise<any[]> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Query items by index
   */
  async query(
    storeName: string,
    indexName: string,
    query: IDBValidKey | IDBKeyRange
  ): Promise<any[]> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const index = store.index(indexName)
      const request = index.getAll(query)

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Delete item by key
   */
  async delete(storeName: string, key: any): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Clear all items from store
   */
  async clear(storeName: string): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get metadata value
   */
  async getMetadata(key: string): Promise<any> {
    const metadata = await this.get('sync_metadata', key)
    return metadata ? metadata.value : null
  }

  /**
   * Set metadata value
   */
  async setMetadata(key: string, value: any): Promise<void> {
    await this.put('sync_metadata', { key, value })
  }
}

export const dbManager = new IndexedDBManager()

// Initialize on module load
if (typeof window !== 'undefined') {
  dbManager.init().catch((error) => {
    console.error('Failed to initialize IndexedDB:', error)
  })
}

