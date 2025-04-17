import { View, Text, StyleSheet, Pressable } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { router, Stack } from 'expo-router'
import { Colors } from '@/constants/Colors'

import { useState, useEffect } from 'react'
import { FlashList } from '@shopify/flash-list'
import SingleRecord from '@/components/SingleRecord'

import * as Haptics from 'expo-haptics'
import useMyStore from '@/store/store'
import { Ionicons } from '@expo/vector-icons'
import { useTranslations } from '../../_layout'

import { db } from '@/drizzle/db'
import { Person, TPerson, TPersonWithTags } from '@/drizzle/schema'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { checkAndRequestReview } from '@/utils/storeReview'
import DetailsModal from '@/components/DetailsModal'
import { FlatList } from 'react-native-gesture-handler'

const filterOptions = [
  { type: 'all', label: 'All' },
  { type: 'irregular', label: 'hard to find' },
  { type: 'frequent', label: 'frequent visits' },
  { type: 'committed', label: 'established' },
]

const RecordsPage = () => {
  const [refreshing, setRefreshing] = useState(false)
  // const selectedPerson = useMyStore((state) => state.selectedPerson)
  const [modalVisible, setModalVisible] = useState(false)
  const [searchBarQuery, setSearchBarQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<number[]>([])

  const queryClient = useQueryClient()
  const i18n = useTranslations()

  const { top } = useSafeAreaInsets()

  useEffect(() => {
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
  console.log(persons)

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
        personTagIds.includes(tagId)
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
      <Stack.Screen
        options={{
          headerTitle: '',
          headerStyle: {
            backgroundColor: Colors.primary50,
            // height: top + 45,
          },
          headerSearchBarOptions: {
            tintColor: Colors.primary700,
            textColor: Colors.primary50,
            hintTextColor: 'white',
            placeholder: 'search by name',
            barTintColor: Colors.primary700,
            onChangeText: (event) => {
              const text = event.nativeEvent.text
              setSearchBarQuery(text)
              console.log(text)
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
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={{ paddingBottom: 120 }}
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
            ListHeaderComponent={
              tags?.length === 0 ? (
                <Text
                  style={{
                    color: Colors.primary600,
                    fontFamily: 'IBM-Regular',
                  }}
                >
                  currently no tags created
                </Text>
              ) : (
                <FlatList
                  style={{
                    paddingVertical: 6,
                    backgroundColor: Colors.primary50,
                  }}
                  horizontal
                  contentInsetAdjustmentBehavior="automatic"
                  showsHorizontalScrollIndicator={false}
                  data={tags}
                  renderItem={({ item }) => (
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
                  )}
                />
              )
            }
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
