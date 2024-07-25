import * as Location from 'expo-location'

const getCurrentLocation = async () => {
  let { coords } = await Location.getCurrentPositionAsync({ accuracy: 3 })
  const { latitude, longitude } = coords

  const getAddress = await Location.reverseGeocodeAsync({
    latitude,
    longitude,
  })
  return { latitude, longitude, getAddress }
}

export default getCurrentLocation
