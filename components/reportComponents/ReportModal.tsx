import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
} from 'react-native'
import { Colors } from '@/constants/Colors'

import { format, isToday, Locale } from 'date-fns'
import { useForm, Controller } from 'react-hook-form'
import * as Haptics from 'expo-haptics'
import DateTimePicker from '@react-native-community/datetimepicker'
import { db } from '@/drizzle/db'
import { Report, TReport } from '@/drizzle/schema'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner-native'
import EvilIcons from '@expo/vector-icons/EvilIcons'
import AntDesign from '@expo/vector-icons/AntDesign'
import { useTranslations } from '@/app/_layout'
import { enUS, es, ja, zhCN } from 'date-fns/locale'
import useMyStore from '@/store/store'

type TFormData = Omit<TReport, 'id' | 'created_at' | 'date'>

type ModalProps = {
  modalVisible: boolean
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>
  svcYrs: { currentYr: number; previousYr: number }
}

const localeMap: Record<string, Locale> = {
  en: enUS,
  es: es,
  ja: ja,
  zh: zhCN,
}

const ModalForm = ({ modalVisible, setModalVisible, svcYrs }: ModalProps) => {
  const queryClient = useQueryClient()
  const today = new Date()
  const [datePick, setDatePick] = useState(today)
  const [openPicker, setOpenPicker] = useState(false)

  const i18n = useTranslations()
  const lang = useMyStore((state) => state.language)

  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      date: '',
      hrs: 0,
      bs: 0,
    },
  })

  function convertFloatToTime(floatTime: number): string {
    const hours = Math.floor(floatTime)
    const minutes = Math.round((floatTime - hours) * 60)
    return `${hours}hr ${minutes}mins`
  }

  const watched = watch('hrs')
  const watchedOutput = convertFloatToTime(watched)

  const submitPressed = async (data: TFormData) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    await db.insert(Report).values({
      date: datePick,
      hrs: data.hrs,
      bs: data.bs,
      created_at: datePick,
    })
    reset()
    setModalVisible((prev) => !prev)
    await queryClient.invalidateQueries({ queryKey: ['reports'] })
    toast.custom(
      <View
        style={{
          alignSelf: 'center',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
          backgroundColor: Colors.black,
          width: 240,
          paddingHorizontal: 8,
          paddingVertical: 10,
          borderRadius: 8,
        }}
      >
        <AntDesign name="checkcircle" size={17} color={Colors.emerald300} />
        <Text
          style={{
            fontFamily: 'IBM-Regular',
            fontSize: 15,
            color: Colors.white,
          }}
        >
          {lang === 'en'
            ? `Record for ${format(datePick, 'dd MMM')} created`
            : `${i18n.t('reportsModal.toastDelete')}`}
        </Text>
      </View>,
      {
        duration: 3000,
      }
    )
  }

  console.log('*********modal render*********')

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      {/* Dismiss keyboard when tapping outside */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setOpenPicker(false)
            setModalVisible((prev) => !prev)
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <Pressable
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.dateContainer}>
                <Text style={styles.dateTxt}>
                  {isToday(datePick)
                    ? i18n.t('reportsModal.today')
                    : format(datePick, 'dd MMM yyyy', {
                        locale: localeMap[lang] || enUS,
                      })}
                </Text>
                {Platform.OS === 'android' && (
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
                      setOpenPicker(true)
                    }}
                    style={styles.dateChangeBtn}
                  >
                    <Text>{i18n.t('reportsModal.openCalendarTxt')}</Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={() => {
                    setOpenPicker(false)
                    setModalVisible((prev) => !prev)
                  }}
                  style={{ marginLeft: 'auto' }}
                >
                  <EvilIcons name="close" size={30} color="black" />
                </Pressable>
              </View>

              {Platform.OS === 'ios' && (
                <DateTimePicker
                  value={datePick}
                  locale={lang || 'en'}
                  mode="date"
                  display="inline"
                  accentColor={Colors.emerald600}
                  themeVariant="light"
                  minimumDate={new Date(svcYrs.previousYr, 8, 1)}
                  maximumDate={today}
                  onChange={(event, date) => {
                    setDatePick(date || new Date())
                  }}
                  style={{
                    transform: [{ scale: 0.88 }],
                    padding: 0,
                    margin: -20,
                    marginTop: -27,
                  }}
                />
              )}
              {Platform.OS === 'android' && openPicker && (
                <DateTimePicker
                  value={datePick}
                  mode="date"
                  display="inline"
                  themeVariant="light"
                  // minimumDate={startOfMonth(today)}
                  maximumDate={today}
                  onChange={(event, date) => {
                    setOpenPicker(false)
                    setDatePick(date || new Date())
                  }}
                />
              )}

              <View style={styles.rowContainer}>
                <View style={styles.inputContainers}>
                  <Text style={styles.label}>
                    {i18n.t('reportsModal.hoursLabel')}
                  </Text>
                  <View style={styles.inputBox}>
                    <Controller
                      control={control}
                      name="hrs"
                      render={({ field: { value, onChange, onBlur } }) => (
                        <TextInput
                          value={value === 0 ? '' : value.toString()}
                          onChangeText={(text) => {
                            const numValue = parseFloat(text)
                            if (text.includes(',')) {
                              return
                            }
                            if (numValue >= 24) {
                              onChange(String(24))
                            } else {
                              onChange(text)
                            }
                          }}
                          onBlur={onBlur}
                          selectionColor={Colors.primary700}
                          placeholder=""
                          placeholderTextColor={Colors.primary300}
                          autoFocus
                          style={styles.hrsInput}
                          keyboardType="numeric"
                          maxLength={5}
                        />
                      )}
                    />
                  </View>
                </View>
                <View style={[styles.inputContainers]}>
                  <Text style={styles.label}>
                    {i18n.t('reportsModal.bsLabel')}
                  </Text>
                  <View style={styles.inputBox}>
                    <Controller
                      control={control}
                      name="bs"
                      render={({ field: { value, onChange, onBlur } }) => (
                        <TextInput
                          value={value === 0 ? '' : value.toString()}
                          onChangeText={(text) => {
                            // Only allow integer values
                            const numValue = parseInt(text)
                            if (!isNaN(numValue)) {
                              onChange(String(numValue))
                            } else if (text === '') {
                              onChange('')
                            }
                          }}
                          onBlur={onBlur}
                          selectionColor={Colors.primary700}
                          placeholder=""
                          placeholderTextColor={Colors.primary300}
                          style={styles.hrsInput}
                          keyboardType="numeric"
                          maxLength={2}
                        />
                      )}
                    />
                  </View>
                </View>
                <Pressable
                  style={({ pressed }) => {
                    return [
                      styles.submitBtn,
                      {
                        backgroundColor: pressed
                          ? Colors.primary700
                          : Colors.primary800,
                      },
                    ]
                  }}
                  onPressOut={handleSubmit(submitPressed)}
                >
                  <EvilIcons name="arrow-up" size={22} color="white" />
                  <Text style={styles.submitBtnTxt}>
                    {i18n.t('reportsModal.submitBtn')}
                  </Text>
                </Pressable>
              </View>
              <Text style={styles.watchedTxt}>{watchedOutput}</Text>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(100, 100, 100, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    marginBottom: 15,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 18,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 5,
  },
  dateTxt: {
    fontFamily: 'IBM-Bold',
    fontSize: 26,
    color: Colors.emerald600,
    paddingLeft: 2,
  },
  dateChangeBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.emerald400,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  inputContainers: {
    flexDirection: 'column',
  },
  label: {
    fontFamily: 'IBM-Regular',
    color: Colors.primary900,
    paddingLeft: 1,
    fontSize: 14,
    marginBottom: 3,
  },
  inputBox: {
    paddingVertical: 5,
    paddingHorizontal: 13,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.primary400,
    borderRadius: 5,
    width: 90,
    backgroundColor: Colors.primary50,
  },
  hrsInput: {
    fontFamily: 'IBM-SemiBoldItalic',
    fontSize: 20,
  },

  watchedTxt: {
    fontFamily: 'IBM-Medium',
    fontSize: 16,
    color: Colors.emerald500,
    letterSpacing: 0.8,
  },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    padding: 10,
    borderRadius: 5,
  },
  submitBtnTxt: {
    color: Colors.white,
  },
})

export default ModalForm
