import { MMKV } from 'react-native-mmkv'

let _storage: MMKV | null = null
let _initializationAttempted = false

// Lazy initialization with error handling
export const getStorage = (): MMKV | null => {
  if (!_storage && !_initializationAttempted) {
    try {
      _storage = new MMKV()
      _initializationAttempted = true
    } catch (error) {
      console.warn('MMKV not ready yet, will retry on next access:', error)
      // Don't set _initializationAttempted so we can retry
      return null
    }
  }
  return _storage
}

// Safe storage wrapper with fallback
export const storage = {
  getString: (key: string): string | undefined => {
    const store = getStorage()
    return store?.getString(key)
  },
  set: (key: string, value: string | number | boolean): void => {
    const store = getStorage()
    store?.set(key, value)
  },
  getBoolean: (key: string): boolean | undefined => {
    const store = getStorage()
    return store?.getBoolean(key)
  },
  getNumber: (key: string): number | undefined => {
    const store = getStorage()
    return store?.getNumber(key)
  },
  delete: (key: string): void => {
    const store = getStorage()
    store?.delete(key)
  },
}
