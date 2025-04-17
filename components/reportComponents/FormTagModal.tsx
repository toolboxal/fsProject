import { Colors } from '@/constants/Colors'
import { XCircle } from 'lucide-react-native'
import { Controller, useForm } from 'react-hook-form'
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  Pressable,
} from 'react-native'
import { tags, TTags } from '@/drizzle/schema'
import { db } from '@/drizzle/db'
import { toast } from 'sonner-native'
import * as Haptics from 'expo-haptics'
import { useQueryClient } from '@tanstack/react-query'
import { eq } from 'drizzle-orm'
import { useTranslations } from '@/app/_layout'

type props = {
  openTagModal: boolean
  setOpenTagModal: React.Dispatch<React.SetStateAction<boolean>>
  setSelectedTags: React.Dispatch<React.SetStateAction<number[]>>
}

const FormTagModal = ({
  openTagModal,
  setOpenTagModal,
  setSelectedTags,
}: props) => {
  const i18n = useTranslations()
  const queryClient = useQueryClient()
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<TTags>()

  const onSubmit = async (data: TTags) => {
    const notesCheck = data['tagName']
    if (!notesCheck) {
      setError('tagName', {
        type: 'required',
        message: 'Field cannot be empty',
      })
      return
    } else if (notesCheck.length > 21) {
      setError('tagName', {
        type: 'tooLong',
        message: 'Tag name cannot exceed 20 characters',
      })
      return
    }
    const formattedTag = data.tagName.trim().toLowerCase()

    try {
      // Check if tag already exists
      const existingTag = await db
        .select({ id: tags.id })
        .from(tags)
        .where(eq(tags.tagName, formattedTag))
        .limit(1)

      if (existingTag.length > 0) {
        setError('tagName', {
          type: 'duplicate',
          message: 'Tag already exists',
        })
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        return
      }

      const newTag = await db
        .insert(tags)
        .values({
          tagName: formattedTag,
        })
        .returning({ id: tags.id })
      setSelectedTags((prev) => {
        return [...prev, newTag[0].id]
      })
      toast.success('Tag added successfully! ✅')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['persons'] })
      reset()
      setOpenTagModal(false)
      // You can use newTag[0].id to access the ID of the newly created tag
    } catch (error) {
      console.error('Failed to add tag:', error)
      toast.error('Failed to add tag. Please try again.')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }

  return (
    <Modal animationType="fade" transparent={true} visible={openTagModal}>
      <View style={styles.fullPage}>
        <View style={styles.cardContainer}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.title}>{i18n.t('tagModal.title')}</Text>
            <Pressable
              onPress={() => {
                reset()
                setOpenTagModal(false)
              }}
            >
              <XCircle color={Colors.primary50} size={25} strokeWidth={1.2} />
            </Pressable>
          </View>
          <View style={{ position: 'relative' }}>
            {errors['tagName'] && (
              <Text style={styles.errorText}>
                {errors['tagName']?.message?.toString()}
              </Text>
            )}
            <Controller
              control={control}
              name="tagName"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="tag name"
                  textAlignVertical="top"
                  autoComplete="name"
                  autoCorrect={true}
                  autoCapitalize="sentences"
                  autoFocus={true}
                  style={{
                    width: '100%',
                    height: 'auto',
                    backgroundColor: Colors.primary700,
                    padding: 10,
                    borderRadius: 5,
                    marginVertical: 15,
                    marginBottom: 25,
                    fontFamily: 'IBM-Regular',
                    fontSize: 16,
                    color: Colors.primary50,
                    borderWidth: 1,
                    borderColor: Colors.primary400,
                  }}
                />
              )}
            />
          </View>
          <Pressable style={styles.submitBtn} onPress={handleSubmit(onSubmit)}>
            <Text style={styles.submitTxt}>{i18n.t('tagModal.btnText')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

export default FormTagModal

const styles = StyleSheet.create({
  fullPage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  cardContainer: {
    width: '96%',
    marginHorizontal: 'auto',
    borderRadius: 20,
    backgroundColor: Colors.primary950,
    flexDirection: 'column',
    overflow: 'hidden',
    padding: 12,
    paddingVertical: 18,
  },
  title: {
    fontFamily: 'IBM-SemiBold',
    fontSize: 16,
    color: Colors.primary50,
  },
  submitBtn: {
    padding: 10,
    backgroundColor: Colors.emerald700,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'auto',
  },
  submitTxt: {
    fontFamily: 'IBM-Bold',
    fontSize: 15,
    color: Colors.white,
  },
  errorText: {
    fontFamily: 'IBM-Bold',
    fontSize: 12,
    color: Colors.rose300,
    position: 'absolute',
    bottom: 5,
    left: 5,
    zIndex: 1,
  },
})
