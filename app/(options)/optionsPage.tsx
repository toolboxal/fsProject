import { StyleSheet, Text, View, Alert } from 'react-native'
import { Colors } from '@/constants/Colors'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import SingleOption from '@/components/SingleOption'
import { toast } from 'sonner-native'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'

import uploadRecord from '@/utils/uploadRecord'
import createBackup from '@/utils/createBackup'
import restoreRecord from '@/utils/restoreBackup'
import createDocx from '@/utils/createDocx'
import deleteAllRecords from '@/utils/deleteAllRecords'
import deleteAllReports from '@/utils/deleteAllReports'

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
        <SingleOption
          handler={handleBackUp}
          headerTxt="Create backup"
          descTxt="This file can be used to restore all data later"
        />
        {/* Restore backup */}
        <SingleOption
          handler={handleRestore}
          headerTxt="Restore backup"
          descTxt="Find your JSON file to restore all data"
        />
      </View>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeadTxt}>Shared Record</Text>
        {/* Upload 1 record */}
        <SingleOption
          handler={handleUpload}
          headerTxt="Upload 1 record"
          descTxt="Upload shared record from another user"
        />
      </View>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeadTxt}>Export Records</Text>
        {/* Export as .docx */}
        <SingleOption
          handler={handleCreateDocx}
          headerTxt="Create a Word Document file"
          descTxt="Export and view in Google Docs etc."
        />
      </View>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeadTxt}>Info</Text>
        {/* info */}
        <SingleOption
          handler={() => router.navigate('/(options)/readmePage')}
          headerTxt="Readme"
          descTxt="Things to note and new features"
        />
      </View>
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionHeadTxt, { color: Colors.rose700 }]}>
          Reset
        </Text>
        {/* deletion buttons!!!! */}
        <SingleOption
          handler={() =>
            Alert.alert(
              'Delete all Records',
              'Please make sure you have a backup before proceeding',
              [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {
                  text: 'Proceed',
                  onPress: () => {
                    deleteAllRecords()
                    router.replace('/(tabs)/recordsPage')
                    toast.custom(
                      <View
                        style={{
                          alignSelf: 'center',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          backgroundColor: Colors.black,
                          width: 240,
                          paddingHorizontal: 8,
                          paddingVertical: 10,
                          borderRadius: 8,
                        }}
                      >
                        <MaterialCommunityIcons
                          name="delete"
                          size={23}
                          color={Colors.rose500}
                        />
                        <Text
                          style={{
                            fontFamily: 'IBM-Regular',
                            fontSize: 15,
                            color: Colors.white,
                          }}
                        >
                          All Records deleted
                        </Text>
                      </View>,
                      {
                        duration: 3000,
                      }
                    )
                  },
                  style: 'destructive',
                },
              ]
            )
          }
          headerTxt="Delete all Records"
          descTxt="This will delete all records permanently"
          styleTxt={{ color: Colors.rose700 }}
          styleBtn={{ backgroundColor: Colors.rose100 }}
        />
        <SingleOption
          handler={() =>
            Alert.alert(
              'Delete all Reports',
              'Please make sure you have a backup before proceeding',
              [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {
                  text: 'Proceed',
                  onPress: () => {
                    deleteAllReports()
                    router.replace('/(tabs)/reportPage')
                    toast.custom(
                      <View
                        style={{
                          alignSelf: 'center',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          backgroundColor: Colors.black,
                          width: 240,
                          paddingHorizontal: 8,
                          paddingVertical: 10,
                          borderRadius: 8,
                        }}
                      >
                        <MaterialCommunityIcons
                          name="delete"
                          size={23}
                          color={Colors.rose500}
                        />
                        <Text
                          style={{
                            fontFamily: 'IBM-Regular',
                            fontSize: 15,
                            color: Colors.white,
                          }}
                        >
                          All Reports deleted
                        </Text>
                      </View>,
                      {
                        duration: 5000,
                      }
                    )
                  },
                  style: 'destructive',
                },
              ]
            )
          }
          headerTxt="Delete all Reports"
          descTxt="This will delete all reports permanently"
          styleTxt={{ color: Colors.rose700 }}
          styleBtn={{ backgroundColor: Colors.rose100 }}
        />
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
})
