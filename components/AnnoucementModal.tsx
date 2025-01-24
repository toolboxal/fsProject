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
import { useState } from 'react'
import { Colors } from '@/constants/Colors'
import EvilIcons from '@expo/vector-icons/EvilIcons'

interface AnnoucementModalProps {
  visible: boolean
  onClose: () => void
}

const AnnoucementModal = ({ visible, onClose }: AnnoucementModalProps) => {
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
                <EvilIcons name="close" size={30} color="white" />
              </Pressable>
              <Text style={styles.headerTxt}>Updates 👋</Text>
              <Text style={styles.currentUserTxt}>
                If you are a current user, there are some new updates!
              </Text>
              <Text style={[styles.currentUserTxt, { color: Colors.rose300 }]}>
                Please create a new backup to implement new features.
              </Text>
              <Text style={styles.currentUserTxt}>Have a great day!</Text>
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
    backgroundColor: 'rgba(220, 220, 220, 0.8)',
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
    backgroundColor: Colors.primary900,
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
    fontFamily: 'IBM-Medium',
    fontSize: 20,
    color: Colors.emerald300,
    marginBottom: 15,
  },
  currentUserTxt: {
    fontFamily: 'IBM-Medium',
    fontSize: 16,
    color: Colors.white,
    marginBottom: 10,
  },
})
