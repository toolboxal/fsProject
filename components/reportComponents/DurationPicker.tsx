import { View, StyleSheet, Platform } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { Colors } from '@/constants/Colors'

const HOUR_OPTIONS = Array.from({ length: 601 }, (_, i) => i)
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => i)

type DurationPickerProps = {
  hours: number
  minutes: number
  onHoursChange: (hours: number) => void
  onMinutesChange: (minutes: number) => void
}

const DurationPicker = ({
  hours,
  minutes,
  onHoursChange,
  onMinutesChange,
}: DurationPickerProps) => {
  return (
    <View style={styles.container}>
      <Picker
        selectedValue={hours}
        onValueChange={(value) => onHoursChange(Number(value))}
        style={styles.picker}
        itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}
      >
        {HOUR_OPTIONS.map((h) => (
          <Picker.Item key={h} label={`${h}h`} value={h} />
        ))}
      </Picker>
      <Picker
        selectedValue={minutes}
        onValueChange={(value) => onMinutesChange(Number(value))}
        style={styles.picker}
        itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}
      >
        {MINUTE_OPTIONS.map((m) => (
          <Picker.Item key={m} label={`${m}m`} value={m} />
        ))}
      </Picker>
    </View>
  )
}

export default DurationPicker

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    width: '100%',
    marginVertical: Platform.OS === 'ios' ? -15 : -4,
    overflow: 'hidden',
  },
  picker: {
    flex: 1,
    height: Platform.OS === 'ios' ? 88 : 40,
    marginTop: Platform.OS === 'ios' ? -6 : 0,
    ...(Platform.OS === 'android' ? { color: Colors.primary950 } : {}),
  },
  pickerItem: {
    fontFamily: 'IBM-Medium',
    fontSize: 13,
    color: Colors.primary950,
    height: 88,
  },
})
