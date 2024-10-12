import { useEffect } from 'react'
import { StatusBar, SafeAreaView, Platform } from 'react-native'
import * as Location from 'expo-location'

import getCurrentLocation from '@/utils/getCurrentLoc'
import useMyStore from '@/store/store'
import WebMapRender from '@/components/WebMapRender'
import { Colors } from '@/constants/Colors'
import AnimatedSplashScreen from '@/components/AnimatedSplashScreen'

const MapsPage = () => {
  const setAddress = useMyStore((state) => state.setAddress)
  const setGeoCoords = useMyStore((state) => state.setGeoCoords)

  useEffect(() => {
    const getLocationPermission = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        console.log('Permission to access location was denied')
        return
      }

      const { latitude, longitude, getAddress } = await getCurrentLocation()

      setGeoCoords({ latitude, longitude })

      setAddress(getAddress[0])
    }
    getLocationPermission()
  }, [])

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.primary700,
        paddingTop: Platform.OS === 'android' ? 45 : 0,
      }}
    >
      <StatusBar barStyle={'light-content'} />

      <WebMapRender />
    </SafeAreaView>
  )
}
export default MapsPage
