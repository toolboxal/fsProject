import { useState } from 'react'
import { WebView } from 'react-native-webview'
import useMyStore from '@/store/store'

import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { Colors } from '@/constants/Colors'
import { FontAwesome6 } from '@expo/vector-icons'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import getCurrentLocation from '@/utils/getCurrentLoc'
import { useRef, useMemo } from 'react'

import { db } from '@/drizzle/db'
import { Person } from '@/drizzle/schema'
// import { useLiveQuery } from 'drizzle-orm/expo-sqlite'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { storage } from '@/store/storage'

const WebMapRender = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedDarkMode = storage.getBoolean('isDarkMode')
    return savedDarkMode || false
  })
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
    // refetchOnMount: false,
    // staleTime: Infinity,
  })

  const toggleDarkMap = async () => {
    if (webRef.current) {
      const injectedJavaScript = `
        (function() {
          const mapTiles = document.querySelector('.map-tiles');
          mapTiles.classList.toggle('dark-mode');
          
        })();
      `
      webRef.current.injectJavaScript(injectedJavaScript)
      const newDarkMode = !isDarkMode
      setIsDarkMode(newDarkMode)
      storage.set('isDarkMode', newDarkMode)
    }
  }

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)
      if (data.type === 'MARKER_CLICK') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }
    } catch (error) {
      console.log('Error parsing message:', error)
    }
  }

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
        publications,
      } = person

      const popUpContent = `<h3 style='color:#6ee7b7;font-size:15px;line-height:0.1; display:inline-block;padding:0;margin:0'>${name}</h3>
    
    <hr>
    
    <p style='color:#6ee7b7;font-size:15px;font-style:italic; display:inline-block;padding:0;margin:0;line-height:0.5; font-weight:bold'>${
      block ? 'Apt.' + block : ''
    }</p>
    <p style='color:#6ee7b7;font-size:15px;font-style:italic; display:inline-block;padding:0;margin:0;line-height:0.5'>#${unit}</p>
     <p style='color:#6ee7b7;font-size:15px;font-style:italic; display:inline-block;padding:0;margin:0;line-height:1.2'>${street}</p>
     <p style='color:#fbffc1;font-size:15px;font-style:italic; display:block;padding:0;margin:0;line-height:1.2;font-weight:bold'>${publications}</p>
     <p style='color:#fff;font-size:15px; display:block;margin:0;background-color:#262626;'>${remarks}</p>
    `
      console.log('inside markers')
      return { popUpContent, latitude, longitude, category }
    })
  }, [persons])

  const markersJSON = JSON.stringify(markers)

  const htmlContent = useMemo(() => {
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
         
        .map-tiles {
          transition: filter 0.3s ease;
        }
        .map-tiles.dark-mode {
          filter: brightness(0.6) hue-rotate(220deg) saturate(0.5) contrast(3.3) invert(1);
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        (function() {
            window.map = L.map('map', {zoomControl:false}).setView([${latitude}, ${longitude}], 18);
            
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                className: 'map-tiles ${isDarkMode ? ' dark-mode' : ''}',
            }).addTo(window.map);

           
            const currentLocIcon = L.divIcon({
            className: 'custom-div-icon',
            html: "<span class='material-icons' style='font-size:30px;color:#f43f5e;'>my_location</span>",
            iconSize: [30, 30],
            iconAnchor: null,
            popupAnchor: [0,-20]
            });

            const caIcon = L.divIcon({
            className: 'custom-div-icon',
            html: "<div style='font-family:Inter, sans-serif;font-size:15px;font-weight:bold;color:#fff;background-color:#34d399;display:flex;justify-content: center; align-items: center;border-radius: 100px;height:30px;width:30px; border: none;box-shadow: 2px 2px 1px 0 #262626;'>CA</div>",
            iconSize: [40, 40],
            iconAnchor: null,
            popupAnchor: [-5,-25]
            });

            const rvIcon = L.divIcon({
            className: 'custom-div-icon',
            html: "<div style='font-family:Inter, sans-serif;font-size:15px;font-weight:bold;color:#fff;background-color:#059669;display:flex;justify-content: center; align-items: center;border-radius: 100px;height:30px;width:30px; border: none;box-shadow: 2px 2px 1px 0 #262626;'>RV</div>",
            iconSize: [40, 40],
            iconAnchor: null,
            popupAnchor: [-5,-25]
            });

            const bsIcon = L.divIcon({
            className: 'custom-div-icon',
            html: "<div style='font-family:Inter, sans-serif;font-size:15px;font-weight:bold;color:#fff;background-color:#064e3b;display:flex;justify-content: center; align-items: center;border-radius: 100px;height:30px;width:30px; border: none;box-shadow: 2px 2px 1px 0 #262626;'>BS</div>",
            iconSize: [40, 40],
            iconAnchor: null,
            popupAnchor: [-5,-25]
            });


            L.marker([${latitude}, ${longitude}], {icon:currentLocIcon}).addTo(window.map)
                .bindPopup('You are here')

            const markers = ${markersJSON};

            const markersGroup = L.markerClusterGroup();

      

            markers?.forEach((marker) => {
              const mark = L.marker([marker.latitude, marker.longitude], {
                icon: marker.category === 'CA' ? caIcon : marker.category === 'RV' ? rvIcon : bsIcon,
              }).bindPopup(marker.popUpContent)

               mark.on('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MARKER_CLICK' }));
              });
              markersGroup.addLayer(mark)
            })
            window.map.addLayer(markersGroup)

            function refocusMap(latitude, longitude) {
              window.map.setView([latitude, longitude], 18);
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
  }, [persons, latitude, longitude])

  const handleRefreshNavigation = async () => {
    const { latitude, longitude, getAddress } = await getCurrentLocation()
    setGeoCoords({ latitude, longitude })
    setAddress(getAddress[0])
    if (webRef.current) {
      const injectedJavaScript = `
        (function() {
          window.map.setView([${latitude}, ${longitude}], 18);
          
        })();
      `
      webRef.current.injectJavaScript(injectedJavaScript)
    }
  }

  console.log('webMap render')

  return (
    <View style={{ position: 'relative', flex: 1 }}>
      <WebView
        style={{ height: '100%' }}
        source={{ html: htmlContent }}
        ref={webRef}
        onMessage={handleMessage}
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
        javaScriptEnabled={true}
        domStorageEnabled={true}
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
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            toggleDarkMap()
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isDarkMode ? 'sunny' : 'moon'}
            size={26}
            color={Colors.emerald500}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            handleRefreshNavigation()
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="navigate" size={26} color={Colors.primary50} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            router.navigate('/formPage')
          }}
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
