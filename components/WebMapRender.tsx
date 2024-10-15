import { WebView } from 'react-native-webview'
import useMyStore from '@/store/store'

import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { Colors } from '@/constants/Colors'
import { FontAwesome6 } from '@expo/vector-icons'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import getCurrentLocation from '@/utils/getCurrentLoc'
import { useRef, useMemo } from 'react'

import { db } from '@/drizzle/db'
import { Person, TPerson } from '@/drizzle/schema'
// import { useLiveQuery } from 'drizzle-orm/expo-sqlite'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'

const WebMapRender = () => {
  const { bottom } = useSafeAreaInsets()
  const setAddress = useMyStore((state) => state.setAddress)
  const setGeoCoords = useMyStore((state) => state.setGeoCoords)
  const geoCoords = useMyStore((state) => state.geoCoords)

  const { latitude, longitude } = geoCoords

  const webRef = useRef<WebView>(null)

  // const { data: persons } = useLiveQuery(db.select().from(Person))

  const { data: persons } = useQuery({
    queryKey: ['persons'],
    queryFn: () => {
      const result = db.select().from(Person).all()
      return result
    },
    refetchOnMount: false,
    staleTime: Infinity,
  })

  const markers = useMemo(() => {
    return persons?.map((person) => {
      const {
        name,
        block,
        unit,
        street,
        category,
        latitude,
        longitude,
        remarks,
      } = person

      const popUpContent = `<h3 style='color:#6ee7b7;font-size:15px;line-height:0.1; display:inline-block;padding:0;margin:0'>${name}</h3>
    <p style='color:#6ee7b7;font-size:14px;font-weight:bold; display:inline-block;padding:0;margin:0' >| ${category}</p>
    <hr>
    
    <p style='color:#6ee7b7;font-size:15px;font-style:italic; display:inline-block;padding:0;margin:0;line-height:0.5; font-weight:bold'>${
      block ? 'Apt.' + block : ''
    }</p>
    <p style='color:#6ee7b7;font-size:15px;font-style:italic; display:inline-block;padding:0;margin:0;line-height:0.5'>#${unit}</p>
     <p style='color:#6ee7b7;font-size:15px;font-style:italic; display:inline-block;padding:0;margin:0;line-height:1.2'>${street}</p>
     <p style='color:#fff;font-size:15px; display:block;margin-top:0.5;background-color:#262626;'>${remarks}</p>
    `
      console.log('inside markers')
      return { popUpContent, latitude, longitude }
    })
  }, [persons])

  const markersJSON = JSON.stringify(markers)

  const htmlContent = useMemo(() => {
    // console.log('inside html')
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leaflet Map</title>
   <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css" />
    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
    <script src="https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js"></script>



    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <style>
        body, html, #map { height: 100%; margin: 0; padding: 0; }
        .leaflet-popup-content-wrapper {
        background: #262626; 
        color: #fff; 
        border-radius: 8px; 
        padding: 1px;
        max-width: 280px; 
        }
        .leaflet-popup-tip {
        background: #262626; 
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        (function() {
            const map = L.map('map', {zoomControl:false}).setView([${latitude}, ${longitude}], 18);
            
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

           
            const currentLocIcon = L.divIcon({
            className: 'custom-div-icon',
            html: "<span class='material-icons' style='font-size:30px;color:#f43f5e;'>my_location</span>",
            iconSize: [30, 30],
            iconAnchor: null,
            popupAnchor: [0,-20]
            });

            const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: "<span class='material-icons' style='font-size:35px;color:#5d3ff4;'>face</span>",
            iconSize: [40, 40],
            iconAnchor: null,
            popupAnchor: [0,-20]
            });

            L.marker([${latitude}, ${longitude}], {icon:currentLocIcon}).addTo(map)
                .bindPopup('You are here')

            const markers = ${markersJSON};

            const markersGroup = L.markerClusterGroup();

      

            markers?.forEach((marker) => {
              const mark = L.marker([marker.latitude, marker.longitude], {
                icon: customIcon,
              }).bindPopup(marker.popUpContent)
              markersGroup.addLayer(mark)
            })
            map.addLayer(markersGroup)

            function refocusMap(latitude, longitude) {
            map.setView([latitude, longitude], 18);
            }

            window.addEventListener('message', function(event) {
            var data = JSON.parse(event.data);
            if (data.type === 'REFOCUS') {
                refocusMap(data.lat, data.lng);
            }
            });

            
        })();
    </script>
</body>
</html>
  `
  }, [persons])

  const handleRefreshNavigation = async () => {
    const { latitude, longitude, getAddress } = await getCurrentLocation()
    setGeoCoords({ latitude, longitude })
    setAddress(getAddress[0])
    if (webRef.current) {
      webRef.current.postMessage(
        JSON.stringify({
          type: 'REFOCUS',
          lat: latitude,
          lng: longitude,
        })
      )
    }
  }

  console.log('webMap render')

  return (
    <View style={{ position: 'relative', flex: 1 }}>
      <WebView
        style={{ height: '100%' }}
        // originWhitelist={['*']}
        source={{ html: htmlContent }}
        ref={webRef}
        startInLoadingState
        renderLoading={() => (
          <View style={{ height: '100%' }}>
            <ActivityIndicator
              size={'large'}
              color={Colors.emerald500}
              style={{ height: '100%' }}
            />
          </View>
        )}
      />
      <View
        style={{
          position: 'absolute',
          bottom: bottom + 75 + 25,
          right: 15,
          gap: 15,
        }}
      >
        <TouchableOpacity
          style={styles.addBtn}
          onPress={handleRefreshNavigation}
          activeOpacity={0.8}
        >
          <Ionicons name="navigate" size={26} color={Colors.primary50} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.navigate('/formPage')}
          activeOpacity={0.8}
        >
          <FontAwesome6 name="add" size={26} color={Colors.primary50} />
        </TouchableOpacity>
      </View>
    </View>
  )
}
export default WebMapRender

const styles = StyleSheet.create({
  addBtn: {
    width: 50,
    height: 50,
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary900,
    padding: 10,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
})
