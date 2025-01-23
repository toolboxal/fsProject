import { Colors } from '@/constants/Colors'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Entypo from '@expo/vector-icons/Entypo'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'

import uploadRecord from '@/utils/uploadRecord'
import createBackup from '@/utils/createBackup'
import restoreRecord from '@/utils/restoreBackup'
import createDocx from '@/utils/createDocx'

const optionsPage = () => {
  const queryClient = useQueryClient()
  const router = useRouter()

  const handleBackUp = async () => {
    await createBackup()
    router.dismiss()
  }
  const handleRestore = async () => {
    await restoreRecord(queryClient)
    router.dismiss()
  }
  const handleUpload = async () => {
    console.log('pressed handle')
    await uploadRecord(queryClient)
    router.dismiss()
  }

  const handleCreateDocx = async () => {
    await createDocx()
    router.dismiss()
  }
  return (
    <View style={styles.mainContainer}>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeadTxt}>Backup</Text>
        {/* Create backup */}
        <Pressable
          style={({ pressed }) => {
            return [
              styles.btn,
              {
                backgroundColor: pressed ? Colors.primary100 : Colors.primary50,
              },
            ]
          }}
          onPress={() => handleBackUp()}
        >
          <View style={styles.btnTxtWrapper}>
            <Text style={styles.btnHeadTxt}>Create backup</Text>
            <Text style={styles.btnDescTxt}>
              This file can be used to restore all data later
            </Text>
          </View>
          <Entypo
            name="chevron-small-right"
            size={28}
            color={Colors.primary300}
          />
        </Pressable>
        {/* Restore backup */}
        <Pressable
          style={({ pressed }) => {
            return [
              styles.btn,
              {
                backgroundColor: pressed ? Colors.primary100 : Colors.primary50,
              },
            ]
          }}
          onPress={() => handleRestore()}
        >
          <View style={styles.btnTxtWrapper}>
            <Text style={styles.btnHeadTxt}>Restore backup</Text>
            <Text style={styles.btnDescTxt}>
              Find your JSON file to restore all data
            </Text>
          </View>
          <Entypo
            name="chevron-small-right"
            size={28}
            color={Colors.primary300}
          />
        </Pressable>
      </View>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeadTxt}>Shared Record</Text>
        {/* Upload 1 record */}
        <Pressable
          style={({ pressed }) => {
            return [
              styles.btn,
              {
                backgroundColor: pressed ? Colors.primary100 : Colors.primary50,
              },
            ]
          }}
          onPress={() => {
            handleUpload()
          }}
        >
          <View style={styles.btnTxtWrapper}>
            <Text style={styles.btnHeadTxt}>Upload 1 record</Text>
            <Text style={styles.btnDescTxt}>
              Upload shared record from another user
            </Text>
          </View>
          <Entypo
            name="chevron-small-right"
            size={28}
            color={Colors.primary300}
          />
        </Pressable>
      </View>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeadTxt}>Export Records</Text>
        {/* Export as .docx */}
        <Pressable
          style={({ pressed }) => {
            return [
              styles.btn,
              {
                backgroundColor: pressed ? Colors.primary100 : Colors.primary50,
              },
            ]
          }}
          onPress={() => {
            handleCreateDocx()
          }}
        >
          <View style={styles.btnTxtWrapper}>
            <Text style={styles.btnHeadTxt}>Create a Word Document file</Text>
            <Text style={styles.btnDescTxt}>
              Export and view in Google Docs etc.
            </Text>
          </View>
          <Entypo
            name="chevron-small-right"
            size={28}
            color={Colors.primary300}
          />
        </Pressable>
      </View>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeadTxt}>Info</Text>
        {/* info */}
        <Pressable
          style={({ pressed }) => {
            return [
              styles.btn,
              {
                backgroundColor: pressed ? Colors.primary100 : Colors.primary50,
              },
            ]
          }}
          onPress={() => {
            router.navigate('/(options)/readmePage')
          }}
        >
          <View style={styles.btnTxtWrapper}>
            <Text style={styles.btnHeadTxt}>Readme</Text>
            <Text style={styles.btnDescTxt}>
              Things to note and new features
            </Text>
          </View>
          <Entypo
            name="chevron-small-right"
            size={28}
            color={Colors.primary300}
          />
        </Pressable>
      </View>
    </View>
  )
}
export default optionsPage
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.primary300,
    paddingVertical: 10,
    paddingHorizontal: 15,
    gap: 10,
  },
  sectionContainer: {
    flexDirection: 'column',
    gap: 2,
  },
  sectionHeadTxt: {
    fontFamily: 'IBM-Italic',
    fontSize: 16,
    color: Colors.primary700,
    marginBottom: 3,
    paddingLeft: 3,
  },
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
