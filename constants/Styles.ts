import { StyleSheet } from 'react-native'
import { Colors } from './Colors'

export const defaultStyles = StyleSheet.create({
  textH1: {
    fontFamily: 'IBM-Bold',
    fontSize: 24,
  },
  textH2: {
    fontFamily: 'IBM-SemiBold',
    fontSize: 20,
  },

  textBody: {
    fontFamily: 'IBM-Regular',
    fontSize: 16,
    color: Colors.primary950,
  },
})
