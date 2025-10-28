import { forwardRef } from 'react'
import { TextInput as RNTextInput, TextInputProps } from 'react-native'

export const TextInput = forwardRef<RNTextInput, TextInputProps>((props, ref) => {
  return <RNTextInput {...props} ref={ref} allowFontScaling={false} />
})

TextInput.displayName = 'TextInput'

export default TextInput
