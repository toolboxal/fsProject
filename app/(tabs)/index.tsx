import { useEffect, useState } from 'react'
import { Platform, View } from 'react-native'
import * as Location from 'expo-location'
import { MMKV } from 'react-native-mmkv'

import getCurrentLocation from '@/utils/getCurrentLoc'
import useMyStore from '@/store/store'
import WebMapRender from '@/components/WebMapRender'
import { Colors } from '@/constants/Colors'
import { StatusBar } from 'expo-status-bar'
import AnnoucementModal from '@/components/AnnoucementModal'

const MapsPage = () => {
  const setAddress = useMyStore((state) => state.setAddress)
  const setGeoCoords = useMyStore((state) => state.setGeoCoords)
  const storage = new MMKV()
  const [showAnnouncement, setShowAnnouncement] = useState(false)

  useEffect(() => {
    // Check if this version's announcement has been shown
    const currentVersion = '1.2.0' // Replace with your app's current version
    const lastShownVersion = storage.getString('lastShownVersion')

    if (!lastShownVersion || lastShownVersion !== currentVersion) {
      setShowAnnouncement(true)
    }
  }, [])

  const handleCloseAnnouncement = () => {
    setShowAnnouncement(false)
    // Store the current version as last shown
    storage.set('lastShownVersion', '1.2.0') // Replace with your app's current version
  }

  console.log('index Page render')

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.primary700,
        paddingTop: Platform.OS === 'android' ? 45 : 0,
      }}
    >
      <StatusBar style={Platform.OS === 'android' ? 'light' : 'dark'} />
      <AnnoucementModal
        visible={showAnnouncement}
        onClose={handleCloseAnnouncement}
      />
      <WebMapRender />
    </View>
  )
}
export default MapsPage
