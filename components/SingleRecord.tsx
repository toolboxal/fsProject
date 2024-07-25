import { Colors } from '@/constants/Colors'
import useMyStore from '@/store/store'

import { Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome6'
import { TPerson } from '@/drizzle/schema'

type TProps = {
  item: TPerson
  handleOpenBtmSheet: (action: 'close' | 'expand' | 'snapPoint') => void
  handleActionSheet: (personId: number) => void
}

const SingleRecord = (prop: TProps) => {
  const setSelectedPerson = useMyStore((state) => state.setSelectedPerson)

  const { item, handleOpenBtmSheet, handleActionSheet } = prop
  const { name, unit, isPrivate: isPrivate, remarks, id } = item
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
        setSelectedPerson(item)
        handleOpenBtmSheet('expand')
      }}
    >
      <Text style={styles.houseUnit}>
        {!isPrivate ? `# ${unit}` : `house no. ${unit}`}
      </Text>
      <Text style={styles.textName}>{name}</Text>
      <Text style={styles.textRemarks}>{formattedRemarks}</Text>
      <Pressable
        style={{
          position: 'absolute',
          top: '15%',
          right: 5,
          padding: 10,
        }}
        onPress={() => {
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
  textName: {
    fontFamily: 'IBM-SemiBold',
    fontSize: 18,
    color: Colors.primary900,
  },
  textRemarks: {
    fontFamily: 'IBM-Italic',
    fontSize: 16,
    color: Colors.primary900,
    overflow: 'hidden',
    maxHeight: 25,
  },
})
