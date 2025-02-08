import { useCallback, useState } from 'react'
import {
  StyleSheet,
  View,
  Text,
  Button,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Platform,
  RefreshControl,
} from 'react-native'
import { Tabs, useRouter } from 'expo-router'
import * as Calendar from 'expo-calendar'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { storage } from '@/store/storage'
import { Colors } from '@/constants/Colors'
import { FontAwesome6 } from '@expo/vector-icons'
import { format, Locale } from 'date-fns'
import { useTranslations } from '@/app/_layout'
import { enUS, es, ja, zhCN, ptBR } from 'date-fns/locale'
import useMyStore from '@/store/store'

const localeMap: Record<string, Locale> = {
  en: enUS,
  es: es,
  ja: ja,
  zh: zhCN,
  ptBR: ptBR,
}

const createCalendar = async () => {
  const newCalendarID = await Calendar.createCalendarAsync({
    title: 'FsPalCalendar',
    color: Colors.emerald500,
    entityType: Calendar.EntityTypes.EVENT,
    name: 'FsPalCalendar',
    ownerAccount: 'personal',
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  })
  return newCalendarID
}

const fetchCalendarEvents = async () => {
  const { status } = await Calendar.requestCalendarPermissionsAsync()
  if (status !== 'granted') {
    throw new Error('Calendar permission not granted')
  }

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT)
  const fsPalCalendar = calendars.find(
    (calendar) => calendar.title === 'FsPalCalendar'
  )
  if (!fsPalCalendar) {
    const newCalendarID = await createCalendar()
    storage.set('calendar.id', newCalendarID)
  } else {
    storage.set('calendar.id', fsPalCalendar.id)
  }
  console.log(calendars)

  // Get events for the next 365 days
  const startDate = new Date()
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 365)

  const calendarEvents = await Calendar.getEventsAsync(
    [storage.getString('calendar.id')!],
    startDate,
    endDate
  )
  return calendarEvents
}

async function createCalendarEvent() {
  const id = storage.getString('calendar.id') || ''
  const event = await Calendar.createEventInCalendarAsync({ calendarId: id })
  // console.log('storage id -------> ', id)
}

const schedulePage = () => {
  const router = useRouter()
  const { bottom, top } = useSafeAreaInsets()
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)
  const i18n = useTranslations()
  const lang = useMyStore((state) => state.language)

  const {
    data: events = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: fetchCalendarEvents,
    refetchInterval: 600000,
  })

  const handleCreateCalendar = async () => {
    await createCalendarEvent()
    refetch()
  }

  console.log(events)

  const onRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  // Format events into sections
  const formatEvents = () => {
    if (events.length === 0) return { upcoming: [], later: [] }

    return {
      upcoming: events.slice(0, 1),
      later: events.slice(1),
    }
  }

  const { upcoming, later } = formatEvents()

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.emerald600} />
        <Text style={styles.noEvents}>Loading events...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Error:{' '}
          {error instanceof Error ? error.message : 'Failed to load events'}
        </Text>
        <Button title="Try Again" onPress={() => refetch()} />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Tabs.Screen
        options={{
          headerTitle: '',
          //   headerShadowVisible: false,
          headerStyle: {
            backgroundColor: Colors.primary50,
            height: top + 45,
          },
          headerLeft: () => (
            <Pressable
              style={styles.headerLeftBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                handleCreateCalendar()
              }}
            >
              <FontAwesome6 name="add" size={13} color={Colors.primary900} />
              <Text style={styles.btnTextLeft}>
                {i18n.t('schedule.tabHeaderLeft')}
              </Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              style={styles.headerRightBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                router.navigate('/(options)/optionsPage')
              }}
            >
              <Text style={styles.btnTextRight}>
                {i18n.t('schedule.tabHeaderRight')}
              </Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView
        style={styles.eventList}
        contentContainerStyle={{
          paddingBottom: Platform.OS === 'android' ? bottom + 100 : bottom + 75,
          paddingTop: 10,
          backgroundColor: Colors.primary50,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.emerald400}
            colors={[Colors.emerald400]} // Android
            progressBackgroundColor={Colors.emerald50} // Android
          />
        }
      >
        {events.length === 0 ? (
          <Text style={styles.noEvents}>
            {i18n.t('schedule.backgroundTxt1')}
          </Text>
        ) : (
          <View>
            <Text style={styles.sectionHeader}>
              {i18n.t('schedule.upcomingHeader')}
            </Text>
            {upcoming.map((event, index) => (
              <Pressable
                key={event.id + index}
                style={styles.eventItem}
                onLongPress={async () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  await Calendar.editEventInCalendarAsync({
                    id: event.id,
                    instanceStartDate: event.startDate,
                  })

                  refetch()
                }}
              >
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventTime}>
                  {format(event.startDate, 'EEE, dd MMM yyyy, h:mmb', {
                    locale: localeMap[lang] || enUS,
                  })}
                </Text>
                <Text style={styles.eventNotes}>
                  {event.notes || i18n.t('schedule.noAddNotes')}
                </Text>
              </Pressable>
            ))}

            {later.length > 0 && (
              <View>
                <Text
                  style={[
                    styles.sectionHeader,
                    { fontSize: 18, color: Colors.primary700 },
                  ]}
                >
                  {i18n.t('schedule.subsequentHeader')}
                </Text>
                {later.map((event, index) => (
                  <Pressable
                    key={event.id + index * 99999}
                    style={[styles.eventItem, styles.laterEvent]}
                    onLongPress={async () => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      await Calendar.editEventInCalendarAsync({
                        id: event.id,
                        instanceStartDate: event.startDate,
                      })

                      refetch()
                    }}
                  >
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventTime}>
                      {format(event.startDate, 'EEE, dd MMM yyyy, h:mmb', {
                        locale: localeMap[lang] || enUS,
                      })}
                    </Text>
                    <Text style={styles.eventNotes}>
                      {event.notes || i18n.t('schedule.noAddNotes')}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}
        {events.length !== 0 && (
          <Text style={styles.fyiTxt}>{i18n.t('schedule.fyiTxt')}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default schedulePage

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary50,
    paddingHorizontal: 15,
  },

  eventList: {
    flex: 1,
    marginBottom: 16,
  },
  eventItem: {
    backgroundColor: Colors.emerald100,
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: Colors.emerald300,
    borderBottomWidth: 2,
    borderBottomColor: Colors.emerald300,
  },
  eventTitle: {
    fontFamily: 'IBM-Bold',
    fontSize: 17,
    marginBottom: 4,
  },
  eventTime: {
    fontFamily: 'IBM-Medium',
    color: Colors.primary600,
  },
  eventNotes: {
    fontFamily: 'IBM-Regular',
    color: Colors.primary600,
    fontSize: 14,
  },
  noEvents: {
    fontFamily: 'IBM-SemiBold',
    fontSize: 20,
    textAlign: 'center',
    color: Colors.primary300,
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 24,
    fontFamily: 'IBM-MediumItalic',
    color: Colors.emerald800,
    marginVertical: 10,
    paddingHorizontal: 5,
  },
  laterEvent: {
    backgroundColor: Colors.primary50,
    borderLeftColor: Colors.primary200,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary200, // slightly lighter border for later events
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
  fyiTxt: {
    marginTop: 20,
    paddingHorizontal: 5,
    fontFamily: 'IBM-Italic',
    fontSize: 14,
    color: Colors.primary500,
    textAlign: 'center',
  },
})
