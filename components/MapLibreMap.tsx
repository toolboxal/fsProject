import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  Platform,
  Alert,
} from 'react-native'
import Text from '@/components/Text'
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
import { Ionicons } from '@expo/vector-icons'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import getCurrentLocation from '@/utils/getCurrentLoc'
import { useTranslations } from '@/app/_layout'
import { useIsFocused } from '@react-navigation/native'
import MapAnnotateModal from './MapAnnotateModal'
import DetailsModal from './DetailsModal'
import PersonMapCallout from './PersonMapCallout'
import Foundation from '@expo/vector-icons/Foundation'
import { X } from 'lucide-react-native'
import { eq } from 'drizzle-orm'
import { confirmDeletePerson, promptSharePerson } from '@/utils/personActions'
import { toast } from 'sonner-native'

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

const MAP_STYLE = {
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

const sortFollowUpsByDateDesc = (
  followUps: TPersonWithTagsAndFollowUps['followUp'],
) => {
  if (!followUps?.length) return []
  return [...followUps].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
}

type PositionedMarker = {
  person: TPersonWithTagsAndFollowUps
  offset: [number, number]
  sortedFollowUps: NonNullable<TPersonWithTagsAndFollowUps['followUp']>
}

const computePositionedMarkers = (
  persons: TPersonWithTagsAndFollowUps[],
): PositionedMarker[] => {
  const groupedMarkers: { [key: string]: TPersonWithTagsAndFollowUps[] } = {}
  persons.forEach((person) => {
    if (person.latitude && person.longitude) {
      const key = `${person.latitude},${person.longitude}`
      if (!groupedMarkers[key]) {
        groupedMarkers[key] = []
      }
      groupedMarkers[key].push(person)
    }
  })

  const positionedMarkers: PositionedMarker[] = []
  Object.values(groupedMarkers).forEach((group) => {
    if (group.length === 1) {
      positionedMarkers.push({
        person: group[0],
        offset: [0, 0],
        sortedFollowUps: sortFollowUpsByDateDesc(group[0].followUp),
      })
    } else {
      const radius = 0.00015
      group.forEach((person, index) => {
        const angle = (2 * Math.PI * index) / group.length
        positionedMarkers.push({
          person,
          offset: [radius * Math.cos(angle), radius * Math.sin(angle)],
          sortedFollowUps: sortFollowUpsByDateDesc(person.followUp),
        })
      })
    }
  })

  return positionedMarkers
}

type PersonStatus = NonNullable<TPerson['status']>

const MapLibreMap = () => {
  const { top, bottom } = useSafeAreaInsets()
  const [showAnnotateModal, setShowAnnotateModal] = useState(false)
  const [annotateCoords, setAnnotateCoords] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [cameraCenter, setCameraCenter] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const setAddress = useMyStore((state) => state.setAddress)
  const setGeoCoords = useMyStore((state) => state.setGeoCoords)
  const mapFocusRequest = useMyStore((state) => state.mapFocusRequest)
  const clearMapFocusRequest = useMyStore((state) => state.clearMapFocusRequest)
  const latitude = useMyStore((state) => state.geoCoords.latitude)
  const longitude = useMyStore((state) => state.geoCoords.longitude)
  const i18n = useTranslations()
  const queryClient = useQueryClient()
  const isFocused = useIsFocused()
  const cameraRef = useRef<CameraRef>(null)
  const [showInfoPanel, setShowInfoPanel] = useState(false)
  const [detailsVisible, setDetailsVisible] = useState(false)
  const [detailsPersonId, setDetailsPersonId] = useState<number | null>(null)
  const [detailsInitialView, setDetailsInitialView] = useState<
    'profile' | 'followUp'
  >('profile')

  const statusLookup = useMemo(
    () =>
      ({
        irregular: {
          label: i18n.t('statusOptions.labelIrregular'),
          color: Colors.sky200,
        },
        frequent: {
          label: i18n.t('statusOptions.labelFrequent'),
          color: Colors.purple100,
        },
        committed: {
          label: i18n.t('statusOptions.labelCommitted'),
          color: Colors.purple300,
        },
      }) satisfies Record<PersonStatus, { label: string; color: string }>,
    [i18n],
  )

  const router = useRouter()

  const openDetailsFollowUp = useCallback((personId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setDetailsPersonId(personId)
    setDetailsInitialView('followUp')
    setDetailsVisible(true)
  }, [])

  const handleCalloutEdit = useCallback(
    (personId: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      router.push({
        pathname: '/editPage',
        params: { id: String(personId) },
      })
    },
    [router],
  )

  const handleCalloutShare = useCallback((personId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    promptSharePerson(personId)
  }, [])

  const handleCalloutDelete = useCallback(
    (personId: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      confirmDeletePerson(personId, queryClient, {
        title: i18n.t('detailsModal.deleteAlertTitle'),
        description: i18n.t('detailsModal.deleteAlertDesc'),
        confirm: i18n.t('detailsModal.confirm'),
        cancel: i18n.t('detailsModal.cancel'),
        successToast: i18n.t('detailsModal.deleteToast'),
      })
    },
    [queryClient, i18n],
  )

  const handleDetailsModalVisibleChange = useCallback(
    (value: React.SetStateAction<boolean>) => {
      setDetailsVisible((prev) => {
        const next = typeof value === 'function' ? value(prev) : value
        if (!next) {
          setDetailsPersonId(null)
          setDetailsInitialView('profile')
        }
        return next
      })
    },
    [],
  )

  const { data: markerAnnotationData } = useQuery<TMarkerAnnotation[]>({
    queryKey: ['markerAnnotation'],
    queryFn: async () => db.query.markerAnnotation.findMany(),
  })

  const { data } = useQuery<TPersonWithTagsAndFollowUps[]>({
    queryKey: ['persons', 'map'],
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
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  })

  const uniqueTags = useMemo(() => {
    if (!data) return []

    const tagsArr = data
      .map((person) => person.personsToTags?.map((pt) => pt.tag) || [])
      .filter((tags) => tags.length > 0)

    const allTags = tagsArr.flat()
    return allTags
      .filter(
        (tag, index, self) => index === self.findIndex((t) => t.id === tag.id),
      )
      .sort((a, b) => a.tagName.localeCompare(b.tagName))
  }, [data])

  const toggleTagSelection = useCallback((tagId: string) => {
    // console.log(tagId)
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    )
  }, [])

  const markerPositions = useMemo((): PositionedMarker[] => {
    if (!data) return []
    return computePositionedMarkers(data)
  }, [data])

  const markerFilterKey = useMemo(
    () =>
      selectedTags.length === 0 ? 'all' : [...selectedTags].sort().join('-'),
    [selectedTags],
  )

  const filteredMarkers = useMemo(() => {
    if (!data) return []

    const filteredPersons =
      selectedTags.length === 0
        ? data
        : data.filter((person) =>
            person.personsToTags?.some((pt) =>
              selectedTags.includes(pt.tag.tagName),
            ),
          )

    return computePositionedMarkers(filteredPersons)
  }, [selectedTags, data])

  // console.log(filteredMarkers)

  const handleRefreshNavigation = useCallback(async () => {
    const { latitude, longitude, getAddress } = await getCurrentLocation()
    setCameraCenter({ latitude, longitude })
    setGeoCoords({ latitude, longitude })
    setAddress(getAddress[0])
  }, [setGeoCoords, setAddress])

  useEffect(() => {
    if (isFocused) {
      queryClient.invalidateQueries({ queryKey: ['persons', 'map'] })
    }
  }, [isFocused, queryClient])

  useEffect(() => {
    if (!mapFocusRequest || !isFocused || !data) return

    const { personId } = mapFocusRequest
    const positioned = markerPositions.find((m) => m.person.id === personId)

    if (!positioned) {
      clearMapFocusRequest()
      toast.error(i18n.t('detailsModal.locateNoCoords'))
      return
    }

    const { person, offset } = positioned
    setSelectedTags([])
    setCameraCenter({
      latitude: person.latitude! + offset[1],
      longitude: person.longitude! + offset[0],
    })
    clearMapFocusRequest()
  }, [
    mapFocusRequest,
    isFocused,
    data,
    markerPositions,
    clearMapFocusRequest,
    i18n,
  ])

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
    [queryClient],
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
        mapStyle={MAP_STYLE}
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
            Alert.alert('create a record or marker', '', [
              {
                text: 'record',
                onPress: () =>
                  router.navigate({
                    pathname: '/formPage',
                    params: {
                      lat: String(pressedLat),
                      lng: String(pressedLong),
                    },
                  }),
                style: 'default',
              },
              {
                text: 'marker',
                onPress: () => {
                  setAnnotateCoords({
                    latitude: pressedLat,
                    longitude: pressedLong,
                  })
                  setShowAnnotateModal(true)
                },
                style: 'destructive',
              },
            ])
          }
        }}
      >
        <Camera
          ref={cameraRef}
          zoomLevel={17}
          minZoomLevel={1}
          maxZoomLevel={20}
          centerCoordinate={[
            cameraCenter?.longitude ?? longitude,
            cameraCenter?.latitude ?? latitude,
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

        {filteredMarkers.map(({ person, offset, sortedFollowUps }) => {
          const personStatus =
            person.status != null ? statusLookup[person.status] : undefined

          return (
            person.latitude &&
            person.longitude && (
              <PointAnnotation
                key={`person-${person.id}-${markerFilterKey}`}
                id={`person-${person.id}-${markerFilterKey}`}
                coordinate={[
                  person.longitude + offset[0],
                  person.latitude + offset[1],
                ]}
                title={person.name || 'Unnamed Person'}
              >
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
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
                  <PersonMapCallout
                    person={person}
                    sortedFollowUps={sortedFollowUps}
                    personStatus={personStatus}
                    onEdit={handleCalloutEdit}
                    onShare={handleCalloutShare}
                    onFollowUp={openDetailsFollowUp}
                    onDelete={handleCalloutDelete}
                    onNavigate={openMapsForNavigation}
                    onCall={handleCalling}
                    onWhatsApp={openWhatsApp}
                  />
                </Callout>
              </PointAnnotation>
            )
          )
        })}
      </MapView>
      <MapAnnotateModal
        showAnnotateModal={showAnnotateModal}
        setShowAnnotateModal={setShowAnnotateModal}
        coords={annotateCoords}
      />
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
            { bottom: Platform.OS === 'android' ? 90 : bottom + 70 },
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
          bottom: Platform.OS === 'ios' ? bottom + 145 : bottom + 110,
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
          top: Platform.OS === 'ios' ? top + 3 : top + 40,
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
            top: Platform.OS === 'ios' ? top + 45 : top + 80,
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
      <DetailsModal
        modalVisible={detailsVisible}
        setModalVisible={handleDetailsModalVisibleChange}
        personId={detailsPersonId}
        initialPageView={detailsInitialView}
        closeAfterFollowUpSubmit
      />
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
    marginBottom: Platform.OS === 'android' ? 5 : 10,
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
    marginBottom: Platform.OS === 'android' ? 0 : 10,
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
