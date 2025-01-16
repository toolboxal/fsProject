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

import { format, startOfMonth } from 'date-fns'
import { useForm, Controller } from 'react-hook-form'
import * as Haptics from 'expo-haptics'
import EvilIcons from '@expo/vector-icons/EvilIcons'
import { TReport } from '@/drizzle/schema'
import DateTimePicker from '@react-native-community/datetimepicker'
import { date } from 'drizzle-orm/mysql-core'

type TFormData = Omit<TReport, 'id' | 'created_at'>

type ModalProps = {
  modalVisible: boolean
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const ModalForm = ({ modalVisible, setModalVisible }: ModalProps) => {
  const today = new Date()
  const [datePick, setDatePick] = useState(today)
  const [openPicker, setOpenPicker] = useState(false)

  const { control, handleSubmit, reset, setValue, getValues } = useForm({
    defaultValues: {
      date: '',
      hrs: 0,
      bs: 0,
    },
  })

  const submitPressed = (data: TFormData) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    console.log(data)
  }

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
          onPress={() => setModalVisible((prev) => !prev)}
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
                  {format(datePick, 'dd MMM yyyy')}
                </Text>
                <Pressable
                  style={[
                    styles.dateChangeBtn,
                    {
                      backgroundColor: openPicker
                        ? Colors.primary900
                        : Colors.emerald400,
                    },
                  ]}
                  onPressOut={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
                    setOpenPicker((prev) => !prev)
                  }}
                >
                  {openPicker ? (
                    <View style={{ flexDirection: 'row', gap: 1 }}>
                      <EvilIcons name="close-o" size={20} color="white" />
                      <Text style={{ color: Colors.white }}>Calendar</Text>
                    </View>
                  ) : (
                    <Text style={{ color: Colors.primary700 }}>
                      Change Date
                    </Text>
                  )}
                </Pressable>
                <Pressable
                  onPress={() => setModalVisible((prev) => !prev)}
                  style={{ marginLeft: 'auto' }}
                >
                  <EvilIcons name="close" size={30} color="black" />
                </Pressable>
              </View>
              {openPicker && (
                <DateTimePicker
                  value={datePick}
                  mode="date"
                  display="inline"
                  accentColor={Colors.emerald400}
                  minimumDate={startOfMonth(today)}
                  maximumDate={today}
                  onChange={(event, date) => {
                    setDatePick(date || new Date())
                  }}
                  style={{
                    transform: [{ scale: 0.88 }],
                    //   backgroundColor: 'yellow',
                    padding: 0,
                    margin: -20,
                    marginTop: -27,
                  }}
                />
              )}
              <View style={styles.rowContainer}>
                <View style={styles.inputContainers}>
                  <Text style={styles.label}>hours</Text>
                  <View style={styles.inputBox}>
                    <Controller
                      control={control}
                      name="hrs"
                      render={({ field: { value, onChange, onBlur } }) => (
                        <TextInput
                          value={value.toString()}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          autoComplete="off"
                          autoCorrect={false}
                          autoCapitalize="sentences"
                          selectionColor={Colors.primary700}
                          placeholder="1.75"
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
                  <Text style={styles.label}>no. bible studies</Text>
                  <View style={styles.inputBox}>
                    <Controller
                      control={control}
                      name="bs"
                      render={({ field: { value, onChange, onBlur } }) => (
                        <TextInput
                          value={value.toString()}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          autoComplete="off"
                          autoCorrect={false}
                          autoCapitalize="sentences"
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
                          ? Colors.primary950
                          : Colors.primary800,
                      },
                    ]
                  }}
                  onPressOut={handleSubmit(submitPressed)}
                >
                  <EvilIcons name="arrow-up" size={24} color="white" />
                  <Text style={styles.submitBtnTxt}>Submit</Text>
                </Pressable>
              </View>
              <Text style={styles.sampleTxt}>eg. 1.75 = 1h45mins</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    padding: 20,
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
    color: Colors.primary700,
  },
  dateChangeBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
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
  sampleTxt: {
    fontFamily: 'IBM-Regular',
    fontSize: 14,
    color: Colors.primary500,
  },
  submitBtn: {
    flexDirection: 'row',
    // marginLeft: 'auto',
    alignSelf: 'flex-end',
    padding: 10,
    borderRadius: 5,
  },
  submitBtnTxt: {
    color: Colors.white,
  },
})

export default ModalForm
