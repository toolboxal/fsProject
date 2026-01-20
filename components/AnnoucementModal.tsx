import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Image,
} from 'react-native'
import Text from '@/components/Text'
import { Colors } from '@/constants/Colors'
import EvilIcons from '@expo/vector-icons/EvilIcons'
import { useTranslations } from '@/app/_layout'
import { Linking } from 'react-native'

interface AnnoucementModalProps {
  visible: boolean
  onClose: () => void
}

const APP_STORE_ID = '6745219755' // Replace with your actual App Store ID
const PLAY_STORE_ID = 'YOUR_PACKAGE_NAME' // Replace with your Android package name e.g. 'com.yourcompany.appname'

const openAppStore = () => {
  const url = Platform.select({
    ios: `https://apps.apple.com/app/id${APP_STORE_ID}`,
    android: `https://play.google.com/store/apps/details?id=${PLAY_STORE_ID}`,
    default: `https://apps.apple.com/app/id${APP_STORE_ID}`,
  })

  Linking.canOpenURL(url).then((supported) => {
    if (supported) {
      Linking.openURL(url)
    } else {
      console.log(`Cannot open store URL: ${url}`)
    }
  })
}

const AnnoucementModal = ({ visible, onClose }: AnnoucementModalProps) => {
  // const i18n = useTranslations()

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback>
        <Pressable style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={styles.modalContent}>
              <Pressable onPress={onClose} style={{ marginLeft: 'auto' }}>
                <EvilIcons name="close" size={30} color={Colors.primary800} />
              </Pressable>
              <Text
                style={[
                  styles.currentUserTxt,
                  {
                    fontFamily: 'IBM-Italic',
                    fontSize: 15,
                    marginBottom: 10,
                    color: Colors.primary600,
                  },
                ]}
              >
                version 1.6.1
              </Text>
              <Text style={[styles.headerTxt, { color: Colors.primary600 }]}>
                Backup banner in records page
              </Text>
              {/* <Image
                source={require('@/assets/images/announce1.jpeg')}
                resizeMode="contain"
                style={{
                  width: '100%',
                  height: 150,
                  borderRadius: 10,
                  overflow: 'hidden',
                }}
              /> */}

              <Text style={styles.currentUserTxt}>
                {`Backup banner to show the last attempted backup to your own ${Platform.OS === 'ios' ? 'iCloud' : 'Google Drive'}.`}
              </Text>
              <Text
                style={[styles.currentUserTxt, { fontFamily: 'IBM-Italic' }]}
              >
                * Your records and reports stay on your phone, not a server, so
                keep them safe by backing up your data regularly.
              </Text>
            </View>
          </KeyboardAvoidingView>
        </Pressable>
      </TouchableWithoutFeedback>
    </Modal>
  )
}
export default AnnoucementModal
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 20, 20, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    marginBottom: 15,
    backgroundColor: Colors.primary100,
    borderRadius: 25,
    padding: 18,
    width: '95%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTxt: {
    fontFamily: 'IBM-Bold',
    fontSize: 20,
    color: Colors.primary800,
    marginBottom: 12,
  },
  subHeaderTxt: {
    fontFamily: 'IBM-SemiBold',
    fontSize: 15,
    color: Colors.primary800,
    marginTop: 7,
    marginBottom: 1,
  },
  currentUserTxt: {
    fontFamily: 'IBM-Regular',
    fontSize: 15,
    color: Colors.primary800,
    marginVertical: 8,
  },
})
