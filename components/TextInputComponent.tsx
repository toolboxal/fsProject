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
}

const TextInputComponent = ({
  value,
  onChangeText,
  onBlur,
  label,
  extraStyles = {},
  placeholderText,
  multiline = false,
}: TInputProps) => {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        autoComplete="off"
        autoCorrect={false}
        autoCapitalize="sentences"
        selectionColor={Colors.primary200}
        placeholder={placeholderText}
        placeholderTextColor={Colors.primary300}
        multiline={multiline}
        style={[styles.inputStyle, extraStyles]}
        textAlignVertical="top"
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
    fontFamily: 'IBM-SemiBold',
    fontSize: 18,
    color: Colors.primary900,
  },
  label: {
    fontFamily: 'IBM-Regular',
    color: Colors.primary900,
    paddingLeft: 3,
    fontSize: 16,
    marginBottom: 3,
  },
})
