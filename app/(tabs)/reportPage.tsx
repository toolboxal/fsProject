import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
import { FontAwesome6 } from '@expo/vector-icons'
import { Colors } from '@/constants/Colors'

const reportPage = () => {
  const { bottom } = useSafeAreaInsets()
  return (
    <SafeAreaView style={styles.container}>
      <Text>reportPage</Text>
      {/* :::::button for new record :::::: */}
      <View
        style={{
          position: 'absolute',
          bottom: bottom + 75 + 25,
          right: 15,
          gap: 15,
        }}
      >
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            router.navigate('/reportFormSheet')
          }}
          activeOpacity={0.8}
        >
          <FontAwesome6 name="add" size={13} color={Colors.primary50} />
          <Text style={styles.btnText}>New Report</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
export default reportPage
const styles = StyleSheet.create({
  container: { flex: 1 },
  addBtn: {
    flexDirection: 'row',
    gap: 3,
    backgroundColor: Colors.emerald950,
    padding: 13,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  btnText: {
    color: Colors.white,
    fontFamily: 'IBM-SemiBold',
    fontSize: 15,
  },
})