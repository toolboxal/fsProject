import { Pressable, StyleSheet, View } from 'react-native'
import Text from '@/components/Text'
import { Colors } from '@/constants/Colors'
import Entypo from '@expo/vector-icons/Entypo'
import useMyStore from '@/store/store'

type Props = {
  handler: () => void
  headerTxt: string
  descTxt?: string
  styleTxt?: {}
  styleBtn?: {}
}

const SingleOption = ({
  handler,
  headerTxt,
  descTxt,
  styleTxt,
  styleBtn,
}: Props) => {
  const lang = useMyStore((state) => state.language)
  return (
    <Pressable
      style={({ pressed }) => {
        return [
          styles.btn,
          {
            backgroundColor: pressed ? Colors.primary100 : Colors.primary50,
          },
          styleBtn,
        ]
      }}
      onPress={() => handler()}
    >
      <View style={styles.btnTxtWrapper}>
        <Text style={[styles.btnHeadTxt, styleTxt]}>{headerTxt}</Text>
        <Text
          style={[
            styles.btnDescTxt,
            styleTxt,
            { fontSize: lang === 'ja' ? 10.5 : 12 },
          ]}
        >
          {descTxt}
        </Text>
      </View>
      <Entypo name="chevron-small-right" size={28} color={Colors.primary300} />
    </Pressable>
  )
}
export default SingleOption
const styles = StyleSheet.create({
  btn: {
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 60,
  },
  btnTxtWrapper: {
    flexDirection: 'column',
    gap: 4,
  },
  btnHeadTxt: {
    fontFamily: 'IBM-SemiBold',
    fontSize: 15,
    color: Colors.emerald700,
  },
  btnDescTxt: {
    fontFamily: 'IBM-Regular',
    // fontSize: 13,
    color: Colors.primary700,
  },
})
