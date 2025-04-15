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
import { useQueryClient } from '@tanstack/react-query'

type TProps = {
  item: TPerson
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>
}
const statusOptions: {
  type: TPerson['status']
  color: string
  label: string
}[] = [
  { type: 'irregular', label: 'hard to find', color: Colors.sky200 },
  { type: 'frequent', label: 'frequent visits', color: Colors.purple100 },
  { type: 'committed', label: 'established', color: Colors.purple300 },
]

const SingleRecord = (prop: TProps) => {
  const queryClient = useQueryClient()
  const setSelectedPerson = useMyStore((state) => state.setSelectedPerson)

  const { item, setModalVisible } = prop
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
        // handleOpenBtmSheet('expand')
        setModalVisible((prev) => !prev)
        queryClient.invalidateQueries({
          queryKey: ['tags', id],
        })
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
            styles.statusBox,
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
    </TouchableOpacity>
  )
}
export default SingleRecord

const styles = StyleSheet.create({
  container: {
    padding: 9,
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
  statusBox: {
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
