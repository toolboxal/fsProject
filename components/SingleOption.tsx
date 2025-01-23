import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Colors } from '@/constants/Colors'
import Entypo from '@expo/vector-icons/Entypo'

type Props = {
  handler: () => void
  headerTxt: string
  descTxt: string
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
        <Text style={[styles.btnDescTxt, styleTxt]}>{descTxt}</Text>
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
  },
  btnTxtWrapper: {
    flexDirection: 'column',
    gap: 3,
  },
  btnHeadTxt: {
    fontFamily: 'IBM-SemiBold',
    fontSize: 16,
    color: Colors.emerald700,
  },
  btnDescTxt: {
    fontFamily: 'IBM-Regular',
    fontSize: 13,
    color: Colors.primary700,
  },
})
