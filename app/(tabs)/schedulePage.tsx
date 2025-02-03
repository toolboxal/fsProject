import {
  StyleSheet,
  View,
  Text,
  Button,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Platform,
} from 'react-native'
import { Tabs, useRouter } from 'expo-router'
import * as Calendar from 'expo-calendar'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { storage } from '@/store/storage'
import { Colors } from '@/constants/Colors'
import { FontAwesome6 } from '@expo/vector-icons'

const fetchCalendarEvents = async () => {
  const { status } = await Calendar.requestCalendarPermissionsAsync()
  if (status !== 'granted') {
    throw new Error('Calendar permission not granted')
  }

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT)
  const defaultCalendar = calendars[0]
  //   console.log(calendars)
  storage.set('calendar.id', defaultCalendar.id)

  // Get events for the next 30 days
  const startDate = new Date()
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 30)

  const calendarEvents = await Calendar.getEventsAsync(
    [defaultCalendar.id],
    startDate,
    endDate
  )
  return calendarEvents
}

async function createCalendar() {
  const id = storage.getString('calendar.id') || ''
  const event = await Calendar.createEventInCalendarAsync()
  console.log('storage id -------> ', id)
}

const schedulePage = () => {
  const router = useRouter()
  const { bottom, top } = useSafeAreaInsets()
  const queryClient = useQueryClient()

  const {
    data: events = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['calendarEvents'],
    queryFn: fetchCalendarEvents,
    // Refresh every minute
    refetchInterval: 60000,
  })

  const handleCreateCalendar = async () => {
    await createCalendar()
    // Invalidate and refetch calendar events after creating a new event
    queryClient.invalidateQueries({ queryKey: ['calendarEvents'] })
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading events...</Text>
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
              <Text style={styles.btnTextLeft}>New Schedule</Text>
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
              <Text style={styles.btnTextRight}>Options</Text>
            </Pressable>
          ),
        }}
      />
      <Text style={styles.title}>Calendar Events</Text>
      <View style={styles.buttonContainer}>
        <Button title="Create Event" onPress={handleCreateCalendar} />
        <Button title="Refresh" onPress={() => refetch()} />
      </View>
      <ScrollView
        style={styles.eventList}
        contentContainerStyle={{
          paddingBottom: Platform.OS === 'android' ? bottom + 100 : bottom + 75,
          paddingTop: 10,
          backgroundColor: Colors.primary50,
        }}
        showsVerticalScrollIndicator={false}
      >
        {events.length === 0 ? (
          <Text style={styles.noEvents}>No events found</Text>
        ) : (
          events.map((event: any) => (
            <Pressable
              key={event.id}
              style={styles.eventItem}
              onPress={async () => {
                await Calendar.editEventInCalendarAsync({ id: event.id })
                refetch()
              }}
            >
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventTime}>
                {new Date(event.startDate).toLocaleString()}
              </Text>
            </Pressable>
          ))
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  eventList: {
    flex: 1,
    marginBottom: 16,
  },
  eventItem: {
    backgroundColor: Colors.primary200,
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.emerald400,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventTime: {
    color: '#666',
  },
  noEvents: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
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
})
