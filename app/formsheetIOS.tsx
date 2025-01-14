import { Colors } from '@/constants/Colors'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { format } from 'date-fns'
import { useForm, Controller } from 'react-hook-form'
import * as Haptics from 'expo-haptics'
import EvilIcons from '@expo/vector-icons/EvilIcons'
import { TReport } from '@/drizzle/schema'
import { db } from '@/drizzle/db'

type TFormData = Omit<TReport, 'id' | 'created_at'>

const reportFormSheet = () => {
  const bottom = useSafeAreaInsets().bottom
  const today = format(new Date(), 'dd MMM yyyy')

  const { control, handleSubmit, reset, setValue, getValues } = useForm({
    defaultValues: {
      date: '',
      hrs: 0,
      bs: 0,
    },
  })

  const SubmitPressed = (data: TFormData) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    console.log(data)
  }

  return (
    <View style={[styles.mainContainer, { marginBottom: -bottom }]}>
      <View style={styles.dateContainer}>
        <Text style={styles.dateTxt}>{today}</Text>
        <Pressable
          style={({ pressed }) => {
            return [
              styles.dateChangeBtn,
              {
                backgroundColor: pressed
                  ? Colors.emerald300
                  : Colors.emerald200,
              },
            ]
          }}
          onPressOut={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
          }}
        >
          <Text style={styles.dateChangeTxt}>Change Date</Text>
        </Pressable>
      </View>
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
        <View style={[styles.inputContainers, { marginLeft: 45 }]}>
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
          onPressOut={handleSubmit(SubmitPressed)}
        >
          <EvilIcons name="arrow-up" size={24} color="white" />
          <Text style={styles.submitBtnTxt}>Submit</Text>
        </Pressable>
      </View>
      <Text style={styles.sampleTxt}>eg. 1.75 = 1h45mins</Text>
    </View>
  )
}
export default reportFormSheet
const styles = StyleSheet.create({
  mainContainer: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: Colors.primary50,
    flex: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
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
  dateChangeTxt: {
    color: Colors.primary700,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    width: 100,
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
    marginLeft: 'auto',
    alignSelf: 'flex-end',
    padding: 10,
    borderRadius: 5,
  },
  submitBtnTxt: {
    color: Colors.white,
  },
})
