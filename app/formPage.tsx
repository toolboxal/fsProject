import Form from '@/components/Form'
import { Colors } from '@/constants/Colors'
import useMyStore from '@/store/store'
import getCurrentLocation from '@/utils/getCurrentLoc'
import * as Location from 'expo-location'

import { useEffect, useMemo } from 'react'
import { KeyboardAvoidingView, Platform, StatusBar } from 'react-native'
import { useLocalSearchParams } from 'expo-router'

const FormPage = () => {
  const setGeoCoords = useMyStore((state) => state.setGeoCoords)
  const setAddress = useMyStore((state) => state.setAddress)
  const { lat, lng } = useLocalSearchParams<{ lat?: string; lng?: string }>()

  const paramCoords = useMemo(() => {
    if (!lat || !lng) return null
    const latitude = Number(lat)
    const longitude = Number(lng)
    if (isNaN(latitude) || isNaN(longitude)) return null
    return { latitude, longitude }
  }, [lat, lng])

  useEffect(() => {
    const getGeo = async () => {
      if (paramCoords) {
        setGeoCoords(paramCoords)
        const getAddress = await Location.reverseGeocodeAsync(paramCoords)
        setAddress(getAddress[0])
      } else {
        const { latitude, longitude, getAddress } = await getCurrentLocation()
        setGeoCoords({ latitude, longitude })
        setAddress(getAddress[0])
      }
    }
    getGeo()
  }, [paramCoords, setGeoCoords, setAddress])

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{
        flex: 1,
        backgroundColor: Colors.primary50,
      }}
    >
      <StatusBar barStyle={'dark-content'} />

      <Form
        initialLat={paramCoords?.latitude}
        initialLng={paramCoords?.longitude}
      />
    </KeyboardAvoidingView>
  )
}
export default FormPage
