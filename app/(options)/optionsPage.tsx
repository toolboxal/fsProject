import {
  StyleSheet,
  Text,
  View,
  Alert,
  ScrollView,
  Platform,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { Colors } from '@/constants/Colors'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import SingleOption from '@/components/SingleOption'
import { toast } from 'sonner-native'
import { useTranslations } from '../_layout'
import useMyStore from '@/store/store'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import Ionicons from '@expo/vector-icons/Ionicons'

import uploadRecord from '@/utils/uploadRecord'
import createBackup from '@/utils/createBackup'
import restoreBackupFunc from '@/utils/restoreBackup'
import createDocx from '@/utils/createDocx'
import deleteAllRecords from '@/utils/deleteAllRecords'
import deleteAllReports from '@/utils/deleteAllReports'
import * as MailComposer from 'expo-mail-composer'
import * as Device from 'expo-device'
import { CircleAlert } from 'lucide-react-native'

const optionsPage = () => {
  const queryClient = useQueryClient()
  const router = useRouter()
  const i18n = useTranslations()
  const lang = useMyStore((state) => state.language)

  const handleBackUp = async () => {
    await createBackup()
    router.dismiss()
  }
  const handleRestore = async () => {
    await restoreBackupFunc(queryClient)
    router.dismiss()
  }
  const handleUpload = async () => {
    console.log('pressed handle')
    await uploadRecord(queryClient, lang, i18n)
    router.dismiss()
  }

  const handleCreateDocx = async () => {
    await createDocx()
    router.dismiss()
  }

  const handleMailComposer = async () => {
    console.log('pressed mailComposer')

    MailComposer.composeAsync({
      recipients: ['contact@alvindevapps.com'],
      body: `\n\n\n\n\nDevice: ${Device.modelName}
        Device Name: ${Device.deviceName}
OS: ${Device.osName}
OS Version: ${Device.osVersion}`,
    })
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.mainContainer}
        showsVerticalScrollIndicator={false}
        // bounces={false}
      >
        <View style={styles.sectionContainer}>
          <Ionicons
            name="cog"
            size={24}
            color={Colors.primary500}
            style={{ marginBottom: 5, paddingLeft: 3 }}
          />
          {/* settings page */}
          <SingleOption
            handler={() => router.navigate('/(options)/settingsPage')}
            headerTxt={i18n.t('options.settingsTitle')}
            descTxt={i18n.t('options.settingsDesc')}
          />
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeadTxt}>
            {i18n.t('options.tagsHeader')}
          </Text>
          {/* info */}
          <SingleOption
            handler={() => router.navigate('/(options)/tagsPage')}
            headerTxt={i18n.t('options.tagsTitle')}
            descTxt={i18n.t('options.tagsDesc')}
          />
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeadTxt}>
            {i18n.t('options.backupHeader')}
          </Text>
          {/* Create backup */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              padding: 10,
              backgroundColor: Colors.rose100,
              borderRadius: 5,
            }}
          >
            <CircleAlert size={24} color={Colors.rose700} />
            <Text style={{ fontFamily: 'IBM-Regular', fontSize: 13 }}>
              {i18n.t('options.backupReminderTxt')}
            </Text>
          </View>
          <SingleOption
            handler={handleBackUp}
            headerTxt={i18n.t('options.createBackupTitle')}
            descTxt={i18n.t('options.createBackupDesc')}
          />
          {/* Restore backup */}
          <SingleOption
            handler={() => {
              Alert.alert(
                `${i18n.t('options.restoreAlertTitle')}`,
                `${i18n.t('options.restoreAlertDesc')}`,
                [
                  {
                    text: i18n.t('options.cancel'),
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                  },
                  {
                    text: i18n.t('options.proceed'),
                    onPress: () => {
                      handleRestore()
                    },
                    style: 'destructive',
                  },
                ]
              )
            }}
            headerTxt={i18n.t('options.restoreBackupTitle')}
            descTxt={i18n.t('options.restoreBackupDesc')}
          />
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeadTxt}>
            {i18n.t('options.sharedHeader')}
          </Text>
          {/* Upload 1 record */}
          <SingleOption
            handler={handleUpload}
            headerTxt={i18n.t('options.sharedTitle')}
            descTxt={i18n.t('options.sharedDesc')}
          />
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeadTxt}>
            {i18n.t('options.exportHeader')}
          </Text>
          {/* Export as .docx */}
          <SingleOption
            handler={handleCreateDocx}
            headerTxt={i18n.t('options.exportTitle')}
            descTxt={i18n.t('options.exportDesc')}
          />
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeadTxt}>
            {i18n.t('options.infoHeader')}
          </Text>
          {/* info */}
          <SingleOption
            handler={() => router.navigate('/(options)/readmePage')}
            headerTxt={i18n.t('options.infoTitle')}
            descTxt={i18n.t('options.infoDesc')}
          />
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeadTxt}>
            {i18n.t('options.bugsReportHeader')}
          </Text>
          {/* info */}
          <SingleOption
            handler={handleMailComposer}
            headerTxt={i18n.t('options.BugsReportTitle')}
            descTxt={i18n.t('options.BugsReportDesc')}
          />
        </View>
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeadTxt, { color: Colors.rose700 }]}>
            {i18n.t('options.resetHeader')}
          </Text>
          {/* deletion buttons!!!! */}
          <SingleOption
            handler={() => {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning
              )
              Alert.alert(
                `${i18n.t('options.deleteRecTitle')}`,
                `${i18n.t('options.deleteAlertDesc')}`,
                [
                  {
                    text: i18n.t('options.cancel'),
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                  },
                  {
                    text: i18n.t('options.proceed'),
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
                            {i18n.t('options.toastDeleteRecords')}
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
            }}
            headerTxt={i18n.t('options.deleteRecTitle')}
            descTxt={i18n.t('options.deleteRecDesc')}
            styleTxt={{ color: Colors.rose700 }}
            styleBtn={{ backgroundColor: Colors.rose100 }}
          />
          <SingleOption
            handler={() => {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning
              )
              Alert.alert(
                `${i18n.t('options.deleteRepTitle')}`,
                `${i18n.t('options.deleteAlertDesc')}`,
                [
                  {
                    text: i18n.t('options.cancel'),
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                  },
                  {
                    text: i18n.t('options.proceed'),
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
                            {i18n.t('options.toastDeleteReports')}
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
            }}
            headerTxt={i18n.t('options.deleteRepTitle')}
            descTxt={i18n.t('options.deleteRepDesc')}
            styleTxt={{ color: Colors.rose700 }}
            styleBtn={{ backgroundColor: Colors.rose100 }}
          />
        </View>
      </ScrollView>
    </View>
  )
}
export default optionsPage
const styles = StyleSheet.create({
  mainContainer: {
    // flex: 1,
    backgroundColor: Colors.primary300,
    paddingVertical: 20,
    paddingHorizontal: 15,
    gap: 10,
    height: Platform.OS === 'ios' ? '135%' : '150%',
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
