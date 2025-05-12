import Form from '@/components/Form'
import { Colors } from '@/constants/Colors'
import useMyStore from '@/store/store'
import getCurrentLocation from '@/utils/getCurrentLoc'
import * as Location from 'expo-location'

import { useEffect } from 'react'
import { KeyboardAvoidingView, Platform, StatusBar } from 'react-native'

const FormPage = () => {
  const setGeoCoords = useMyStore((state) => state.setGeoCoords)
  const setAddress = useMyStore((state) => state.setAddress)
  const pressedCoords = useMyStore((state) => state.pressedCoords)
  const setPressedCoords = useMyStore((state) => state.setPressedCoords)

  useEffect(() => {
    const getGeo = async () => {
      if (pressedCoords.latitude !== 0 && pressedCoords.longitude !== 0) {
        setGeoCoords(pressedCoords)
        const getAddress = await Location.reverseGeocodeAsync({
          latitude: pressedCoords.latitude,
          longitude: pressedCoords.longitude,
        })
        setAddress(getAddress[0])
        setPressedCoords({ latitude: 0, longitude: 0 })
      } else {
        const { latitude, longitude, getAddress } = await getCurrentLocation()
        setGeoCoords({ latitude, longitude })
        setAddress(getAddress[0])
      }
    }
    getGeo()
  }, [])

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{
        flex: 1,
        backgroundColor: Colors.primary50,
      }}
    >
      <StatusBar barStyle={'dark-content'} />

      <Form />
    </KeyboardAvoidingView>
  )
}
export default FormPage
