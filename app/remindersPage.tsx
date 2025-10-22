import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native'

import { useState, useEffect, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/constants/Colors'
import { Controller, useForm } from 'react-hook-form'
import { db } from '@/drizzle/db'
import { reminders } from '@/drizzle/schema'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import AntDesign from '@expo/vector-icons/AntDesign'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { format } from 'date-fns'
import { Tabs, useRouter } from 'expo-router'
import { I18n } from 'i18n-js'
import { en, es, ja, zh, ptBR, fr, ko } from '../constants/localizations'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { eq } from 'drizzle-orm'
import { toast } from 'sonner-native'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'

const i18n = new I18n({
  en: en,
  es: es,
  ja: ja,
  zh: zh,
  ptBR: ptBR,
  fr: fr,
  ko: ko,
})

const remindersPage = () => {
  const router = useRouter()
  const [showAddModal, setShowAddModal] = useState(false)
  const queryClient = useQueryClient()
  const inputRef = useRef<TextInput>(null)

  const { data: remindersData } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => db.select().from(reminders),
  })

  console.log('from remindersPage', remindersData)

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      reminder: '',
    },
  })

  // Animation values
  const height = useSharedValue(0)
  const opacity = useSharedValue(0)

  useEffect(() => {
    if (showAddModal) {
      height.value = withTiming(150, { duration: 300 })
      opacity.value = withTiming(1, { duration: 300 })
      // Focus the input after animation starts
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } else {
      height.value = withTiming(0, { duration: 300 })
      opacity.value = withTiming(0, { duration: 300 })
    }
  }, [showAddModal])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: height.value,
      opacity: opacity.value,
      overflow: 'hidden',
      marginTop: 5,
      borderWidth: 1,
      borderColor: Colors.primary400,
      padding: 10,
      borderRadius: 12,
      backgroundColor: Colors.white,
      position: 'relative',
    }
  })

  const onSubmit = async (data: { reminder: string }) => {
    if (!data.reminder) {
      setError('reminder', {
        type: 'required',
        message: 'cannot be blank',
      })
      return
    }
    try {
      await db.insert(reminders).values({
        reminder: data.reminder,
        created_at: new Date(),
      })
      queryClient.invalidateQueries({
        queryKey: ['reminders'],
      })
      reset()
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      setShowAddModal(false)
      Keyboard.dismiss()
    } catch (error) {
      console.error('Failed to insert reminder:', error)
      setError('reminder', {
        type: 'manual',
        message: 'Failed to save reminder',
      })
    }
  }

  const { showActionSheetWithOptions } = useActionSheet()

  const handleActionSheet = (reminderInfo: {
    id: number
    reminder: string
    created_at: Date
  }) => {
    const title = reminderInfo.reminder.slice(0, 22) + '...'
    // const title = format(reminderInfo.created_at, 'dd MMM yyyy')
    const options = ['Delete', 'Cancel']
    const destructiveButtonIndex = 0
    const cancelButtonIndex = 1
    showActionSheetWithOptions(
      {
        title,
        options,
        destructiveButtonIndex,
        cancelButtonIndex,
      },
      (selectedIndex: number | undefined) => {
        switch (selectedIndex) {
          case destructiveButtonIndex:
            handleDeleteSingleReminder(reminderInfo.id)
            break
          case cancelButtonIndex:
            console.log('canceled')
        }
      }
    )
  }

  const handleDeleteSingleReminder = async (reminderId: number) => {
    await db.delete(reminders).where(eq(reminders.id, reminderId))
    queryClient.invalidateQueries({ queryKey: ['reminders'] })
    toast.custom(
      <View
        style={{
          alignSelf: 'center',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          backgroundColor: Colors.black,
          width: 240,
          paddingHorizontal: 8,
          paddingVertical: 10,
          borderRadius: 8,
        }}
      >
        <MaterialCommunityIcons
          name="delete"
          size={23}
          color={Colors.rose500}
        />
        <Text
          style={{
            fontFamily: 'IBM-Regular',
            fontSize: 15,
            color: Colors.white,
          }}
        >
          Reminder deleted
        </Text>
      </View>,
      {
        duration: 3000,
      }
    )
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.primary100,
        padding: 10,
      }}
    >
      <Tabs.Screen
        options={{
          headerLeft: () => (
            <Pressable
              onPress={() => {
                setShowAddModal((prev) => !prev)
                Keyboard.isVisible() ? Keyboard.dismiss() : null
              }}
              style={styles.addBtn}
            >
              <Text
                style={{
                  color: Colors.emerald800,
                  fontFamily: 'IBM-Medium',
                  fontSize: 18,
                }}
              >
                {showAddModal ? 'Cancel' : 'Add'}
              </Text>
              {!showAddModal && (
                <AntDesign name="plus" size={15} color={Colors.emerald800} />
              )}
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={() => {
                router.dismiss()
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontFamily: 'IBM-Regular' }}>
                {i18n.t('options.closeBtn')}
              </Text>
            </Pressable>
          ),
        }}
      />
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss()
          setShowAddModal(false)
        }}
      >
        <View style={{ flex: 1 }}>
          <Animated.View style={animatedStyle}>
            {errors['reminder'] && (
              <Text style={styles.errorText}>
                {errors['reminder']?.message?.toString()}
              </Text>
            )}
            <Controller
              control={control}
              name="reminder"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  ref={inputRef}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="notes or reminders"
                  placeholderTextColor={Colors.primary200}
                  autoComplete="off"
                  autoCorrect={true}
                  autoCapitalize="sentences"
                  selectionColor={Colors.primary950}
                  style={styles.input}
                  multiline
                  numberOfLines={4}
                />
              )}
            />
            <Pressable
              onPress={handleSubmit(onSubmit)}
              style={styles.submitBtn}
            >
              <Text
                style={{
                  color: Colors.white,
                  fontFamily: 'IBM-Regular',
                  fontSize: 14,
                }}
              >
                Submit
              </Text>
            </Pressable>
          </Animated.View>
          {remindersData && remindersData.length > 0 ? (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 15, marginTop: 5 }}
            >
              {remindersData?.map((reminder) => (
                <Pressable
                  key={reminder.id}
                  style={styles.reminderItem}
                  onLongPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid)
                    handleActionSheet(reminder)
                  }}
                >
                  <Text style={styles.reminderItemDate}>
                    {format(new Date(reminder.created_at), 'dd MMM yyyy')}
                  </Text>
                  <Text style={styles.reminderItemTxt}>
                    {reminder.reminder}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <Text
              style={{
                fontFamily: 'IBM-Regular',
                fontSize: 18,
                textAlign: 'center',
              }}
            >
              No reminders found. Add one now!
            </Text>
          )}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  )
}

export default remindersPage
const styles = StyleSheet.create({
  addBtn: {
    padding: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    backgroundColor: Colors.white,
    // borderWidth: 1,
    // borderColor: Colors.primary900,
  },
  input: {
    fontFamily: 'IBM-Regular',
    fontSize: 18,
    color: Colors.primary950,
    backgroundColor: Colors.white,
    height: 100,
  },
  submitBtn: {
    marginTop: 3,
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    backgroundColor: Colors.primary950,
    width: '20%',
    alignSelf: 'flex-end',
  },
  errorText: {
    fontFamily: 'IBM-Bold',
    fontSize: 11,
    color: Colors.rose400,
    position: 'absolute',
    top: 1,
    left: 10,
    zIndex: 1,
  },
  reminderItem: {
    padding: 15,
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: Colors.primary950,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 5,
  },
  reminderItemDate: {
    fontFamily: 'IBM-Medium',
    fontSize: 13,
    color: Colors.primary300,
    alignSelf: 'flex-end',
    marginBottom: 1,
  },
  reminderItemTxt: {
    fontFamily: 'IBM-Regular',
    fontSize: 16,
    color: Colors.emerald800,
  },
})
