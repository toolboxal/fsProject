import { Colors } from '@/constants/Colors'
import useMyStore from '@/store/store'

import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  View,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import FontAwesome from '@expo/vector-icons/FontAwesome6'
import { TPerson } from '@/drizzle/schema'

type TProps = {
  item: TPerson
  handleOpenBtmSheet: (action: 'close' | 'expand' | 'snapPoint') => void
  handleActionSheet: (personId: number) => void
}
const statusOptions: {
  type: TPerson['status']
  color: string
  label: string
}[] = [
  { type: 'irregular', label: 'hard to find', color: Colors.primary200 },
  { type: 'frequent', label: 'frequent', color: Colors.purple200 },
  { type: 'committed', label: 'established', color: Colors.purple400 },
]

const SingleRecord = (prop: TProps) => {
  const setSelectedPerson = useMyStore((state) => state.setSelectedPerson)

  const { item, handleOpenBtmSheet, handleActionSheet } = prop
  const { name, block, unit, remarks, id, category, status } = item
  let formattedRemarks = ''
  if (remarks === null) {
    return
  } else {
    formattedRemarks =
      remarks.length > 40 ? remarks.slice(0, 42) + '.....' : remarks
  }
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.container}
      onPress={() => {
        // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setSelectedPerson(item)
        handleOpenBtmSheet('expand')
      }}
    >
      <Text style={styles.houseUnit}>
        {block ? `# ${unit}` : `house no. ${unit}`}
      </Text>
      <View style={styles.nameContainer}>
        <Text style={styles.textName}>{name}</Text>
        <View
          style={[
            styles.categoryCircle,
            {
              backgroundColor: `${
                category === 'RV'
                  ? Colors.emerald600
                  : category === 'BS'
                  ? Colors.emerald900
                  : Colors.emerald400
              }`,
            },
          ]}
        >
          <Text style={styles.categoryText}>{category}</Text>
        </View>
        <View
          style={[
            styles.statusCircle,
            {
              backgroundColor: `${
                statusOptions.find((option) => option.type === status)?.color
              }`,
            },
          ]}
        >
          <Text style={styles.statusText}>
            {statusOptions.find((option) => option.type === status)?.label}
          </Text>
        </View>
      </View>
      <Text style={styles.textRemarks}>{formattedRemarks}</Text>
      <Pressable
        style={{
          position: 'absolute',
          top: '15%',
          right: 5,
          padding: 10,
        }}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
          setSelectedPerson(item)
          handleActionSheet(id)
        }}
      >
        <FontAwesome
          name="ellipsis-vertical"
          size={22}
          color={Colors.primary400}
        />
      </Pressable>
    </TouchableOpacity>
  )
}
export default SingleRecord

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: Colors.primary50,
    marginVertical: 3,
    borderRadius: 5,
    position: 'relative',
    marginHorizontal: 3,
    maxHeight: 90,
    overflow: 'hidden',
  },
  houseUnit: {
    fontFamily: 'IBM-SemiBoldItalic',
    fontSize: 18,
    color: Colors.emerald700,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  categoryCircle: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    backgroundColor: Colors.emerald300,
  },
  categoryText: {
    fontFamily: 'IBM-SemiBold',
    fontSize: 12,
    color: Colors.white,
  },

  textName: {
    fontFamily: 'IBM-SemiBold',
    fontSize: 18,
    color: Colors.primary900,
  },
  textRemarks: {
    fontFamily: 'IBM-Italic',
    fontSize: 15,
    color: Colors.primary900,
    overflow: 'hidden',
    maxHeight: 25,
  },
  statusCircle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: 'IBM-SemiBold',
    fontSize: 10,
    color: Colors.primary900,
  },
})
