import { Text as RNText, TextProps } from 'react-native'

export const Text = (props: TextProps) => {
  return <RNText {...props} allowFontScaling={false} />
}

export default Text
