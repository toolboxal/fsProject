import { TouchableOpacity, StyleSheet, View, Text } from 'react-native'
import { Colors } from '@/constants/Colors'
import { router } from 'expo-router'
import uploadRecord from '@/utils/uploadRecord'
import createBackup from '@/utils/createBackup'
import restoreRecord from '@/utils/restoreBackup'
import generatePDF from '@/utils/generatePDF'

type TDropdownMenuProps = {
  handleMenuOpen: () => void
  existingRecords: boolean
}

const DropdownMenu = ({
  handleMenuOpen,
  existingRecords,
}: TDropdownMenuProps) => {
  const handleUpload = async () => {
    console.log('pressed handle')
    await uploadRecord()
  }

  const handleBackUp = async () => {
    await createBackup()
  }
  const handleRestore = async () => {
    await restoreRecord()
  }
  const handleGeneratePDF = async () => {
    await generatePDF()
  }

  return (
    <View style={styles.dropdownContainer}>
      {existingRecords && (
        <TouchableOpacity
          style={styles.optionBox}
          activeOpacity={0.9}
          onPress={() => handleBackUp()}
        >
          <Text style={styles.optionText}>Create backup</Text>
        </TouchableOpacity>
      )}
      <View style={styles.divider}></View>
      <TouchableOpacity
        style={styles.optionBox}
        activeOpacity={0.9}
        onPress={() => handleRestore()}
      >
        <Text style={styles.optionText}>Restore backup</Text>
      </TouchableOpacity>
      <View style={styles.divider}></View>
      <TouchableOpacity
        style={styles.optionBox}
        activeOpacity={0.9}
        onPress={() => {
          handleUpload()
          handleMenuOpen()
        }}
      >
        <Text style={styles.optionText}>Upload file</Text>
      </TouchableOpacity>
      <View style={styles.divider}></View>
      <TouchableOpacity
        style={styles.optionBox}
        activeOpacity={0.9}
        onPress={() => {
          handleGeneratePDF()
          handleMenuOpen()
        }}
      >
        <Text style={styles.optionText}>Generate pdf</Text>
      </TouchableOpacity>
      <View style={styles.divider}></View>
      <TouchableOpacity
        style={styles.optionBox}
        activeOpacity={0.9}
        onPress={() => {
          router.navigate('/readmePage')
          handleMenuOpen()
        }}
      >
        <Text style={styles.optionText}>Readme</Text>
      </TouchableOpacity>
    </View>
  )
}
export default DropdownMenu

const styles = StyleSheet.create({
  dropdownContainer: {
    position: 'absolute',
    top: 30,
    right: 0,
    borderRadius: 8,
    overflow: 'hidden',
    transform: [{ translateX: -50 }, { translateY: 20 }],
    opacity: 0.95,
  },
  optionBox: {
    padding: 6,
    paddingLeft: 12,
    paddingRight: 40,
    backgroundColor: Colors.primary900,
  },
  optionText: {
    fontFamily: 'IBM-SemiBold',
    fontSize: 18,
    color: Colors.white,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: Colors.primary500,
  },
})
