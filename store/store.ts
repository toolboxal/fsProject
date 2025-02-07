import { create } from 'zustand'
import { TPerson } from '@/drizzle/schema'
import { storage } from '@/store/storage'

type TAddress = {
  city: string | null
  country: string | null
  district: string | null
  formattedAddress: string | null
  isoCountryCode: string | null
  name: string | null
  postalCode: string | null
  region: string | null
  street: string | null
  streetNumber: string | null
  subregion: string | null
  timezone: string | null
}

type Store = {
  address: TAddress
  geoCoords: {
    latitude: number
    longitude: number
  }
  selectedPerson: TPerson
  setAddress: (location: TAddress) => void
  setGeoCoords: (geo: { latitude: number; longitude: number }) => void
  setSelectedPerson: (selected: TPerson) => void
  language: string
  setLanguage: (lang: string) => void
}

const initialAddress = {
  city: '',
  country: '',
  district: '',
  formattedAddress: '',
  isoCountryCode: '',
  name: '',
  postalCode: '',
  region: '',
  street: '',
  streetNumber: '',
  subregion: '',
  timezone: '',
}

const initialPerson = {
  id: 0,
  name: '',
  block: '',
  unit: '',
  street: '',
  contact: '',
  remarks: '',
  category: '',
  date: '',
  latitude: 0,
  longitude: 0,
  publications: '',
}

const useMyStore = create<Store>((set) => ({
  address: initialAddress,
  geoCoords: { latitude: 0, longitude: 0 },
  selectedPerson: initialPerson,
  setAddress: (location) => set({ address: location }),
  setGeoCoords: (geo) => set({ geoCoords: geo }),
  setSelectedPerson: (selected) => set({ selectedPerson: selected }),
  language: storage.getString('language') || 'en',
  setLanguage: (lang: string) => set({ language: lang }),
}))

export default useMyStore
