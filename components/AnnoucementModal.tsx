import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  Image,
} from 'react-native'
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
            <Pressable style={styles.modalContent}>
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
                version 1.5.0
              </Text>
              <Text style={[styles.headerTxt, { color: Colors.primary600 }]}>
                NEW FEATURE - ADD MARKERS TO MAP 😀
              </Text>
              <Image
                source={require('@/assets/images/announcement2.png')}
                style={{
                  width: '100%',
                  height: 150,
                  borderRadius: 10,
                  overflow: 'hidden',
                }}
              />
              <Text style={styles.currentUserTxt}>
                Long press anywhere on the map and choose between creating a
                record or adding a marker.
              </Text>
              <Image
                source={require('@/assets/images/announcement.png')}
                style={{
                  width: '100%',
                  height: 150,
                  borderRadius: 10,
                  overflow: 'hidden',
                }}
              />
              <Text style={styles.currentUserTxt}>
                Drop a marker for the week's field service meeting point or
                where you like to continue informal witnessing.
              </Text>

              {/* <Text style={styles.currentUserTxt}>
                You can email me any bugs encountered or feedback for the app
              </Text> */}

              {/* <Text style={styles.currentUserTxt}>
                your feedback and suggestions have been invaluable.
              </Text>
              <Text style={styles.subHeaderTxt}>
                what's new in version 1.4?
              </Text>
              <Text style={styles.subHeaderTxt}>GROUP BY TAGGING</Text>
              <Text style={styles.currentUserTxt}>
                eg. (weekends only), (chinese speaking), etc..
              </Text>
              <Text style={styles.subHeaderTxt}>FOLLOW UPS</Text>
              <Text style={styles.currentUserTxt}>
                now, you can add follow up notes for each person.
              </Text>
              <Text style={styles.subHeaderTxt}>CONTACT STATUS</Text>
              <Text style={styles.currentUserTxt}>
                assign person as 'established,' 'frequent visits' or 'hard to
                find'.
              </Text>
              <Text style={styles.subHeaderTxt}>NAVIGATION AND CONTACT</Text>
              <Text style={styles.currentUserTxt}>
                link to apple/google maps to get directions. Also, you can
                directly call or whatsapp the person.
              </Text>

              <Text
                style={[
                  styles.currentUserTxt,
                  {
                    fontFamily: 'IBM-Regular',
                    fontSize: 15,
                    marginTop: 20,
                    marginBottom: 10,
                    color: Colors.rose700,
                  },
                ]}
              >
                I have rewritten the code for the map to make it more
                interactive. However, I can't implement the dark map and
                clustering features at the moment.
              </Text>
              <Text style={styles.currentUserTxt}>
                Thank you for your patience and feedback!
              </Text>
              <Text style={styles.currentUserTxt}>Agape</Text>
              <Text style={styles.currentUserTxt}>Your Brother</Text> */}
            </Pressable>
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
    borderRadius: 20,
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
