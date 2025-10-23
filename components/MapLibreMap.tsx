import {
  StyleSheet,
  View,
  FlatList,
  Text,
  Pressable,
  Platform,
  Alert,
  ScrollView,
} from 'react-native'
import * as Linking from 'expo-linking'
import {
  MapView,
  Camera,
  PointAnnotation,
  Callout,
  CameraRef,
} from '@maplibre/maplibre-react-native'
import useMyStore from '@/store/store'
import { db } from '@/drizzle/db'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  TPerson,
  TPersonWithTagsAndFollowUps,
  TMarkerAnnotation,
  markerAnnotation,
} from '@/drizzle/schema'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors } from '@/constants/Colors'
import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import * as Haptics from 'expo-haptics'
import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import getCurrentLocation from '@/utils/getCurrentLoc'
import { useTranslations } from '@/app/_layout'
import { useIsFocused } from '@react-navigation/native'
import MapAnnotateModal from './MapAnnotateModal'
import Foundation from '@expo/vector-icons/Foundation'
import { X } from 'lucide-react-native'
import { eq } from 'drizzle-orm'

// Pure utility functions - moved outside component for better performance
const openMapsForNavigation = async (latitude: number, longitude: number) => {
  const scheme = Platform.select({
    ios: 'maps:',
    android: 'geo:',
  })
  const latLng = `${latitude},${longitude}`
  const label = 'Selected Location'
  const url = Platform.select({
    ios: `${scheme}${latLng}?q=${label}@${latLng}`,
    android: `${scheme}${latLng}?q=${latLng}(${label})`,
  })

  Linking.canOpenURL(url!).then((supported) => {
    if (supported) {
      Linking.openURL(url!)
    } else {
      // Fallback to Google Maps web URL
      const webUrl = `https://www.google.com/maps/search/?api=1&query=${latLng}`
      Linking.openURL(webUrl)
    }
  })
}

const handleCalling = async (phoneNumber: string) => {
  if (!phoneNumber) return
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  try {
    // Format the phone number (remove any non-numeric characters)
    const formattedNumber = phoneNumber.replace(/\D/g, '')
    const callUrl = `tel:${formattedNumber}`

    // Check if the device supports the tel URL scheme
    const supported = await Linking.canOpenURL(callUrl)
    if (supported) {
      await Linking.openURL(callUrl)
    } else {
      Alert.alert('Error', 'Phone calling is not supported on this device')
    }
  } catch (error) {
    console.error('Error making call:', error)
    Alert.alert('Error', 'Unable to make the phone call')
  }
}

const openWhatsApp = async (phoneNumber: string) => {
  if (!phoneNumber) return
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  try {
    // Format the phone number (remove any non-numeric characters)
    const formattedNumber = phoneNumber.replace(/\D/g, '')

    // Try the wa.me URL first as it's more reliable
    const url = `https://wa.me/${formattedNumber}`

    // Check if WhatsApp can handle the URL
    const supported = await Linking.canOpenURL(url)
    if (supported) {
      await Linking.openURL(url)
    } else {
      // Fallback to whatsapp:// scheme
      const fallbackUrl = `whatsapp://send?phone=${formattedNumber}`
      const fallbackSupported = await Linking.canOpenURL(fallbackUrl)
      if (fallbackSupported) {
        await Linking.openURL(fallbackUrl)
      } else {
        Alert.alert('Error', 'WhatsApp is not installed on this device')
      }
    }
  } catch (error) {
    console.log('Error opening WhatsApp:', error)
    Alert.alert('Error', 'Unable to open WhatsApp')
  }
}

const MapLibreMap = () => {
  const { top, bottom } = useSafeAreaInsets()
  const [showAnnotateModal, setShowAnnotateModal] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const setAddress = useMyStore((state) => state.setAddress)
  const setGeoCoords = useMyStore((state) => state.setGeoCoords)
  const setPressedCoords = useMyStore((state) => state.setPressedCoords)
  const geoCoords = useMyStore((state) => state.geoCoords)
  const { latitude, longitude } = geoCoords
  const pressedCoords = useMyStore((state) => state.pressedCoords)
  const i18n = useTranslations()
  const queryClient = useQueryClient()
  const isFocused = useIsFocused()
  const cameraRef = useRef<CameraRef>(null)
  const [showInfoPanel, setShowInfoPanel] = useState(false)

  // Memoize statusOptions to prevent recreation on every render
  const statusOptions: {
    type: TPerson['status']
    color: string
    label: string
  }[] = useMemo(
    () => [
      {
        type: 'irregular',
        label: i18n.t('statusOptions.labelIrregular'),
        color: Colors.sky200,
      },
      {
        type: 'frequent',
        label: i18n.t('statusOptions.labelFrequent'),
        color: Colors.purple100,
      },
      {
        type: 'committed',
        label: i18n.t('statusOptions.labelCommitted'),
        color: Colors.purple300,
      },
    ],
    [i18n]
  )

  const router = useRouter()
  // MapLibre needs a style object for the map
  const mapStyle = {
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap contributors',
      },
    },
    layers: [
      {
        id: 'osm-layer',
        source: 'osm',
        type: 'raster',
      },
    ],
  }

  const { data: markerAnnotationData } = useQuery<TMarkerAnnotation[]>({
    queryKey: ['markerAnnotation'],
    queryFn: async () => db.query.markerAnnotation.findMany(),
  })

  const { data } = useQuery<TPersonWithTagsAndFollowUps[]>({
    queryKey: ['persons'],
    queryFn: async () =>
      db.query.Person.findMany({
        with: {
          personsToTags: {
            with: {
              tag: true,
            },
          },
          followUp: true,
        },
      }),
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0, // Consider data stale immediately to ensure fresh data
  })

  const tagsArr = data
    ?.map((person) => person.personsToTags?.map((pt) => pt.tag) || [])
    .filter((tags) => tags.length > 0)

  // Flatten the array of tag arrays and remove duplicates based on tag ID
  const allTags = tagsArr?.flat() || []
  const uniqueTags = allTags
    .filter(
      (tag, index, self) => index === self.findIndex((t) => t.id === tag.id)
    )
    .sort((a, b) => a.tagName.localeCompare(b.tagName))

  // Function to group markers by location and apply circular offset
  const getMarkerPositions = useCallback(() => {
    if (!data) return []

    // Group markers by their exact coordinates
    const groupedMarkers: { [key: string]: TPersonWithTagsAndFollowUps[] } = {}
    data.forEach((person) => {
      if (person.latitude && person.longitude) {
        const key = `${person.latitude},${person.longitude}`
        if (!groupedMarkers[key]) {
          groupedMarkers[key] = []
        }
        groupedMarkers[key].push(person)
      }
    })

    // For each group, apply an offset if there are multiple markers
    const positionedMarkers: {
      person: TPersonWithTagsAndFollowUps
      offset: [number, number]
    }[] = []
    Object.values(groupedMarkers).forEach((group) => {
      if (group.length === 1) {
        // No offset for single markers
        positionedMarkers.push({ person: group[0], offset: [0, 0] })
      } else {
        // Arrange in a circle for multiple markers
        const radius = 0.00015 // Adjust this value to control the spread
        group.forEach((person, index) => {
          const angle = (2 * Math.PI * index) / group.length
          const offsetX = radius * Math.cos(angle)
          const offsetY = radius * Math.sin(angle)
          positionedMarkers.push({ person, offset: [offsetX, offsetY] })
        })
      }
    })

    return positionedMarkers
  }, [data])

  const toggleTagSelection = useCallback((tagId: string) => {
    // console.log(tagId)
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    )
  }, [])

  const markerPositions = useMemo(() => {
    return getMarkerPositions()
  }, [getMarkerPositions])

  const filteredMarkers = useMemo(() => {
    if (selectedTags.length === 0) return markerPositions
    return markerPositions.filter(({ person }) =>
      person.personsToTags?.some((tag) =>
        selectedTags.includes(tag.tag.tagName)
      )
    )
  }, [selectedTags, markerPositions])

  // console.log(filteredMarkers)

  const handleRefreshNavigation = useCallback(async () => {
    const { latitude, longitude, getAddress } = await getCurrentLocation()
    setPressedCoords({ latitude, longitude })
    setGeoCoords({ latitude, longitude })
    setAddress(getAddress[0])
  }, [setPressedCoords, setGeoCoords, setAddress])

  useEffect(() => {
    if (isFocused) {
      // console.log('Maps tab focused, refreshing data')
      // Use refetchQueries to force immediate refetch instead of just invalidating
      queryClient.refetchQueries({ queryKey: ['persons'] })
      queryClient.refetchQueries({ queryKey: ['followUps'] })
    }
  }, [isFocused, queryClient])

  const handleDeleteAnnotation = useCallback(
    async (id: number) => {
      try {
        await db.delete(markerAnnotation).where(eq(markerAnnotation.id, id))
        // Force refetch the data immediately
        await queryClient.invalidateQueries({ queryKey: ['markerAnnotation'] })
        await queryClient.refetchQueries({ queryKey: ['markerAnnotation'] })
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      } catch (error) {
        console.error('Error deleting annotation:', error)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      }
    },
    [queryClient]
  )

  // for android purpose only
  const handleDeleteAllAnnotations = useCallback(async () => {
    try {
      await db.delete(markerAnnotation).all()
      // Force refetch the data immediately
      await queryClient.invalidateQueries({ queryKey: ['markerAnnotation'] })
      await queryClient.refetchQueries({ queryKey: ['markerAnnotation'] })
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (error) {
      console.error('Error deleting all annotations:', error)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }, [queryClient])

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        mapStyle={mapStyle}
        logoEnabled={false}
        attributionEnabled={true}
        rotateEnabled={false}
        onLongPress={(event) => {
          const { geometry } = event
          if (geometry.type === 'Point') {
            const coordinates = geometry.coordinates
            const pressedLat = coordinates[1]
            const pressedLong = coordinates[0]
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid)
            setPressedCoords({ latitude: pressedLat, longitude: pressedLong })
            Alert.alert('create a record or marker', '', [
              {
                text: 'record',
                onPress: () =>
                  router.navigate({
                    pathname: '/formPage',
                  }),
                style: 'default',
              },
              {
                text: 'marker',
                onPress: () => setShowAnnotateModal(true),
                style: 'destructive',
              },
            ])
          }
        }}
      >
        <MapAnnotateModal
          showAnnotateModal={showAnnotateModal}
          setShowAnnotateModal={setShowAnnotateModal}
        />
        <Camera
          ref={cameraRef}
          zoomLevel={17}
          minZoomLevel={1}
          maxZoomLevel={20}
          centerCoordinate={[
            pressedCoords.longitude || longitude,
            pressedCoords.latitude || latitude,
          ]}
        />
        {/* Current Location Point */}
        <PointAnnotation
          id="currentLocation"
          coordinate={[longitude, latitude]}
          title="You are here"
        >
          <View style={styles.currentLocationMarkerOuterRim}>
            <View style={styles.currentLocationMarker}>
              <View style={styles.currentLocationMarkerInner} />
            </View>
          </View>
          <Callout title="You are here">
            <View style={styles.currentLocationCallout}>
              <Text style={styles.calloutText}>
                {i18n.t('statusOptions.labelYouAreHere')}
              </Text>
              <View style={styles.calloutTail} />
            </View>
          </Callout>
        </PointAnnotation>
        {/* Marker Annotations */}
        {markerAnnotationData?.map((annotation) => (
          <PointAnnotation
            key={annotation.id}
            id={`annotation-${annotation.id}`}
            coordinate={[annotation.longitude ?? 0, annotation.latitude ?? 0]}
            title={annotation.annotation || 'Annotation'}
          >
            <View style={styles.markerAnnotation}>
              <Foundation name="marker" size={20} color={Colors.white} />
            </View>
            <Callout title={annotation.annotation || 'Annotation'}>
              <View style={styles.annotationCallout}>
                <Pressable
                  onPress={() => handleDeleteAnnotation(annotation.id)}
                  style={styles.deleteAnnotationBtn}
                >
                  <X size={10} color={Colors.white} strokeWidth={2} />
                </Pressable>
                <Text style={styles.annotationCalloutText}>
                  {annotation.annotation || ''}
                </Text>

                <View
                  style={[
                    styles.calloutTail,
                    { borderTopColor: Colors.primary900 },
                  ]}
                />
              </View>
            </Callout>
          </PointAnnotation>
        ))}

        {filteredMarkers.map(({ person, offset }, index) => {
          // Sort follow-ups by date if they exist
          const sortedFollowUps =
            person.followUp && person.followUp.length > 0
              ? [...person.followUp].sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
              : []
          // console.log('sortedFollowUps --->>', sortedFollowUps)

          // Create unique key with tag IDs so React re-renders when tags change
          const tagIds =
            person.personsToTags
              ?.map((pt) => pt.tag.id)
              .sort()
              .join('-') || 'notags'

          return (
            person.latitude &&
            person.longitude && (
              <PointAnnotation
                key={`person-${person.id}-${tagIds}-${index}`}
                id={`person-${person.id}-${tagIds}-${index}`}
                coordinate={[
                  person.longitude + offset[0],
                  person.latitude + offset[1],
                ]}
                title={person.name || 'Unnamed Person'}
              >
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  }}
                  style={[
                    styles.personMarker,
                    {
                      backgroundColor:
                        person.category === 'CA'
                          ? Colors.emerald400
                          : person.category === 'RV'
                          ? Colors.emerald600
                          : Colors.emerald900,
                    },
                  ]}
                >
                  <Text style={styles.personMarkerText}>{person.category}</Text>
                </Pressable>
                <Callout title={person.name || 'Unnamed Person'}>
                  <View
                    style={[
                      styles.calloutContainer,
                      Platform.OS === 'ios' ? { maxHeight: 320 } : { flex: 1 },
                    ]}
                  >
                    <View style={styles.topBar}>
                      <Text style={styles.name}>
                        {person.name || 'Unnamed Person'}
                      </Text>
                      <View
                        style={[
                          styles.contactableBox,
                          {
                            backgroundColor: `${
                              statusOptions.find(
                                (option) => option.type === person.status
                              )?.color
                            }`,
                          },
                        ]}
                      >
                        <Text style={styles.contactableText}>
                          {
                            statusOptions.find(
                              (option) => option.type === person.status
                            )?.label
                          }
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 5,
                        alignItems: 'center',
                        marginVertical: 5,
                      }}
                    >
                      <FlatList
                        style={{ marginVertical: 2 }}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={person.personsToTags}
                        renderItem={({ item }) => (
                          <View
                            key={item.tag.id}
                            style={[
                              styles.contactableBox,
                              {
                                borderColor: Colors.lemon300,
                                borderWidth: 1,
                                marginRight: 5,
                              },
                            ]}
                          >
                            <Text
                              style={{
                                fontFamily: 'IBM-Medium',
                                fontSize: 12,
                                color: Colors.lemon300,
                              }}
                            >
                              {item.tag.tagName}
                            </Text>
                          </View>
                        )}
                      />
                      {/* {person.personsToTags?.map((tag) => (
                        <View
                          key={tag.tag.id}
                          style={[
                            styles.contactableBox,
                            {
                              borderColor: Colors.lemon300,
                              borderWidth: 1,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              fontFamily: 'IBM-Medium',
                              fontSize: 12,
                              color: Colors.lemon300,
                            }}
                          >
                            {tag.tag.tagName}
                          </Text>
                        </View>
                      ))} */}
                    </View>
                    <View style={styles.horizontalLine} />

                    <Text style={styles.address}>
                      {person.block ? 'Apt.' + person.block : ''}{' '}
                      {person.unit ? '#' + person.unit : ''} {person.street}
                    </Text>
                    {Platform.OS === 'ios' && (
                      <Pressable
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 5,
                          borderRadius: 30,
                          width: 100,
                          gap: 5,
                          marginVertical: 3,
                          backgroundColor: Colors.primary500,
                        }}
                        onPress={() => {
                          openMapsForNavigation(
                            person.latitude!,
                            person.longitude!
                          )
                        }}
                      >
                        <FontAwesome5
                          name="car-alt"
                          size={18}
                          color={Colors.primary50}
                        />
                        <Text
                          style={{
                            fontFamily: 'IBM-Medium',
                            fontSize: 14,
                            color: Colors.primary50,
                          }}
                        >
                          {i18n.t('statusOptions.labelNavigate')}
                        </Text>
                      </Pressable>
                    )}
                    {person.contact && (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'flex-end',
                          gap: 10,
                          //   backgroundColor: 'pink',
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: 'IBM-Medium',
                            fontSize: 14,
                            color: Colors.primary50,
                          }}
                        >
                          Contact
                        </Text>
                        <Text
                          style={{
                            fontFamily: 'IBM-Medium',
                            fontSize: 14,
                            color: Colors.primary50,
                          }}
                        >
                          {person.contact}
                        </Text>
                        {Platform.OS === 'ios' && (
                          <Pressable
                            onPress={() => handleCalling(person.contact ?? '')}
                          >
                            <Feather
                              name="phone-call"
                              size={18}
                              color="white"
                            />
                          </Pressable>
                        )}
                        {Platform.OS === 'ios' && (
                          <Pressable
                            onPress={() => openWhatsApp(person.contact ?? '')}
                          >
                            <FontAwesome6
                              name="whatsapp"
                              size={20}
                              color={Colors.emerald300}
                            />
                          </Pressable>
                        )}
                      </View>
                    )}

                    {person.date && (
                      <Text
                        style={{
                          fontFamily: 'IBM-Medium',
                          fontSize: 14,
                          color: Colors.primary50,
                          marginVertical: 3,
                        }}
                      >
                        {i18n.t('statusOptions.labelInitialVisit')}{' '}
                        {person.initialVisit
                          ? format(new Date(person.initialVisit), 'dd MMM yyyy')
                          : person.date}
                      </Text>
                    )}
                    {person.publications && (
                      <Text
                        style={{
                          fontFamily: 'IBM-Bold',
                          fontSize: 14,
                          color: Colors.lemon200,
                        }}
                      >
                        {person.publications}
                      </Text>
                    )}
                    <ScrollView
                      style={{ flex: 1 }}
                      nestedScrollEnabled={true}
                      showsVerticalScrollIndicator={true}
                    >
                      {person.remarks && (
                        <View style={styles.remarksBox}>
                          <Text style={styles.remarksText}>
                            {person.remarks}
                          </Text>
                        </View>
                      )}
                      {sortedFollowUps.length > 0 && (
                        <View>
                          <Text style={styles.labelText}>
                            {i18n.t('statusOptions.labelFollowUps')}
                          </Text>
                          {sortedFollowUps?.map((followUp) => (
                            <View
                              key={followUp.id}
                              style={[styles.remarksBox, { marginBottom: 0 }]}
                            >
                              <Text
                                style={{
                                  color: Colors.primary400,
                                  fontFamily: 'IBM-Regular',
                                  fontSize: 13,
                                  marginBottom: 3,
                                }}
                              >
                                {format(new Date(followUp.date), 'dd MMM yyyy')}
                              </Text>
                              <Text style={styles.remarksText}>
                                {followUp.notes}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </ScrollView>
                    <View style={styles.calloutTail} />
                  </View>
                </Callout>
              </PointAnnotation>
            )
          )
        })}
      </MapView>
      {Platform.OS === 'android' &&
        markerAnnotationData &&
        markerAnnotationData.length > 0 && (
          <Pressable
            style={{
              position: 'absolute',
              top: 20,
              right: 15,
              padding: 10,
              backgroundColor: Colors.rose600,
              opacity: 0.7,
              borderRadius: 8,
            }}
            onPress={handleDeleteAllAnnotations}
          >
            <Text
              style={{
                color: Colors.white,
                fontFamily: 'IBM-Regular',
                fontSize: 10,
              }}
            >
              Delete all markers
            </Text>
          </Pressable>
        )}
      {uniqueTags.length > 0 && (
        <View
          style={[
            styles.tagsContainer,
            { bottom: Platform.OS === 'android' ? 75 : bottom + 70 },
          ]}
        >
          <FlatList
            data={uniqueTags}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.tagItem,
                  selectedTags.includes(item.tagName) && {
                    backgroundColor: Colors.emerald900,
                  },
                ]}
                onPress={() => toggleTagSelection(item.tagName)}
              >
                <Text style={styles.tagText}>{item.tagName}</Text>
              </Pressable>
            )}
            horizontal
            inverted
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
        </View>
      )}
      <View
        style={{
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? bottom + 145 : bottom + 165,
          right: 15,
          gap: 12,
        }}
      >
        <Pressable
          style={styles.addBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            handleRefreshNavigation()
          }}
        >
          <Ionicons name="navigate" size={26} color={Colors.sky600} />
        </Pressable>
        <Pressable
          style={styles.addBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            router.navigate('/formPage')
          }}
        >
          <FontAwesome6 name="add" size={26} color={Colors.primary50} />
        </Pressable>
        <Pressable
          style={[styles.addBtn, { backgroundColor: Colors.emerald900 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            router.push('/remindersPage')
          }}
        >
          <FontAwesome6
            name="pen-to-square"
            size={24}
            color={Colors.emerald400}
          />
        </Pressable>
      </View>
      <Pressable
        style={{
          position: 'absolute',
          top: top + 3,
          right: 14,
          // backgroundColor: Colors.sky300,
          padding: 2,
          borderRadius: 100,
          borderWidth: 1,
          borderColor: Colors.primary950,
        }}
        onPress={() => setShowInfoPanel((prev) => !prev)}
      >
        {showInfoPanel ? (
          <Ionicons name="close" size={25} color={Colors.primary950} />
        ) : (
          <Ionicons
            name="information-circle"
            size={28}
            color={Colors.primary950}
          />
        )}
      </Pressable>
      {showInfoPanel && (
        <View
          style={{
            position: 'absolute',
            top: top + 45,
            right: 18,
            backgroundColor: Colors.primary900,
            padding: 12,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              fontFamily: 'IBM-Regular',
              fontSize: 14,
              color: Colors.white,
              textAlign: 'right',
            }}
          >
            {`If you want to create a new record at eg. Apt.789 \nbut have already left the area, long press on \nApt.789 on the map to drop a record there.`}
          </Text>
        </View>
      )}
    </View>
  )
}

export default MapLibreMap

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  tagsContainer: {
    position: 'absolute',
    // left: 15,
    width: '100%',
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
    // borderRadius: 10,
    padding: 8,
    zIndex: 200,
  },
  flatListContent: {
    alignItems: 'center',
  },
  tagItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginRight: 8,
  },
  tagText: {
    fontFamily: 'IBM-Medium',
    fontSize: 13,
    color: Colors.primary50,
  },
  currentLocationMarkerOuterRim: {
    width: 55,
    height: 55,
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 300,
  },
  currentLocationMarker: {
    width: 22,
    height: 22,
    backgroundColor: 'white',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 300,
  },
  currentLocationMarkerInner: {
    width: 15,
    height: 15,
    backgroundColor: '#2177d3',
    borderRadius: 100,
  },
  currentLocationCallout: {
    backgroundColor: Colors.primary900,
    borderRadius: 10,
    padding: 8,
    marginBottom: 10,
    minWidth: 110,
    position: 'relative',
    height: 40,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  annotationCallout: {
    backgroundColor: Colors.primary900,
    borderRadius: 10,
    padding: 8,
    marginBottom: 10,
    minWidth: 150,
    height: 'auto',
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    // gap: 2,
  },
  annotationCalloutText: {
    fontSize: 12,
    fontFamily: 'IBM-Bold',
    color: Colors.white,
  },
  deleteAnnotationBtn: {
    padding: 2,
    borderRadius: 100,
    borderColor: 'white',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  calloutContainer: {
    backgroundColor: Colors.primary900,
    borderRadius: 15,
    padding: 8,
    marginBottom: 10,
    minWidth: 300,
    position: 'relative',
    // maxHeight: 320,
    flex: 1,
  },
  calloutText: {
    fontSize: 12,
    fontFamily: 'IBM-Medium',
    color: Colors.white,
  },
  calloutTail: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -5,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderLeftColor: 'transparent',
    borderRightWidth: 10,
    borderRightColor: 'transparent',
    borderTopWidth: 10,
    borderTopColor: Colors.primary900,
    transform: [{ translateX: 2 }],
  },
  markerAnnotation: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    backgroundColor: Colors.rose500,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 0.7,
    shadowRadius: 1,
    elevation: 5,
    zIndex: 100,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  personMarker: {
    padding: 4,
    backgroundColor: Colors.emerald500,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 0.7,
    shadowRadius: 1,
    elevation: 5,
    zIndex: 100,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  personMarkerText: {
    fontFamily: 'IBM-Bold',
    fontSize: 14,
    color: Colors.white,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  name: {
    fontFamily: 'IBM-Bold',
    fontSize: 15,
    color: Colors.emerald300,
    paddingLeft: 3,
  },
  contactableBox: {
    padding: 3,
    borderRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactableText: {
    fontFamily: 'IBM-Medium',
    fontSize: 12,
    color: Colors.primary900,
  },
  horizontalLine: {
    marginVertical: 5,
    height: 1,
    backgroundColor: Colors.primary300,
  },
  address: {
    fontFamily: 'IBM-SemiBoldItalic',
    fontSize: 14,
    color: Colors.emerald300,
  },
  whatsAppImage: {
    width: 35,
    height: 35,
    aspectRatio: 'auto',
    backgroundColor: 'green',
  },
  remarksBox: {
    padding: 5,
    paddingBottom: 15,
    backgroundColor: Colors.primary800,
    borderRadius: 5,
    marginVertical: 10,
  },
  remarksText: {
    fontFamily: 'IBM-Italic',
    fontSize: 13,
    color: Colors.primary50,
  },
  labelText: {
    fontFamily: 'IBM-MediumItalic',
    fontSize: 14,
    color: Colors.primary300,
    paddingLeft: 6,
  },
  addBtn: {
    width: 50,
    height: 50,
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary900, // Changed from semi-transparent to solid color
    padding: 10,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
})
