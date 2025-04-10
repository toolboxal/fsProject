import { useEffect } from 'react'
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Pressable,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { router, useFocusEffect, Tabs } from 'expo-router'
import { Colors } from '@/constants/Colors'
import { defaultStyles } from '@/constants/Styles'
import { useCallback, useMemo, useRef, useState } from 'react'
import { FlashList } from '@shopify/flash-list'
import SingleRecord from '@/components/SingleRecord'
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet'
import * as Haptics from 'expo-haptics'
import useMyStore from '@/store/store'
import { useActionSheet } from '@expo/react-native-action-sheet'
import FontAwesome from '@expo/vector-icons/FontAwesome6'
import { Ionicons } from '@expo/vector-icons'
import { toast } from 'sonner-native'
import sharePerson from '@/utils/sharePerson'
import { useTranslations } from '../_layout'

import { db } from '@/drizzle/db'
import { Person, TPerson } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
// import { useLiveQuery } from 'drizzle-orm/expo-sqlite'
import { useQuery, QueryClient, useQueryClient } from '@tanstack/react-query'
import { checkAndRequestReview } from '@/utils/storeReview'
import * as Linking from 'expo-linking'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import Feather from '@expo/vector-icons/Feather'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'

const RecordsPage = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const selectedPerson = useMyStore((state) => state.selectedPerson)

  const snapPoints = useMemo(() => ['23%', '60%'], [])
  const bottomSheetRef = useRef<BottomSheet>(null)
  const queryClient = useQueryClient()
  const i18n = useTranslations()

  const { top } = useSafeAreaInsets()

  useEffect(() => {
    checkAndRequestReview()
  }, [])

  // const { data: persons } = useLiveQuery(db.select().from(Person))

  const { data: persons } = useQuery({
    queryKey: ['persons'],
    queryFn: () => {
      const result = db.select().from(Person).all()
      return result
    },
  })

  const onRefresh = async () => {
    setRefreshing(true)
    // Refetch the data
    await queryClient.invalidateQueries({ queryKey: ['persons'] })
    setRefreshing(false)
  }

  const { showActionSheetWithOptions } = useActionSheet()

  const handleOpenBtmSheet = (
    action: 'close' | 'expand' | 'snapPoint',
    index: number = 0
  ) => {
    if (action === 'close') {
      bottomSheetRef.current?.close()
    } else if (action === 'expand') {
      bottomSheetRef.current?.expand()
    } else {
      bottomSheetRef.current?.snapToIndex(index)
    }
  }

  useFocusEffect(
    useCallback(() => {
      handleOpenBtmSheet('close')
    }, [])
  )

  const handleDeleteAlert = (personId: number) => {
    Alert.alert(
      i18n.t('records.deleteAlertTitle'),
      i18n.t('records.deleteAlertDesc'),
      [
        {
          text: i18n.t('records.confirm'),
          onPress: async () => {
            await db.delete(Person).where(eq(Person.id, personId))
            queryClient.invalidateQueries({ queryKey: ['persons'] })
            handleOpenBtmSheet('close')

            toast.success(`${i18n.t('records.deleteToast')} 🗑️`)
            console.log('confirm delete')
          },
          style: 'destructive',
        },
        {
          text: i18n.t('records.cancel'),
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
      ]
    )
  }

  const actionSheetPressed = (personId: number) => {
    const options = [
      i18n.t('records.actionDelete'),
      i18n.t('records.actionShare'),
      i18n.t('records.actionEdit'),
      i18n.t('records.actionCancel'),
    ]
    const destructiveButtonIndex = 0
    const cancelButtonIndex = 3
    showActionSheetWithOptions(
      {
        options,
        destructiveButtonIndex,
        cancelButtonIndex,
      },
      (selectedIndex: number | undefined) => {
        switch (selectedIndex) {
          case destructiveButtonIndex:
            // console.log('deleted', personId)
            handleDeleteAlert(personId)
            break
          case 1:
            // console.log('to share', personId)
            sharePerson(personId)
            break
          case 2:
            console.log('to edit', personId)
            router.push('/editPage')
            break
          case cancelButtonIndex:
            console.log('canceled', personId)
        }
      }
    )
  }

  const handleActionSheet = (personId: number) => {
    actionSheetPressed(personId)
  }

  // --------data formatting----------

  const categoryMap: { [key: string]: TPerson[] } = {}

  persons?.forEach((person) => {
    const place = person.block || person.street
    if (!categoryMap[place ?? '']) {
      categoryMap[place ?? ''] = []
    }
    categoryMap[place ?? ''].push(person)
  })

  const formattedData = Object.entries(categoryMap).map(([block, person]) => ({
    title: block,
    data: person,
  }))

  const sorted = formattedData.sort((a, b) =>
    a.title.localeCompare(b.title, undefined, {
      numeric: true,
      sensitivity: 'base',
    })
  )
  const flatMapped = sorted.flatMap((item) => [item.title, ...item.data])

  // console.log('sorted formatted flatmap: ', flatMapped)

  const stickyHeaderIndices = flatMapped
    .map((item, index) => {
      if (typeof item === 'string') {
        return index
      } else {
        return null
      }
    })
    .filter((item) => item !== null) as number[]
  // --------end of data formatting----------

  console.log('recordsPage render')

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

  // Function to open maps with navigation
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
      <StatusBar style="dark" />
      <Tabs.Screen
        options={{
          headerTitle: '',
          headerStyle: {
            backgroundColor: Colors.primary50,
            height: top + 45,
          },
          headerLeft: () => (
            <Pressable
              style={styles.headerLeftBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                router.navigate('/formPage')
                if (menuOpen === true) {
                  setMenuOpen(false)
                }
              }}
            >
              <Ionicons
                name="create-outline"
                size={20}
                color={Colors.emerald900}
              />
              <Text style={styles.btnTextLeft}>
                {i18n.t('records.tabHeaderLeft')}
              </Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              style={styles.headerRightBtn}
              onPress={() => {
                // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                router.navigate('/optionsPage')
              }}
            >
              <Text style={styles.btnTextRight}>
                {i18n.t('records.tabHeaderRight')}
              </Text>
            </Pressable>
          ),
        }}
      />

      {(persons === undefined || persons.length) === 0 ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text
            style={{
              fontFamily: 'IBM-SemiBold',
              fontSize: 18,
              color: Colors.primary300,
            }}
          >
            Start by creating your first record
          </Text>
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.primary300,
            // width: '100%',
          }}
        >
          <FlashList
            contentContainerStyle={{ paddingBottom: 200 }}
            data={flatMapped}
            renderItem={({ item }) => {
              if (typeof item === 'string') {
                // Rendering header
                return <Text style={styles.header}>{item}</Text>
              } else {
                // Render item
                return (
                  <SingleRecord
                    item={item}
                    handleOpenBtmSheet={handleOpenBtmSheet}
                    handleActionSheet={handleActionSheet}
                  />
                )
              }
            }}
            stickyHeaderIndices={stickyHeaderIndices}
            getItemType={(item) => {
              return typeof item === 'string' ? 'sectionHeader' : 'row'
            }}
            estimatedItemSize={50}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        </View>
      )}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={-1}
        backgroundStyle={{ backgroundColor: Colors.primary800 }}
        handleIndicatorStyle={{ backgroundColor: Colors.primary100 }}
        style={{ flex: 1, paddingHorizontal: 10 }}
      >
        <BottomSheetView
          style={{
            paddingTop: 12,
            paddingBottom: 10,
            // backgroundColor: 'lightpink',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <BottomSheetView>
            <Text style={styles.btmSheetHeader}>
              {selectedPerson.name?.length! > 18
                ? selectedPerson.name?.slice(0, 15) + '..'
                : selectedPerson.name}
            </Text>
            <BottomSheetView
              style={[
                styles.categoryCircle,
                {
                  backgroundColor: `${
                    selectedPerson.category === 'RV'
                      ? Colors.emerald600
                      : selectedPerson.category === 'BS'
                      ? Colors.emerald900
                      : Colors.emerald400
                  }`,
                },
              ]}
            >
              <Text style={styles.categoryText}>{selectedPerson.category}</Text>
            </BottomSheetView>
          </BottomSheetView>
          <TouchableOpacity
            onPress={() => handleActionSheet(selectedPerson.id)}
            style={{
              // position: 'absolute',
              // top: 10,
              // right: 20,
              alignItems: 'center',
              paddingRight: 5,
            }}
          >
            <FontAwesome name="grip" size={22} color={Colors.sky100} />
            <Text style={{ color: Colors.sky100 }}>
              {i18n.t('records.menu')}
            </Text>
          </TouchableOpacity>
        </BottomSheetView>
        <BottomSheetScrollView
          contentContainerStyle={{
            flexGrow: 1,
            // backgroundColor: 'lightgrey',
            paddingBottom: 120,
          }}
        >
          <BottomSheetView
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              justifyContent: 'flex-start',
              gap: 6,
            }}
          >
            <Text style={[defaultStyles.textH2, { color: Colors.emerald200 }]}>
              {selectedPerson.block ? 'Apt.' + selectedPerson.block : ''}
            </Text>
            <Text style={[defaultStyles.textH2, { color: Colors.emerald200 }]}>
              #{selectedPerson.unit}
            </Text>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
            >
              <Text
                style={[defaultStyles.textH2, { color: Colors.emerald200 }]}
              >
                {selectedPerson.street?.length! > 25
                  ? selectedPerson.street?.slice(0, 20) + '...'
                  : selectedPerson.street}
              </Text>
              <Pressable
                onPress={() => {
                  openMapsForNavigation(
                    selectedPerson.latitude!,
                    selectedPerson.longitude!
                  )
                }}
              >
                <FontAwesome5 name="car-alt" size={22} color="white" />
              </Pressable>
            </View>
          </BottomSheetView>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
            <Text style={[defaultStyles.textH2, styles.contactText]}>
              {`${i18n.t('records.contact')}: ${selectedPerson.contact}`}
            </Text>
            {selectedPerson.contact && (
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
              >
                <Pressable
                  onPress={() => handleCalling(selectedPerson.contact ?? '')}
                >
                  <Feather name="phone-call" size={22} color="white" />
                </Pressable>
                <Pressable
                  onPress={() => openWhatsApp(selectedPerson.contact ?? '')}
                >
                  <Image
                    source={require('@/assets/images/whatsapp-logo.png')}
                    style={styles.whatsAppImage}
                  />
                </Pressable>
              </View>
            )}
          </View>
          <Text style={styles.dateText}>{selectedPerson.date}</Text>
          {selectedPerson.publications && (
            <Text style={styles.publicationsText}>
              {selectedPerson.publications}
            </Text>
          )}
          <BottomSheetView
            style={{
              padding: 15,
              paddingBottom: 15,
              backgroundColor: Colors.primary600,
              borderRadius: 5,
              marginVertical: 10,
            }}
          >
            <Text style={styles.remarksText}>{selectedPerson.remarks}</Text>
          </BottomSheetView>
        </BottomSheetScrollView>
      </BottomSheet>
    </SafeAreaView>
  )
}
export default RecordsPage

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    paddingHorizontal: 15,
    backgroundColor: Colors.primary50,
    position: 'relative',
    zIndex: 2,
  },
  headerText: {
    fontFamily: 'IBM-Bold',
    fontSize: 25,
    color: Colors.emerald900,
  },
  addBtn: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 2,
    borderColor: Colors.emerald900,
    backgroundColor: Colors.primary100,
    padding: 10,
    borderRadius: 30,
  },
  apartmentBtnsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 7,
    elevation: 5,
    backgroundColor: Colors.primary50,
  },

  header: {
    fontFamily: 'IBM-Bold',
    fontSize: 20,
    backgroundColor: Colors.primary300,
    color: Colors.primary900,
    padding: 3,
    paddingLeft: 12,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary50,
  },
  btmSheetContent: {
    flex: 1,
  },
  btmSheetHeaderContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'lightpink',
    flexDirection: 'row',
    alignItems: 'center',
  },
  btmSheetHeader: {
    fontFamily: 'IBM-Bold',
    fontSize: 26,
    color: Colors.white,
  },
  categoryCircle: {
    width: 33,
    height: 33,
    borderRadius: 50,
    position: 'absolute',
    top: -10,
    right: -40,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  categoryText: {
    fontFamily: 'IBM-Bold',
    fontSize: 15,
    color: Colors.white,
  },
  btmSheetScrollViewContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'lightgreen',
  },
  btmSheetAddContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-start',
    gap: 6,
  },
  remarksBox: {
    flexGrow: 1,
    backgroundColor: Colors.primary600,
    padding: 15,
    borderRadius: 8,
    position: 'relative',
    // marginBottom: 120,
  },
  remarksText: {
    fontFamily: 'IBM-Regular',
    fontSize: 18,
    color: Colors.primary100,
  },
  publicationsText: {
    fontFamily: 'IBM-SemiBoldItalic',
    fontSize: 18,
    color: Colors.lemon100,
    marginTop: 5,
  },
  burgerContainer: {
    width: 40,
    height: 40,
    backgroundColor: Colors.primary900,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 25,
  },
  contactText: {
    marginVertical: 10,
    fontFamily: 'IBM-MediumItalic',
    fontSize: 18,
    color: Colors.emerald200,
  },
  dateText: {
    color: Colors.primary300,
    letterSpacing: 0.6,
    fontSize: 16,
  },
  btnTextLeft: {
    color: Colors.emerald800,
    fontFamily: 'IBM-Medium',
    fontSize: 18,
  },
  btnTextRight: {
    color: Colors.emerald800,
    fontFamily: 'IBM-Medium',
    fontSize: 18,
  },
  headerLeftBtn: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
    marginLeft: 10,
    padding: 5,
  },
  headerRightBtn: {
    marginRight: 15,
    padding: 5,
  },
  whatsAppImage: {
    width: 45,
    aspectRatio: 'auto',
    height: 45,
  },
})
