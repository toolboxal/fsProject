import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Appearance,
} from 'react-native'
import Text from '@/components/Text'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { router, Stack } from 'expo-router'
import { Colors } from '@/constants/Colors'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { FlashList } from '@shopify/flash-list'
import SingleRecord from '@/components/SingleRecord'

import * as Haptics from 'expo-haptics'
import useMyStore from '@/store/store'
import { storage } from '@/store/storage'
import { differenceInDays } from 'date-fns'
import { Ionicons } from '@expo/vector-icons'
import { useTranslations } from '../../_layout'

import { db } from '@/drizzle/db'
import { Person, TPerson, TPersonWithTags } from '@/drizzle/schema'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { checkAndRequestReview } from '@/utils/storeReview'
import DetailsModal from '@/components/DetailsModal'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'

const filterOptions = [
  { type: 'all', label: 'All' },
  { type: 'irregular', label: 'hard to find' },
  { type: 'frequent', label: 'frequent visits' },
  { type: 'committed', label: 'established' },
]

const RecordsPage = () => {
  const colorScheme = Appearance.getColorScheme()
  const [refreshing, setRefreshing] = useState(false)
  // const selectedPerson = useMyStore((state) => state.selectedPerson)
  const [modalVisible, setModalVisible] = useState(false)
  const [searchBarQuery, setSearchBarQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<number[]>([])

  const queryClient = useQueryClient()
  const i18n = useTranslations()

  const { top, bottom } = useSafeAreaInsets()

  const lastBackupTimestamp = storage.getString('last_backup_timestamp')
  const diffInDays = lastBackupTimestamp
    ? differenceInDays(new Date(), new Date(lastBackupTimestamp))
    : 0
  // console.log('differenceInDays', diffInDays)
  const backupMsg =
    lastBackupTimestamp && diffInDays >= 1
      ? `Your last attempted backup was ${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago.\nBackup to ${Platform.OS === 'ios' ? 'iCloud' : 'Google Drive'} ☁️ at least once a month.`
      : lastBackupTimestamp && diffInDays === 0
        ? `Thank you for backing up your data. 💪`
        : `A reminder to backup your file and save to ${Platform.OS === 'ios' ? 'iCloud' : 'Google Drive'} ☁️.\nGo to Options -> create backup`

  useEffect(() => {
    // storage.delete('last_backup_timestamp')
    checkAndRequestReview()
  }, [])

  const { data: persons } = useQuery({
    queryKey: ['persons'],
    queryFn: async () => {
      const result = await db.query.Person.findMany({
        with: {
          personsToTags: {
            with: {
              tag: true,
            },
          },
        },
      })
      return result as TPersonWithTags[]
    },
  })
  // console.log(persons)

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const fetchedTags = await db.query.tags.findMany()
      return fetchedTags.sort((a, b) => a.tagName.localeCompare(b.tagName))
    },
  })

  const filteredPersons =
    persons?.filter((person) => {
      const matchesName = person.name
        ?.toLowerCase()
        .includes(searchBarQuery.toLowerCase())
      if (selectedTags.length === 0) {
        return matchesName
      }
      const personTagIds = (person.personsToTags || []).map((pt) => pt.tag.id)
      const matchesTags = selectedTags.some((tagId) =>
        personTagIds.includes(tagId),
      )
      return matchesName && matchesTags
    }) || []

  const onRefresh = async () => {
    setRefreshing(true)
    // Refetch the data
    await queryClient.invalidateQueries({ queryKey: ['persons'] })
    setRefreshing(false)
  }

  // --------data formatting----------

  const categoryMap: { [key: string]: TPersonWithTags[] } = {}

  filteredPersons?.forEach((person) => {
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
    }),
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

  // Move useCallback hooks outside conditional rendering to comply with Rules of Hooks
  const renderItem = useCallback(
    ({ item }: { item: string | TPersonWithTags }) => {
      if (typeof item === 'string') {
        // Rendering header
        return <Text style={styles.header}>{item}</Text>
      } else {
        // Render item
        return <SingleRecord item={item} setModalVisible={setModalVisible} />
      }
    },
    [setModalVisible],
  )

  const getItemType = useCallback((item: string | TPersonWithTags) => {
    return typeof item === 'string' ? 'sectionHeader' : 'row'
  }, [])

  // console.log('recordsPage render')

  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'left', 'top']}>
      <StatusBar style="dark" />
      <Stack.Screen
        options={{
          headerTitle: '',
          headerStyle: {
            backgroundColor: Colors.primary50,
            // height: top + 45,
          },
          headerSearchBarOptions: {
            placement: 'stacked',
            tintColor:
              colorScheme === 'dark' ? Colors.primary400 : Colors.primary700,
            textColor: Colors.primary700,
            hintTextColor: Colors.primary500,
            placeholder: i18n.t('records.searchBarPlaceholder'),
            barTintColor:
              colorScheme === 'dark' ? Colors.primary300 : Colors.primary200,
            onChangeText: (event) => {
              const text = event.nativeEvent.text
              setSearchBarQuery(text)
              // console.log(text)
            },
            onCancelButtonPress: () => {
              setSearchBarQuery('')
            },
          },
          headerLeft: () => (
            <Pressable
              style={styles.headerLeftBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                router.navigate('/formPage')
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

      {persons === undefined || persons.length === 0 ? (
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
            {i18n.t('records.emptyRecordsText')}
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
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={{ paddingBottom: 80 }}
            data={flatMapped}
            renderItem={renderItem}
            stickyHeaderIndices={stickyHeaderIndices}
            getItemType={getItemType}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListHeaderComponent={
              tags?.length === 0 ? (
                <View>
                  <View
                    style={{
                      backgroundColor:
                        diffInDays > 60 ? Colors.rose700 : Colors.primary600,
                      paddingHorizontal: 5,
                      paddingVertical: 3,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'IBM-Regular',
                        fontSize: 12,
                        color: Colors.white,
                      }}
                    >
                      {backupMsg}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: Colors.primary600,
                      fontFamily: 'IBM-Regular',
                      fontSize: 12,
                      padding: 5,
                    }}
                  >
                    {i18n.t('records.emptyTagsText')}
                  </Text>
                </View>
              ) : (
                <View>
                  <View
                    style={{
                      backgroundColor:
                        diffInDays > 60 ? Colors.rose700 : Colors.primary600,
                      paddingHorizontal: 5,
                      paddingVertical: 3,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'IBM-Regular',
                        fontSize: 12,
                        color: Colors.white,
                      }}
                    >
                      {backupMsg}
                    </Text>
                  </View>
                  <ScrollView
                    style={{
                      paddingVertical: 6,
                      backgroundColor: Colors.primary50,
                    }}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 4 }}
                  >
                    {tags?.map((item) => (
                      <Pressable
                        key={item.id}
                        style={[
                          styles.tag,
                          selectedTags.includes(item.id) && {
                            backgroundColor: Colors.emerald900,
                            borderColor: Colors.emerald900,
                          },
                        ]}
                        onPress={() => {
                          setSelectedTags((prev) => {
                            if (prev.includes(item.id)) {
                              return prev.filter((id) => id !== item.id)
                            } else {
                              return [...prev, item.id]
                            }
                          })
                        }}
                      >
                        <Text
                          style={[
                            styles.tagText,
                            selectedTags.includes(item.id) && {
                              color: Colors.white,
                            },
                          ]}
                        >
                          {item.tagName}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )
            }
          />
        </View>
      )}
      <DetailsModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
      <Pressable
        style={{
          position: 'absolute',
          bottom: Platform.OS === 'android' ? 75 : bottom + 75,
          backgroundColor: Colors.emerald900,
          borderRadius: 100,
          borderWidth: 2,
          borderColor: Colors.primary300,
          opacity: 0.85,
          width: 58,
          height: 58,
          alignSelf: 'flex-end',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 10,
        }}
        onPress={() => {
          router.push('/remindersPage')
        }}
      >
        <FontAwesome6
          name="pen-to-square"
          size={24}
          color={Colors.emerald400}
        />
      </Pressable>
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
  header: {
    fontFamily: 'IBM-SemiBoldItalic',
    fontSize: 20,
    backgroundColor: Colors.primary300,
    color: Colors.emerald800,
    padding: 3,
    paddingLeft: 12,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary50,
    position: 'relative',
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
    // marginLeft: 10,
    // padding: 5,
  },
  headerRightBtn: {
    // marginRight: 15,
    // padding: 5,
  },
  tag: {
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 3,
    minWidth: 80,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.primary400,
  },
  tagText: {
    fontFamily: 'IBM-Regular',
    fontSize: 13,
    color: Colors.primary900,
  },
})
