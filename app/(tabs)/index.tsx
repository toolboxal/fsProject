import { useEffect, useState } from 'react'
import { Platform, View } from 'react-native'
import Constants from 'expo-constants'

import { Colors } from '@/constants/Colors'
import { StatusBar } from 'expo-status-bar'
import AnnoucementModal from '@/components/AnnoucementModal'
import { storage } from '@/store/storage'
import MapLibreMap from '@/components/MapLibreMap'

const appVersion = Constants.expoConfig?.version ?? '0.0.0'

const MapsPage = () => {
  const [showAnnouncement, setShowAnnouncement] = useState(false)

  useEffect(() => {
    const lastShownVersion = storage.getString('lastShownVersion')

    if (!lastShownVersion || lastShownVersion !== appVersion) {
      setShowAnnouncement(true)
    }
  }, [])

  const handleCloseAnnouncement = () => {
    setShowAnnouncement(false)
    storage.set('lastShownVersion', appVersion)
  }

  // console.log('index Page render')

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
