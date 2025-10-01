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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { useEffect } from 'react'

type Props = {
  showDatePicker: boolean
  setShowDatePicker: React.Dispatch<React.SetStateAction<boolean>>
  initialDate: Date
  setInitialDate: React.Dispatch<React.SetStateAction<Date>>
}

const DatePickerModal = ({
  showDatePicker,
  setShowDatePicker,
  initialDate,
  setInitialDate,
}: Props) => {
  const colorScheme = useColorScheme()
  const scale = useSharedValue(0)
  const translateY = useSharedValue(100)

  useEffect(() => {
    if (showDatePicker) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 })
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 })
    } else {
      scale.value = 0
      translateY.value = 100
    }
  }, [showDatePicker])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
    }
  })

  const onDateChange = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined
  ) => {
    if (selectedDate) {
      setInitialDate(selectedDate)
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
      <Animated.View style={[animatedStyle]}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.datePickerBox,
            {
              backgroundColor:
                colorScheme === 'dark' ? Colors.primary900 : Colors.emerald300,
            },
          ]}
        >
          <DateTimePicker
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
            value={initialDate || new Date()}
            onChange={onDateChange}
            accentColor={
              colorScheme === 'dark' ? Colors.emerald200 : Colors.primary900
            }
            textColor={'black'}
            style={[
              styles.datePicker,
              {
                backgroundColor:
                  colorScheme === 'dark'
                    ? Colors.primary900
                    : Colors.emerald300,
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
