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
  const i18n = useTranslations()

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
              <Text style={styles.headerTxt}>Hello! 👋</Text>
              <Text style={styles.subHeaderTxt}>To new users - welcome!</Text>
              <Text style={styles.currentUserTxt}>
                Thank you for giving me a try. I hope I can be useful to your
                ministry.
              </Text>
              <Text style={styles.subHeaderTxt}>
                To current users - exciting updates!
              </Text>
              <Text style={styles.currentUserTxt}>
                - New schedule page to add and manage your field service
                appointments.
              </Text>
              <Text style={styles.currentUserTxt}>- Change app language.</Text>
              <Text
                style={[
                  styles.currentUserTxt,
                  { fontFamily: 'IBM-Italic', fontSize: 15 },
                ]}
              >
                Currently available in English, Spanish, Portuguese, Chinese and
                Japanese.
              </Text>

              <Text style={styles.currentUserTxt}>
                Thank you for your patience and support!
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
    width: '90%',
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
    fontFamily: 'IBM-Medium',
    fontSize: 18,
    color: Colors.primary800,
    marginTop: 7,
    marginBottom: 5,
  },
  currentUserTxt: {
    fontFamily: 'IBM-Regular',
    fontSize: 17,
    color: Colors.primary800,
    marginTop: 7,
  },
})
