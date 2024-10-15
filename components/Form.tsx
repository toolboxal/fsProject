import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import * as Location from 'expo-location'
import { useForm, Controller } from 'react-hook-form'
import { Colors } from '@/constants/Colors'
import { useEffect, useState } from 'react'
import TextInputComponent from './TextInputComponent'
import FontAwesome from '@expo/vector-icons/FontAwesome6'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import useMyStore from '@/store/store'
import getTimeDate from '../utils/getTimeDate'
import Toast from 'react-native-root-toast'
import { db } from '@/drizzle/db'
import { Person, TPerson } from '@/drizzle/schema'
import WebView from 'react-native-webview'
import { SegmentedButtons } from 'react-native-paper'
import { useQueryClient } from '@tanstack/react-query'

type TFormData = Omit<TPerson, 'id' | 'category' | 'latitude' | 'longitude'>

const Form = () => {
  const queryClient = useQueryClient()
  const [category, setCategory] = useState('CA')
  const geoCoords = useMyStore((state) => state.geoCoords)
  const setGeoCoords = useMyStore((state) => state.setGeoCoords)
  const address = useMyStore((state) => state.address)
  let { latitude, longitude } = geoCoords

  const { todayDate } = getTimeDate()

  const { street, streetNumber } = address
  const displayBlock = streetNumber?.split(' ')[1]

  useEffect(() => {
    setValue('block', displayBlock || '')
    setValue('street', street || '')
    setValue('date', todayDate)
  }, [address])

  const { control, handleSubmit, reset, setValue, getValues } = useForm({
    defaultValues: {
      block: '',
      unit: '',
      street: '',
      name: '',
      contact: '',
      date: '',
      remarks: '',
    },
  })

  const showToast = (name: string) => {
    Toast.show(`Record ${name} has been created 👍`, {
      duration: 5000,
      position: 60,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
      backgroundColor: Colors.emerald100,
      textColor: Colors.primary900,
      opacity: 1,
    })
  }

  const submitPressed = async (data: TFormData) => {
    console.log('pressed')
    const toUpperBlock = data.block === null ? '' : data.block.toUpperCase()
    const { name, unit, street, remarks, contact, date } = data

    await db.insert(Person).values({
      name: name,
      unit: unit,
      street: street,
      remarks: remarks,
      contact: contact,
      block: toUpperBlock,
      date: date,
      latitude: geoCoords.latitude,
      longitude: geoCoords.longitude,
      category: category,
    })
    queryClient.invalidateQueries({ queryKey: ['persons'] })
    console.log('submitted new user')
    reset()
    showToast(data.name === null ? '' : data.name)

    router.navigate('/recordsPage')
  }

  const handleNewAddress = async () => {
    try {
      const [block, unit, street] = getValues(['block', 'unit', 'street'])
      console.log(block, unit, street)
      const addressString = block ? `${block} ${street}` : `${unit} ${street}`
      const newGeoCode = await Location.geocodeAsync(addressString)
      const lat = newGeoCode[0].latitude
      const lng = newGeoCode[0].longitude
      setGeoCoords({ latitude: lat, longitude: lng })
    } catch (error) {
      Alert.alert("This address doesn't exist")
    }
  }

  const htmlContent = `
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
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        (function() {
            const map = L.map('map',{zoomControl:false}).setView([${latitude}, ${longitude}], 18);
            
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

           
            const currentLocIcon = L.divIcon({
            className: 'custom-div-icon',
            html: "<span class='material-icons' style='font-size:35px;color:#5d3ff4;'>location_on</span>",
            iconSize: [10, 10],
            iconAnchor: null,
            popupAnchor: [0,-20]
            });

            L.marker([${latitude}, ${longitude}], {icon:currentLocIcon}).addTo(map)
                .bindPopup('You are here')

        })();
    </script>
</body>
</html>
  `
  console.log('category-->', category)
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.primary50,
      }}
    >
      <ScrollView style={styles.scrollViewContainer}>
        <View style={styles.twoColumnsContainer}>
          <Controller
            control={control}
            name="unit"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInputComponent
                value={value.toUpperCase()}
                onChangeText={onChange}
                onBlur={onBlur}
                label="house no."
                placeholderText="unit"
                extraStyles={{ width: 110 }}
                autoFocus={true}
              />
            )}
          />
          <Controller
            control={control}
            name="block"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInputComponent
                value={value.toUpperCase()}
                onChangeText={onChange}
                onBlur={onBlur}
                label="apartment"
                placeholderText="blk no."
                extraStyles={{ width: 110 }}
              />
            )}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              padding: 6,
              paddingHorizontal: 10,
              backgroundColor: Colors.primary900,
              borderRadius: 10,
              alignSelf: 'flex-end',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
              shadowColor: '#000',
              shadowOffset: { width: 2, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 5,
            }}
            onPress={handleNewAddress}
          >
            <FontAwesome6
              name="location-arrow"
              size={20}
              color={Colors.primary100}
            />
            <Text
              style={{
                fontFamily: 'IBM-SemiBold',
                fontSize: 14,
                color: Colors.primary100,
                textAlign: 'center',
              }}
            >
              {` Update\n Map`}
            </Text>
          </TouchableOpacity>
        </View>
        <Controller
          control={control}
          name="street"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInputComponent
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              label="street"
              placeholderText="kingdom ave."
              extraStyles={{ width: '100%' }}
            />
          )}
        />
        <View
          style={{
            height: 250,
            marginTop: 20,
            borderRadius: 10,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <WebView
            style={{ height: '100%' }}
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            startInLoadingState
            renderLoading={() => (
              <View style={{ height: '100%' }}>
                <ActivityIndicator
                  size={'small'}
                  color={Colors.emerald500}
                  style={{ height: '100%' }}
                />
              </View>
            )}
          />
        </View>
        <View style={styles.twoColumnsContainer}>
          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInputComponent
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                label="name"
                placeholderText="nicodemus"
                extraStyles={{ width: 175 }}
              />
            )}
          />
          <Controller
            control={control}
            name="contact"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInputComponent
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                label="contact"
                placeholderText="hp no."
                extraStyles={{ width: 140 }}
              />
            )}
          />
        </View>
        <Controller
          control={control}
          name="remarks"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInputComponent
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              label="remarks"
              placeholderText="....."
              extraStyles={{
                width: '100%',
                height: 140,
              }}
              multiline={true}
            />
          )}
        />
        <View style={styles.twoColumnsContainer}>
          <Controller
            control={control}
            name="date"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInputComponent
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                label="date"
                placeholderText=""
                extraStyles={{ width: 130 }}
              />
            )}
          />
        </View>

        <SegmentedButtons
          value={category}
          onValueChange={setCategory}
          density="regular"
          style={{ marginVertical: 10 }}
          buttons={[
            {
              value: 'CA',
              label: 'Call Again',
            },
            {
              value: 'RV',
              label: 'Return Visit',
            },
            {
              value: 'BS',
              label: 'Bible Study',
            },
          ]}
        />
        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={handleSubmit(submitPressed)}
          activeOpacity={0.8}
        >
          <FontAwesome name="check" size={22} color={Colors.white} />
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}
export default Form

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
    paddingHorizontal: 18,
  },
  apartmentBtnsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 13,
    gap: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 7,
    elevation: 5,
    backgroundColor: Colors.primary50,
  },
  twoColumnsContainer: {
    flexDirection: 'row',
    // gap: 20,
    justifyContent: 'space-between',
    marginVertical: 7,
    width: '100%',
    alignItems: 'center',
    // borderWidth: 1,
    // borderColor: 'red',
  },
  buttonStyle: {
    width: '100%',
    padding: 15,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    marginTop: 18,
    marginBottom: 130,
    backgroundColor: Colors.primary900,
  },
  buttonText: {
    fontFamily: 'IBM-SemiBold',
    fontSize: 18,
    color: Colors.white,
  },
})
