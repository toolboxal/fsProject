import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { Colors } from '@/constants/Colors'
import EvilIcons from '@expo/vector-icons/EvilIcons'
import { useTranslations } from '@/app/_layout'

interface AnnoucementModalProps {
  visible: boolean
  onClose: () => void
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
                version 1.4
              </Text>
              <Text style={styles.headerTxt}>HEY HEY! 👋</Text>
              <Text style={styles.currentUserTxt}>
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
              <Text style={styles.currentUserTxt}>Your Brother</Text>
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
    fontSize: 18,
    color: Colors.primary800,
    marginTop: 7,
    marginBottom: 1,
  },
  currentUserTxt: {
    fontFamily: 'IBM-Regular',
    fontSize: 15,
    color: Colors.primary800,
    marginTop: 2,
  },
})
