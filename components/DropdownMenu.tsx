import { TouchableOpacity, StyleSheet, View, Text } from 'react-native'
import { Colors } from '@/constants/Colors'
import { router } from 'expo-router'
import uploadRecord from '@/utils/uploadRecord'
import createBackup from '@/utils/createBackup'
import restoreRecord from '@/utils/restoreBackup'
import generatePDF from '@/utils/generatePDF'
import createDocx from '@/utils/createDocx'
import Feather from '@expo/vector-icons/Feather'
import Ionicons from '@expo/vector-icons/Ionicons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { useQueryClient } from '@tanstack/react-query'

type TDropdownMenuProps = {
  handleMenuOpen: () => void
  existingRecords: boolean
}

const DropdownMenu = ({
  handleMenuOpen,
  existingRecords,
}: TDropdownMenuProps) => {
  const queryClient = useQueryClient()

  const handleUpload = async () => {
    console.log('pressed handle')
    await uploadRecord(queryClient)
  }

  const handleBackUp = async () => {
    await createBackup()
  }
  const handleRestore = async () => {
    await restoreRecord(queryClient)
  }
  const handleGeneratePDF = async () => {
    await generatePDF()
  }
  const handleCreateDocx = async () => {
    await createDocx()
  }

  return (
    <View style={styles.dropdownContainer}>
      {existingRecords && (
        <TouchableOpacity
          style={styles.optionBox}
          activeOpacity={0.9}
          onPress={() => handleBackUp()}
        >
          <Ionicons name="create-outline" size={24} color={Colors.emerald200} />
          <Text style={styles.optionText}>Create backup</Text>
        </TouchableOpacity>
      )}
      <View style={styles.divider}></View>
      <TouchableOpacity
        style={styles.optionBox}
        activeOpacity={0.9}
        onPress={() => handleRestore()}
      >
        <MaterialCommunityIcons
          name="file-restore-outline"
          size={26}
          color={Colors.emerald200}
        />
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
        <Feather name="upload" size={24} color={Colors.emerald200} />
        <Text style={styles.optionText}>Upload single record</Text>
      </TouchableOpacity>
      {/* <View style={styles.divider}></View>
      {existingRecords && (
        <TouchableOpacity
          style={styles.optionBox}
          activeOpacity={0.9}
          onPress={() => {
            handleGeneratePDF()
            handleMenuOpen()
          }}
        >
          <AntDesign name="pdffile1" size={24} color={Colors.emerald200} />
          <Text style={styles.optionText}>Generate pdf</Text>
        </TouchableOpacity>
      )} */}
      <View style={styles.divider}></View>
      {existingRecords && (
        <TouchableOpacity
          style={styles.optionBox}
          activeOpacity={0.9}
          onPress={() => {
            handleCreateDocx()
            handleMenuOpen()
          }}
        >
          <Ionicons name="document" size={24} color={Colors.emerald200} />
          <Text style={styles.optionText}>Export as document</Text>
        </TouchableOpacity>
      )}
      <View style={styles.divider}></View>
      <TouchableOpacity
        style={styles.optionBox}
        activeOpacity={0.9}
        onPress={() => {
          router.navigate('/readmePage')
          handleMenuOpen()
        }}
      >
        <Ionicons
          name="information-circle-outline"
          size={24}
          color={Colors.emerald200}
        />
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
    transform: [{ translateX: -50 }, { translateY: 25 }],
  },
  optionBox: {
    padding: 10,
    paddingLeft: 12,
    paddingRight: 40,
    backgroundColor: Colors.primary900,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontFamily: 'IBM-SemiBold',
    fontSize: 18,
    color: Colors.white,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: Colors.primary500,
  },
})
