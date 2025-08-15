import { useEffect, useState } from 'react'
import { Platform, View } from 'react-native'

import { Colors } from '@/constants/Colors'
import { StatusBar } from 'expo-status-bar'
import AnnoucementModal from '@/components/AnnoucementModal'
import { storage } from '@/store/storage'
import MapLibreMap from '@/components/MapLibreMap'

const MapsPage = () => {
  const [showAnnouncement, setShowAnnouncement] = useState(false)

  useEffect(() => {
    // Check if this version's announcement has been shown
    const currentVersion = '1.5.0' // Replace with your app's current version
    const lastShownVersion = storage.getString('lastShownVersion')

    if (!lastShownVersion || lastShownVersion !== currentVersion) {
      setShowAnnouncement(true)
    }
  }, [])

  const handleCloseAnnouncement = () => {
    setShowAnnouncement(false)
    // Store the current version as last shown
    storage.set('lastShownVersion', '1.5.0') // Replace with your app's current version
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
      {/* <WebMapRender /> */}
      <MapLibreMap />
    </View>
  )
}
export default MapsPage
