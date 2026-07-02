import React, { useState, useEffect } from 'react'
import {
  Modal,
  View,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
} from 'react-native'
import Text from '@/components/Text'
import TextInput from '@/components/TextInput'
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
import { enUS, es, ja, zhCN, ptBR, fr, ko } from 'date-fns/locale'
import useMyStore from '@/store/store'
import { ArrowRight } from 'lucide-react-native'
import * as DropdownMenu from 'zeego/dropdown-menu'
import DurationPicker from './DurationPicker'
import CountPicker from './CountPicker'
import convertFloatToTime from '@/utils/convertFloatToTime'

const DEFAULT_HOURS = 1
const DEFAULT_MINUTES = 0
const DEFAULT_BS = 0

const decimalFromDuration = (hours: number, minutes: number) =>
  hours + minutes / 60

type TFormData = Pick<TReport, 'comment' | 'type'>

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
  ptBR: ptBR,
  fr: fr,
  ko: ko,
}

const fsTypeList = [
  { type: 'hh', label: 'house to house', color: Colors.emerald300 },
  { type: 'cart', label: 'cart', color: Colors.rose400 },
  { type: 'publ', label: 'public', color: Colors.sky500 },
  { type: 'inf', label: 'informal', color: Colors.lemon500 },
]

const ModalForm = ({ modalVisible, setModalVisible, svcYrs }: ModalProps) => {
  const queryClient = useQueryClient()
  const today = new Date()
  const [datePick, setDatePick] = useState(today)
  const [openPicker, setOpenPicker] = useState(false)
  const [toggleCredit, setToggleCredit] = useState(false)
  const [fsType, setFsType] = useState<TFormData['type']>('hh')

  const i18n = useTranslations()
  const [showTypePicker, setShowTypePicker] = useState(false)
  const [fsHours, setFsHours] = useState(DEFAULT_HOURS)
  const [fsMinutes, setFsMinutes] = useState(DEFAULT_MINUTES)
  const [creditHours, setCreditHours] = useState(DEFAULT_HOURS)
  const [creditMinutes, setCreditMinutes] = useState(DEFAULT_MINUTES)
  const [bsCount, setBsCount] = useState(DEFAULT_BS)
  const lang = useMyStore((state) => state.language)

  const resetDurationPickers = () => {
    setFsHours(DEFAULT_HOURS)
    setFsMinutes(DEFAULT_MINUTES)
    setCreditHours(DEFAULT_HOURS)
    setCreditMinutes(DEFAULT_MINUTES)
    setBsCount(DEFAULT_BS)
  }

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      date: '',
      comment: '',
      type: 'hh' as 'hh' | 'publ' | 'inf' | 'cart',
    },
  })

  useEffect(() => {
    if (modalVisible) {
      reset()
      resetDurationPickers()
      setDatePick(today)
      setFsType('hh')
    }
  }, [modalVisible])

  useEffect(() => {
    reset()
    resetDurationPickers()
  }, [toggleCredit])

  const submitPressed = async (data: TFormData) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    const decimalHrs = decimalFromDuration(fsHours, fsMinutes)
    const decimalCredit = decimalFromDuration(creditHours, creditMinutes)

    await db.insert(Report).values({
      date: datePick,
      hrs: toggleCredit ? 0 : decimalHrs,
      bs: bsCount,
      credit: toggleCredit ? decimalCredit : 0,
      comment: data.comment,
      type: !toggleCredit && decimalHrs > 0 ? fsType : null,
      created_at: datePick,
    })
    reset()
    resetDurationPickers()
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
        <AntDesign name="check-circle" size={17} color={Colors.emerald300} />
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
      },
    )
  }

  console.log('*********modal render*********')

  return (
    <Modal
      animationType="fade"
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
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
            style={styles.keyboardView}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 20}
          >
            <Pressable
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.dateContainer}>
                <Text style={styles.dateTxt}>
                  {isToday(datePick)
                    ? `${i18n.t('reportsModal.today')} - ${format(
                        datePick,
                        'EEE',
                        {
                          locale: localeMap[lang] || enUS,
                        },
                      )}`
                    : format(datePick, 'd MMM yyyy EEE', {
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
                  display="spinner"
                  accentColor={Colors.emerald600}
                  themeVariant="light"
                  minimumDate={new Date(svcYrs.previousYr, 8, 1)}
                  maximumDate={today}
                  onChange={(event, date) => {
                    setDatePick(date || new Date())
                  }}
                  style={{
                    marginVertical: -30,
                    transform: [{ scale: 0.8 }],
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
              <View
                style={{
                  flexDirection: 'row',
                  marginVertical: 5,
                }}
              >
                <Pressable
                  style={[
                    styles.toggleBtn,
                    {
                      backgroundColor: toggleCredit
                        ? Colors.primary200
                        : Colors.emerald800,
                    },
                  ]}
                  onPress={() => {
                    setToggleCredit((prev) => !prev)
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  }}
                >
                  <Text
                    style={[
                      styles.toggleBtnTxt,
                      {
                        color: toggleCredit ? 'black' : 'white',
                      },
                    ]}
                  >
                    {i18n.t('reportsModal.modalToggleBtnFSHours')}
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.toggleBtn,
                    {
                      backgroundColor: toggleCredit
                        ? Colors.emerald800
                        : Colors.primary200,
                    },
                  ]}
                  onPress={() => {
                    setToggleCredit((prev) => !prev)
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  }}
                >
                  <Text
                    style={[
                      styles.toggleBtnTxt,
                      {
                        color: toggleCredit ? 'white' : 'black',
                      },
                    ]}
                  >
                    {i18n.t('reportsModal.modalToggleBtnCredits')}
                  </Text>
                </Pressable>
              </View>
              <View style={styles.rowContainer}>
                {toggleCredit ? (
                  <View style={{ flex: 1, gap: 10 }}>
                    <View style={styles.inputContainers}>
                      <Text style={styles.label}>
                        {i18n.t('reportsModal.inputLabelCredit')}
                      </Text>
                      <DurationPicker
                        hours={creditHours}
                        minutes={creditMinutes}
                        onHoursChange={setCreditHours}
                        onMinutesChange={setCreditMinutes}
                      />
                    </View>

                    <View
                      style={{ flexDirection: 'row', gap: 10, marginTop: -10 }}
                    >
                      <View style={[styles.inputContainers, { flex: 1 }]}>
                        <Text style={styles.label}>
                          {i18n.t('reportsModal.inputLabelComment')}
                        </Text>
                        <View style={[styles.inputBox, { width: '100%' }]}>
                          <Controller
                            control={control}
                            name="comment"
                            render={({
                              field: { value, onChange, onBlur },
                            }) => (
                              <TextInput
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                selectionColor={Colors.primary700}
                                placeholder=""
                                placeholderTextColor={Colors.primary300}
                                style={{
                                  fontFamily: 'IBM-Medium',
                                  fontSize: 20,
                                }}
                                keyboardType="default"
                                maxLength={20}
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
                        {/* <Text style={styles.submitBtnTxt}>Submit</Text> */}
                        <ArrowRight size={20} color="white" strokeWidth={3} />
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <View style={{ flex: 1, gap: 10 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        // gap: 12,
                        // alignItems: 'flex-end',
                      }}
                    >
                      <View style={[styles.inputContainers, { flex: 1 }]}>
                        <Text style={styles.label}>
                          {i18n.t('reportsModal.hoursLabel')}
                        </Text>
                        <DurationPicker
                          hours={fsHours}
                          minutes={fsMinutes}
                          onHoursChange={setFsHours}
                          onMinutesChange={setFsMinutes}
                        />
                      </View>
                      <View style={styles.inputContainers}>
                        <Text style={styles.label}>
                          {i18n.t('reportsModal.bsLabel')}
                        </Text>
                        <CountPicker value={bsCount} onChange={setBsCount} />
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <View
                        style={[
                          styles.inputContainers,
                          { flex: 1, marginTop: -10 },
                        ]}
                      >
                        <Text style={styles.label}>type</Text>
                        <View
                          style={[
                            styles.trigger,
                            {
                              backgroundColor: fsTypeList.find(
                                (t) => t.type === fsType,
                              )?.color,
                            },
                          ]}
                        >
                          {Platform.OS === 'android' ? (
                            <Pressable
                              onPress={() => {
                                Keyboard.dismiss()
                                setShowTypePicker(true)
                              }}
                            >
                              <View style={styles.triggerContainer}>
                                <Text style={styles.triggerTxt}>{fsType}</Text>
                              </View>
                            </Pressable>
                          ) : (
                            <DropdownMenu.Root>
                              <DropdownMenu.Trigger>
                                <View style={styles.triggerContainer}>
                                  <Text style={styles.triggerTxt}>
                                    {fsType}
                                  </Text>
                                </View>
                              </DropdownMenu.Trigger>
                              <DropdownMenu.Content>
                                {fsTypeList.map((type) => (
                                  <DropdownMenu.Item
                                    key={type.type}
                                    onSelect={() =>
                                      setFsType(type.type as TFormData['type'])
                                    }
                                  >
                                    <DropdownMenu.ItemTitle>
                                      {type.label}
                                    </DropdownMenu.ItemTitle>
                                  </DropdownMenu.Item>
                                ))}
                              </DropdownMenu.Content>
                            </DropdownMenu.Root>
                          )}
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
                        {/* <Text style={styles.submitBtnTxt}>Submit</Text> */}
                        <ArrowRight size={20} color="white" strokeWidth={3} />
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
              {/* {toggleCredit ? (
                <Text style={styles.watchedTxt}>
                  {convertFloatToTime(
                    decimalFromDuration(creditHours, creditMinutes),
                  )}
                </Text>
              ) : (
                <Text style={styles.watchedTxt}>
                  {convertFloatToTime(decimalFromDuration(fsHours, fsMinutes))}
                </Text>
              )} */}
            </Pressable>
          </KeyboardAvoidingView>
          {/* Custom Picker Overlay for Android */}
          {Platform.OS === 'android' && showTypePicker && (
            <View style={styles.customPickerOverlay}>
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={() => setShowTypePicker(false)}
              />
              <View style={styles.customPickerContainer}>
                <Text style={styles.customPickerTitle}>Select Type</Text>
                {fsTypeList.map((item) => (
                  <Pressable
                    key={item.type}
                    style={[
                      styles.customPickerItem,
                      { backgroundColor: item.color + '20' },
                    ]}
                    onPress={() => {
                      setFsType(item.type as TFormData['type'])
                      setShowTypePicker(false)
                    }}
                  >
                    <View
                      style={[
                        styles.colorIndicator,
                        { backgroundColor: item.color },
                      ]}
                    />
                    <Text style={styles.customPickerItemText}>
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
                <Pressable
                  style={styles.customPickerCloseBtn}
                  onPress={() => setShowTypePicker(false)}
                >
                  <Text style={styles.customPickerCloseBtnText}>
                    {i18n.t('detailsModal.cancel')}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
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
    paddingVertical: 10,
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
    fontSize: 22,
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
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 5,
    gap: 8,
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
    color: Colors.emerald600,
    letterSpacing: 0.8,
  },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    padding: 10,
    borderRadius: 30,
  },
  submitBtnTxt: {
    color: Colors.white,
  },
  toggleBtn: {
    padding: 5,
    paddingHorizontal: 10,
    // borderRadius: 5,
    // borderWidth: 1,
    borderColor: Colors.primary400,
  },
  toggleBtnTxt: {
    fontFamily: 'IBM-Medium',
    fontSize: 16,
  },
  trigger: {
    // backgroundColor: Colors.primary950,
    // alignSelf: 'flex-start',
    borderRadius: 10,
    // shadowColor: Colors.primary500,
    // shadowOffset: { width: -1, height: 1 },
    // shadowOpacity: 1,
    // shadowRadius: 1,
    // elevation: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.primary300,
    minWidth: 50,
  },
  triggerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  triggerTxt: {
    fontFamily: 'IBM-Medium',
    fontSize: 16,
    color: Colors.black,
  },
  customPickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  customPickerContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 10,
  },
  customPickerTitle: {
    fontFamily: 'IBM-Bold',
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
    color: Colors.primary900,
  },
  customPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  customPickerItemText: {
    fontFamily: 'IBM-Medium',
    fontSize: 16,
    color: Colors.primary950,
  },
  customPickerCloseBtn: {
    marginTop: 10,
    padding: 12,
    alignItems: 'center',
  },
  customPickerCloseBtnText: {
    fontFamily: 'IBM-Bold',
    fontSize: 16,
    color: Colors.rose600,
  },
})

export default ModalForm
