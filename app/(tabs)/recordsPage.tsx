import { View, Text, StyleSheet, Pressable } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { router, Tabs } from 'expo-router'
import { Colors } from '@/constants/Colors'

import { useState, useEffect } from 'react'
import { FlashList } from '@shopify/flash-list'
import SingleRecord from '@/components/SingleRecord'

import * as Haptics from 'expo-haptics'
import useMyStore from '@/store/store'
import { Ionicons } from '@expo/vector-icons'
import { useTranslations } from '../_layout'

import { db } from '@/drizzle/db'
import { Person, TPerson } from '@/drizzle/schema'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { checkAndRequestReview } from '@/utils/storeReview'
import DetailsModal from '@/components/DetailsModal'

const RecordsPage = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  // const selectedPerson = useMyStore((state) => state.selectedPerson)
  const [modalVisible, setModalVisible] = useState(false)

  const queryClient = useQueryClient()
  const i18n = useTranslations()

  const { top } = useSafeAreaInsets()

  useEffect(() => {
    checkAndRequestReview()
  }, [])

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
                  <SingleRecord item={item} setModalVisible={setModalVisible} />
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
      <DetailsModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
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
