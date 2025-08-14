import { Colors } from '@/constants/Colors'
import { ArrowRight, ChevronRight } from 'lucide-react-native'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  StyleSheet,
  Text,
  View,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  TextInput,
  Platform,
} from 'react-native'
import { db } from '@/drizzle/db'
import useMyStore from '@/store/store'
import { markerAnnotation } from '@/drizzle/schema'
import { useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import Foundation from '@expo/vector-icons/Foundation'

type Props = {
  showAnnotateModal: boolean
  setShowAnnotateModal: React.Dispatch<React.SetStateAction<boolean>>
}

const MapAnnotateModal = ({
  showAnnotateModal,
  setShowAnnotateModal,
}: Props) => {
  const pressedCoords = useMyStore((state) => state.pressedCoords)
  const queryClient = useQueryClient()
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      annotate: '',
    },
  })

  const onSubmit = async (data: { annotate: string }) => {
    const annotate = data.annotate.trim()
    if (!annotate) {
      setError('annotate', {
        type: 'required',
        message: 'cannot be blank',
      })
      return
    } else if (annotate.length > 50) {
      setError('annotate', {
        type: 'max',
        message: 'exceed 50 characters',
      })
      return
    }
    await db.insert(markerAnnotation).values({
      latitude: pressedCoords.latitude,
      longitude: pressedCoords.longitude,
      annotation: annotate,
    })
    queryClient.invalidateQueries({ queryKey: ['markerAnnotation'] })
    reset()
    setShowAnnotateModal(false)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid)
  }

  return (
    <Modal
      visible={showAnnotateModal}
      animationType="fade"
      onRequestClose={() => setShowAnnotateModal(false)}
      transparent
    >
      <Pressable
        onPress={() => {
          reset()
          setShowAnnotateModal(false)
        }}
        style={styles.overlay}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              marginBottom: 10,
            }}
          >
            <Foundation name="marker" size={15} color={Colors.white} />
            <Text style={styles.title}>
              {`fs meeting point or cart witnessing corner etc.`}
            </Text>
          </View>
          <View style={styles.inputContainer}>
            {errors['annotate'] && (
              <Text style={styles.errorText}>
                {errors['annotate']?.message?.toString()}
              </Text>
            )}
            <Controller
              control={control}
              name="annotate"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="eg. Sat morning fs meeting point"
                  autoFocus={true}
                  autoComplete="off"
                  autoCorrect={true}
                  autoCapitalize="sentences"
                  style={styles.input}
                />
              )}
            />
            <Pressable
              style={styles.submitBtn}
              onPress={handleSubmit(onSubmit)}
            >
              <ArrowRight
                color={Colors.primary50}
                size={25}
                strokeWidth={2.5}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
export default MapAnnotateModal
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    // backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    padding: 15,
    backgroundColor: Colors.primary950,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  title: {
    color: 'white',
    fontFamily: 'IBM-Medium',
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.primary400,
    padding: 10,
    borderRadius: 5,
    fontFamily: 'IBM-Regular',
    fontSize: 16,
    color: Colors.primary50,
    backgroundColor: Colors.primary700,
    flex: 1,
  },
  submitBtn: {
    height: 35,
    width: 35,
    borderRadius: 100,
    backgroundColor: Colors.emerald700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontFamily: 'IBM-Bold',
    fontSize: 9,
    color: Colors.rose300,
    position: 'absolute',
    top: 1,
    left: 10,
    zIndex: 1,
  },
})
