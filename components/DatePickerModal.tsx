import { Colors } from '@/constants/Colors'
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker'
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  useColorScheme,
} from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'

type Props = {
  showDatePicker: boolean
  setShowDatePicker: React.Dispatch<React.SetStateAction<boolean>>
  initialVisit: Date
  setInitialVisit: React.Dispatch<React.SetStateAction<Date>>
}

const DatePickerModal = ({
  showDatePicker,
  setShowDatePicker,
  initialVisit,
  setInitialVisit,
}: Props) => {
  const colorScheme = useColorScheme()

  console.log(initialVisit)

  const onDateChange = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined
  ) => {
    if (selectedDate) {
      setInitialVisit(selectedDate)
    }
  }

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={showDatePicker}
      onRequestClose={() => setShowDatePicker(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setShowDatePicker(false)}
      />
      <Animated.View entering={FadeInDown} style={{ flex: 1 }}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.datePickerBox,
            {
              backgroundColor:
                colorScheme === 'dark' ? Colors.primary800 : Colors.emerald100,
            },
          ]}
        >
          <DateTimePicker
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
            value={initialVisit || new Date()}
            onChange={onDateChange}
            accentColor={Colors.emerald500}
            textColor={'black'}
            style={[
              styles.datePicker,
              {
                backgroundColor:
                  colorScheme === 'dark'
                    ? Colors.primary800
                    : Colors.emerald100,
              },
            ]}
            themeVariant={colorScheme || 'light'}
          />
        </Pressable>
      </Animated.View>
    </Modal>
  )
}

export default DatePickerModal

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
  },
  datePickerBox: {
    marginBottom: 40,
    marginTop: 20,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    marginHorizontal: 'auto',
    borderRadius: 30,
    padding: 10,
    paddingTop: 20,
    position: 'relative',
  },
  datePicker: {
    transform: [{ scale: 0.95 }],
    padding: 0,
  },
})
