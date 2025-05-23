import { View, Text, TextInput, StyleSheet } from 'react-native'
import { Colors } from '@/constants/Colors'

type TInputProps = {
  value: string
  onChangeText: (value: string) => void
  onBlur: () => void
  label: string
  extraStyles?: {}
  placeholderText?: string
  multiline?: boolean
  autoFocus?: boolean
}

const TextInputComponent = ({
  value,
  onChangeText,
  onBlur,
  label,
  extraStyles = {},
  placeholderText,
  multiline = false,
  autoFocus = false,
}: TInputProps) => {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        selectionColor={Colors.primary700}
        placeholder={placeholderText}
        placeholderTextColor={Colors.primary300}
        multiline={multiline}
        style={[styles.inputStyle, extraStyles]}
        textAlignVertical="top"
        autoFocus={autoFocus}
      />
    </View>
  )
}
export default TextInputComponent

const styles = StyleSheet.create({
  inputStyle: {
    borderWidth: 1,
    borderColor: Colors.primary400,
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontFamily: 'IBM-Medium',
    fontSize: 17,
    color: Colors.primary900,
    backgroundColor: Colors.emerald50,
  },
  label: {
    fontFamily: 'IBM-Regular',
    color: Colors.primary900,
    paddingLeft: 3,
    fontSize: 16,
    marginBottom: 3,
  },
})
