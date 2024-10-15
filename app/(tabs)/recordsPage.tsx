import {
  View,
  Text,
  // SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { router, useFocusEffect } from 'expo-router'
import { Colors } from '@/constants/Colors'
import { defaultStyles } from '@/constants/Styles'
import { useCallback, useMemo, useRef, useState } from 'react'
import { FlashList } from '@shopify/flash-list'
import SingleRecord from '@/components/SingleRecord'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import useMyStore from '@/store/store'
import { useActionSheet } from '@expo/react-native-action-sheet'
import FontAwesome from '@expo/vector-icons/FontAwesome6'
import { Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-root-toast'
import sharePerson from '@/utils/sharePerson'
import DropdownMenu from '@/components/DropdownMenu'

import { db } from '@/drizzle/db'
import { Person, TPerson } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import { useLiveQuery } from 'drizzle-orm/expo-sqlite'
import { useQuery, QueryClient, useQueryClient } from '@tanstack/react-query'

const RecordsPage = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const selectedPerson = useMyStore((state) => state.selectedPerson)

  const snapPoints = useMemo(() => ['20%', '55%'], [])
  const bottomSheetRef = useRef<BottomSheet>(null)
  const queryClient = useQueryClient()

  // const { data: persons } = useLiveQuery(db.select().from(Person))

  const { data: persons } = useQuery({
    queryKey: ['persons'],
    queryFn: () => {
      const result = db.select().from(Person).all()
      return result
    },
  })

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

  const showToast = (name?: string) => {
    Toast.show(`Record has been deleted 🔥`, {
      duration: 5000,
      position: 60,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
      backgroundColor: Colors.rose200,
      textColor: Colors.primary900,
      opacity: 1,
    })
  }

  const handleDeleteAlert = (personId: number) => {
    Alert.alert('Record will be deleted', 'Ok to proceed?', [
      {
        text: 'Confirm',
        onPress: async () => {
          await db.delete(Person).where(eq(Person.id, personId))
          queryClient.invalidateQueries({ queryKey: ['persons'] })
          handleOpenBtmSheet('close')
          showToast()
          console.log('confirm delete')
        },
        style: 'destructive',
      },
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
    ])
  }

  const actionSheetPressed = (personId: number) => {
    const options = ['Delete', 'Share', 'Edit', 'Cancel']
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

  const handleMenuOpen = () => {
    setMenuOpen(!menuOpen)
  }

  const handleOutsidePress = () => {
    if (menuOpen) {
      setMenuOpen(false)
    }
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

  // JSX when there no existing records
  if ((persons === undefined || persons.length) === 0)
    return (
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Colors.primary50,
            paddingTop: Platform.OS === 'android' ? 40 : 0,
          }}
        >
          <StatusBar style="dark" />
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => {
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
              <Text
                style={{
                  fontFamily: 'IBM-Bold',
                  fontSize: 16,
                  color: Colors.emerald900,
                }}
              >
                Create
              </Text>
            </TouchableOpacity>
            <Text style={styles.headerText}>Records</Text>
            <TouchableOpacity
              style={styles.burgerContainer}
              onPress={() => setMenuOpen(!menuOpen)}
              activeOpacity={0.6}
            >
              <Ionicons name="menu" size={30} color={Colors.primary100} />
            </TouchableOpacity>
            {menuOpen && (
              <DropdownMenu
                handleMenuOpen={handleMenuOpen}
                existingRecords={false}
              />
            )}
          </View>
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text
              style={{
                fontFamily: 'IBM-SemiBold',
                fontSize: 22,
                color: Colors.primary300,
              }}
            >
              No Records
            </Text>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    )

  // JSX when there are records
  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.primary50,
          paddingTop: Platform.OS === 'android' ? 40 : 0,
        }}
        edges={['top', 'right', 'left']}
      >
        <StatusBar style="dark" />

        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
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
            <Text
              style={{
                fontFamily: 'IBM-Bold',
                fontSize: 16,
                color: Colors.emerald900,
              }}
            >
              Create
            </Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>Records</Text>
          <TouchableOpacity
            style={styles.burgerContainer}
            onPress={() => setMenuOpen(!menuOpen)}
            activeOpacity={0.8}
          >
            <Ionicons name="menu" size={30} color={Colors.primary100} />
          </TouchableOpacity>
          {menuOpen && (
            <DropdownMenu
              handleMenuOpen={handleMenuOpen}
              existingRecords={true}
            />
          )}
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: Colors.primary300,
            width: '100%',
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
          />
        </View>
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          index={-1}
          backgroundStyle={{ backgroundColor: Colors.primary800 }}
          handleIndicatorStyle={{ backgroundColor: Colors.primary100 }}
        >
          <View style={styles.btmSheetHeaderContainer}>
            <View
              style={{
                position: 'relative',
              }}
            >
              <Text style={styles.btmSheetHeader}>{selectedPerson.name}</Text>
              <View
                style={[
                  styles.categoryCircle,
                  {
                    backgroundColor: `${
                      selectedPerson.category === 'RV'
                        ? Colors.rose400
                        : selectedPerson.category === 'BS'
                        ? Colors.emerald700
                        : Colors.sky600
                    }`,
                  },
                ]}
              >
                <Text style={styles.categoryText}>
                  {selectedPerson.category}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handleActionSheet(selectedPerson.id)}
              style={{
                position: 'absolute',
                top: 10,
                right: 20,
                alignItems: 'center',
              }}
            >
              <FontAwesome name="grip" size={22} color={Colors.sky100} />
              <Text style={{ color: Colors.sky100 }}>menu</Text>
            </TouchableOpacity>
          </View>
          <BottomSheetScrollView style={styles.btmSheetScrollView}>
            <View style={styles.btmSheetAddContainer}>
              <Text
                style={[defaultStyles.textH2, { color: Colors.emerald200 }]}
              >
                #{selectedPerson.unit}
              </Text>
              <Text
                style={[defaultStyles.textH2, { color: Colors.emerald200 }]}
              >
                {selectedPerson.street}
              </Text>
            </View>
            <Text
              style={[
                defaultStyles.textH2,
                {
                  marginVertical: 10,
                  fontFamily: 'IBM-MediumItalic',
                  fontSize: 18,
                  color: Colors.emerald200,
                },
              ]}
            >
              {`contact: ${selectedPerson.contact}`}
            </Text>
            <View style={styles.remarksBox}>
              <Text style={styles.remarksText}>{selectedPerson.remarks}</Text>
              <Text
                style={{
                  position: 'absolute',
                  color: Colors.primary300,
                  top: -20,
                  right: 5,
                  letterSpacing: 0.5,
                }}
              >
                {selectedPerson.date}
              </Text>
            </View>
          </BottomSheetScrollView>
        </BottomSheet>
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
  btmSheetHeaderContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    // backgroundColor: 'lightpink',
    flexDirection: 'row',
    alignItems: 'center',
  },
  btmSheetHeader: {
    fontFamily: 'IBM-Bold',
    fontSize: 30,
    color: Colors.sky100,
  },
  categoryCircle: {
    width: 35,
    height: 35,
    backgroundColor: Colors.emerald700,
    borderRadius: 50,
    position: 'absolute',
    top: -10,
    right: -40,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontFamily: 'IBM-Bold',
    fontSize: 15,
    color: Colors.white,
  },
  btmSheetScrollView: {
    padding: 20,
    flex: 1,
  },
  btmSheetAddContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-start',
    gap: 7,
  },
  remarksBox: {
    backgroundColor: Colors.primary600,
    padding: 15,
    borderRadius: 8,
    position: 'relative',
    marginBottom: 130,
  },
  remarksText: {
    fontFamily: 'IBM-Regular',
    fontSize: 18,
    color: Colors.primary100,
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
})
