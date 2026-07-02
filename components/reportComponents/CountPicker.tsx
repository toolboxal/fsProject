import { View, StyleSheet, Platform } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { Colors } from '@/constants/Colors'

type CountPickerProps = {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  suffix?: string
}

const CountPicker = ({
  value,
  onChange,
  min = 0,
  max = 20,
  suffix = '',
}: CountPickerProps) => {
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i)

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={value}
        onValueChange={(next) => onChange(Number(next))}
        style={styles.picker}
        itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}
      >
        {options.map((n) => (
          <Picker.Item
            key={n}
            label={suffix ? `${n} ${suffix}` : `${n}`}
            value={n}
          />
        ))}
      </Picker>
    </View>
  )
}

export default CountPicker

const styles = StyleSheet.create({
  container: {
    width: 90,
    marginVertical: Platform.OS === 'ios' ? -15 : -4,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
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
