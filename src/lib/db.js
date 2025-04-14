import { openDB } from 'idb'

export const dbPromise = openDB('SpamRemoverDB', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('keywords')) {
      db.createObjectStore('keywords', { keyPath: 'id', autoIncrement: true })
    }
    if (!db.objectStoreNames.contains('history')) {
      db.createObjectStore('history', { keyPath: 'id', autoIncrement: true })
    }
  }
})
