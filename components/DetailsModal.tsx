import { Colors } from '@/constants/Colors'
import useMyStore from '@/store/store'
import {
  StyleSheet,
  Text,
  View,
  Modal,
  Pressable,
  Platform,
  Alert,
  Image,
  ScrollView,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native'

import { XCircle, CirclePlus, MoveLeft } from 'lucide-react-native'
import {
  Person,
  personsToTags,
  tags,
  TPerson,
  TFollowUp,
  followUp,
} from '@/drizzle/schema'
import { Feather, FontAwesome5 } from '@expo/vector-icons'
import * as Linking from 'expo-linking'
import * as Haptics from 'expo-haptics'
import { useTranslations } from '@/app/_layout'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { db } from '@/drizzle/db'
import { eq } from 'drizzle-orm'
import { toast } from 'sonner-native'
import { useState } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker'
import { TextInput } from 'react-native-gesture-handler'
import { Controller, useForm } from 'react-hook-form'
import { format } from 'date-fns'

type props = {
  modalVisible: boolean
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const statusOptions: {
  type: TPerson['status']
  color: string
  label: string
}[] = [
  { type: 'irregular', label: 'hard to find', color: Colors.primary200 },
  { type: 'frequent', label: 'frequent visits', color: Colors.purple200 },
  { type: 'committed', label: 'established', color: Colors.purple400 },
]

const DetailsModal = ({ modalVisible, setModalVisible }: props) => {
  const selectedPerson = useMyStore((state) => state.selectedPerson)
  const [followUpDate, setFollowUpDate] = useState<Date>(new Date())
  const [editMode, setEditMode] = useState(false)
  const [followUpIdToEdit, setFollowUpIdToEdit] = useState<number>()
  const [pageView, setPageView] = useState<'profile' | 'followUp'>('profile')
  const {
    name,
    block,
    unit,
    remarks,
    id,
    category,
    status,
    contact,
    date,
    street,
    latitude,
    longitude,
    publications,
  } = selectedPerson

  const i18n = useTranslations()

  const queryClient = useQueryClient()

  const { data: tagsArr } = useQuery({
    queryKey: ['tags', id],
    queryFn: async () => {
      return await db
        .select({ tagName: tags.tagName })
        .from(personsToTags)
        .innerJoin(tags, eq(personsToTags.tagId, tags.id))
        .where(eq(personsToTags.personId, id))
    },
  })
  //   console.log('tags -->', tagsArr)
  const { data: followUpsArr } = useQuery({
    queryKey: ['followUps', id],
    queryFn: async () => {
      return await db.query.followUp.findMany({
        where: eq(followUp.personId, id),
      })
    },
  })
  console.log('followUpsArray --> ', followUpsArr)

  const sortedFollowUps = followUpsArr?.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
    setValue,
  } = useForm<TFollowUp>()

  const handleDeleteAlert = (personId: number) => {
    Alert.alert(
      i18n.t('records.deleteAlertTitle'),
      i18n.t('records.deleteAlertDesc'),
      [
        {
          text: i18n.t('records.confirm'),
          onPress: async () => {
            // First, delete associated records in the junction table
            await db
              .delete(personsToTags)
              .where(eq(personsToTags.personId, personId))
            // Then, delete the person
            await db.delete(Person).where(eq(Person.id, personId))
            queryClient.invalidateQueries({ queryKey: ['persons'] })
            toast.success(`${i18n.t('records.deleteToast')} 🗑️`)
            console.log('confirm delete')
            setModalVisible(false)
          },
          style: 'destructive',
        },
        {
          text: i18n.t('records.cancel'),
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
      ]
    )
  }

  // Function to open maps with navigation
  const openMapsForNavigation = async (latitude: number, longitude: number) => {
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
    })
    const latLng = `${latitude},${longitude}`
    const label = 'Selected Location'
    const url = Platform.select({
      ios: `${scheme}${latLng}?q=${label}@${latLng}`,
      android: `${scheme}${latLng}?q=${latLng}(${label})`,
    })

    Linking.canOpenURL(url!).then((supported) => {
      if (supported) {
        Linking.openURL(url!)
      } else {
        // Fallback to Google Maps web URL
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${latLng}`
        Linking.openURL(webUrl)
      }
    })
  }

  const handleCalling = async (phoneNumber: string) => {
    if (!phoneNumber) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    try {
      // Format the phone number (remove any non-numeric characters)
      const formattedNumber = phoneNumber.replace(/\D/g, '')
      const callUrl = `tel:${formattedNumber}`

      // Check if the device supports the tel URL scheme
      const supported = await Linking.canOpenURL(callUrl)
      if (supported) {
        await Linking.openURL(callUrl)
      } else {
        Alert.alert('Error', 'Phone calling is not supported on this device')
      }
    } catch (error) {
      console.error('Error making call:', error)
      Alert.alert('Error', 'Unable to make the phone call')
    }
  }

  const openWhatsApp = async (phoneNumber: string) => {
    if (!phoneNumber) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    try {
      // Format the phone number (remove any non-numeric characters)
      const formattedNumber = phoneNumber.replace(/\D/g, '')

      // Try the wa.me URL first as it's more reliable
      const url = `https://wa.me/${formattedNumber}`

      // Check if WhatsApp can handle the URL
      const supported = await Linking.canOpenURL(url)
      if (supported) {
        await Linking.openURL(url)
      } else {
        // Fallback to whatsapp:// scheme
        const fallbackUrl = `whatsapp://send?phone=${formattedNumber}`
        const fallbackSupported = await Linking.canOpenURL(fallbackUrl)
        if (fallbackSupported) {
          await Linking.openURL(fallbackUrl)
        } else {
          Alert.alert('Error', 'WhatsApp is not installed on this device')
        }
      }
    } catch (error) {
      console.log('Error opening WhatsApp:', error)
      Alert.alert('Error', 'Unable to open WhatsApp')
    }
  }

  const onSubmit = async (data: TFollowUp) => {
    const notesCheck = data['notes']
    if (!notesCheck) {
      setError('notes', { type: 'required', message: 'Notes cannot be empty' })
      return
    }
    try {
      if (!editMode) {
        await db.insert(followUp).values({
          personId: id,
          date: followUpDate,
          notes: notesCheck,
        })
        toast.success('Follow-up added successfully! ✅')
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      } else if (followUpIdToEdit !== undefined) {
        await db
          .update(followUp)
          .set({
            date: followUpDate,
            notes: notesCheck,
          })
          .where(eq(followUp.id, followUpIdToEdit))
        toast.success('Follow-up updated successfully! ✅')

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      } else {
        toast.error('Error: No follow-up selected for editing')
      }
      reset()
      queryClient.invalidateQueries({
        queryKey: ['followUps', selectedPerson.id],
      })
      setPageView('profile')
    } catch (error) {
      console.error('Failed to insert follow-up:', error)
      toast.error('Failed to add follow-up. Please try again.')
    }
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      //   onRequestClose={() => {
      //     setModalVisible(false)
      //   }}
    >
      <View style={styles.fullPage}>
        <Pressable
          // onPress={() => setModalVisible(false)}
          style={styles.overlay}
        />
        {pageView === 'profile' && (
          <View style={styles.cardContainer}>
            <View style={styles.topBar}>
              <View style={styles.btnGroup}>
                <Pressable style={styles.menuBtn}>
                  <Text style={styles.menuTxt}>Edit</Text>
                </Pressable>
                <Pressable style={styles.menuBtn}>
                  <Text style={styles.menuTxt}>Share</Text>
                </Pressable>
                <Pressable
                  style={styles.menuBtn}
                  onPress={() => handleDeleteAlert(id)}
                >
                  <Text style={styles.menuTxt}>Delete</Text>
                </Pressable>
                <Pressable
                  style={styles.menuBtn}
                  onPress={() => {
                    reset()
                    setPageView('followUp')
                  }}
                >
                  <CirclePlus
                    color={Colors.primary50}
                    size={18}
                    strokeWidth={1.5}
                  />
                  <Text style={styles.menuTxt}>Follow-up</Text>
                </Pressable>
              </View>
              <Pressable
                onPress={() => {
                  setModalVisible(false)
                }}
              >
                <XCircle color={Colors.primary50} size={26} strokeWidth={2} />
              </Pressable>
            </View>
            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.contentContainer}>
                <View style={styles.nameContainer}>
                  <Text style={styles.nameTitle}>
                    {name?.length! > 18 ? name?.slice(0, 22) + '..' : name}
                  </Text>
                  <View
                    style={[
                      styles.categoryCircle,
                      {
                        backgroundColor: `${
                          category === 'RV'
                            ? Colors.emerald600
                            : category === 'BS'
                            ? Colors.emerald900
                            : Colors.emerald400
                        }`,
                      },
                    ]}
                  >
                    <Text style={styles.categoryText}>{category}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBox,
                      {
                        backgroundColor: `${
                          statusOptions.find((option) => option.type === status)
                            ?.color
                        }`,
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {
                        statusOptions.find((option) => option.type === status)
                          ?.label
                      }
                    </Text>
                  </View>
                </View>
                {tagsArr && (
                  <FlatList
                    style={styles.tagContainer}
                    horizontal
                    showsHorizontalScrollIndicator={true}
                    data={tagsArr}
                    renderItem={({ item }) => (
                      <View style={styles.tagBox}>
                        <Text style={styles.tagText}>{item.tagName}</Text>
                      </View>
                    )}
                    //   keyExtractor={(item, index) => index.toString()}
                  />
                )}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'baseline',
                    justifyContent: 'flex-start',
                    gap: 6,
                    marginBottom: 3,
                  }}
                >
                  <Text style={styles.addressTxt}>
                    {block ? 'Apt.' + block : ''}
                  </Text>
                  <Text style={styles.addressTxt}>#{unit}</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <Text style={styles.addressTxt}>
                      {street?.length! > 25
                        ? street?.slice(0, 20) + '...'
                        : street}
                    </Text>
                    <Pressable
                      onPress={() => {
                        openMapsForNavigation(latitude!, longitude!)
                      }}
                    >
                      <FontAwesome5
                        name="car-alt"
                        size={22}
                        color={Colors.emerald200}
                      />
                    </Pressable>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 15,
                    marginBottom: 5,
                  }}
                >
                  <Text style={styles.contactText}>
                    {`${i18n.t('records.contact')}: ${contact}`}
                  </Text>
                  {contact && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <Pressable onPress={() => handleCalling(contact ?? '')}>
                        <Feather name="phone-call" size={20} color="white" />
                      </Pressable>
                      <Pressable onPress={() => openWhatsApp(contact ?? '')}>
                        <Image
                          source={require('@/assets/images/whatsapp-logo.png')}
                          style={styles.whatsAppImage}
                        />
                      </Pressable>
                    </View>
                  )}
                </View>
                <Text style={styles.dateText}>initial visit: {date}</Text>
                {publications && (
                  <Text style={styles.publicationsText}>{publications}</Text>
                )}
                <View style={styles.remarksBox}>
                  <Text style={styles.remarksText}>{remarks}</Text>
                </View>
                {followUpsArr?.length! > 0 && (
                  <View>
                    <Text
                      style={[
                        styles.labelText,
                        { paddingLeft: 2, color: Colors.emerald400 },
                      ]}
                    >
                      follow ups
                    </Text>
                    {sortedFollowUps?.map((followUp) => (
                      <Pressable
                        key={followUp.id}
                        style={[styles.remarksBox, { marginBottom: 0 }]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                          setEditMode(true)
                          setFollowUpIdToEdit(followUp.id)
                          setValue('notes', followUp.notes)
                          setFollowUpDate(followUp.date)
                          setPageView('followUp')
                        }}
                      >
                        <Text
                          style={{
                            color: Colors.primary400,
                            fontFamily: 'IBM-Regular',
                            fontSize: 13,
                            marginBottom: 3,
                          }}
                        >
                          {format(new Date(followUp.date), 'dd MMM yyyy')}
                        </Text>
                        <Text style={styles.remarksText}>{followUp.notes}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        )}
        {pageView === 'followUp' && (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 20}
            style={{ flex: 1, width: '100%', justifyContent: 'flex-end' }}
            enabled
          >
            <Pressable
              style={[
                styles.cardContainer2,
                { marginBottom: Platform.OS === 'ios' ? 0 : 20 },
              ]}
            >
              <View style={styles.topBar}>
                <Pressable
                  onPress={() => {
                    reset()
                    setPageView('profile')
                  }}
                  style={{ paddingLeft: 3 }}
                >
                  <MoveLeft
                    color={Colors.primary50}
                    size={28}
                    strokeWidth={2.5}
                  />
                </Pressable>
                <Text
                  style={{
                    fontFamily: 'IBM-Bold',
                    fontSize: 14,
                    color: Colors.emerald300,
                  }}
                >
                  following up on {name}
                </Text>
              </View>
              <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
                keyboardShouldPersistTaps="handled"
              >
                <View style={[styles.contentContainer, { paddingVertical: 0 }]}>
                  <View style={{ position: 'relative' }}>
                    {errors['notes'] && (
                      <Text style={styles.errorText}>
                        {errors['notes']?.message?.toString()}
                      </Text>
                    )}
                    <Controller
                      control={control}
                      name="notes"
                      render={({ field: { value, onChange, onBlur } }) => (
                        <TextInput
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="follow up notes"
                          multiline={true}
                          textAlignVertical="top"
                          autoComplete="name"
                          autoCorrect={true}
                          autoCapitalize="sentences"
                          autoFocus={true}
                          style={{
                            width: '100%',
                            height: 100,
                            backgroundColor: Colors.primary700,
                            padding: 10,
                            borderRadius: 10,
                            marginVertical: 15,
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
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-around',
                    }}
                  >
                    <View style={styles.dateContainer}>
                      <Text style={styles.labelText}>Date</Text>
                      <Pressable onPress={(e) => e.stopPropagation()}>
                        <DateTimePicker
                          mode="date"
                          display="compact"
                          value={followUpDate}
                          // is24Hour={false}
                          onChange={(event, selectedDate) =>
                            setFollowUpDate(selectedDate || new Date())
                          }
                          accentColor={Colors.emerald500}
                          textColor={Colors.white}
                          themeVariant="dark"
                        />
                      </Pressable>
                    </View>
                    <Pressable
                      style={styles.submitBtn}
                      onPress={handleSubmit(onSubmit)}
                    >
                      <Text style={styles.submitTxt}>
                        {editMode ? 'Update Follow Up' : 'Submit Follow Up'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </ScrollView>
            </Pressable>
          </KeyboardAvoidingView>
        )}
      </View>
    </Modal>
  )
}
export default DetailsModal

const styles = StyleSheet.create({
  fullPage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
    // backgroundColor: 'rgba(0,0,0,0.4)',
  },
  cardContainer: {
    width: '96%',
    marginBottom: 100,
    marginHorizontal: 'auto',
    borderRadius: 20,
    backgroundColor: Colors.primary950,
    height: '50%',
    overflow: 'hidden',
  },
  cardContainer2: {
    width: '96%',
    marginBottom: 100,
    marginHorizontal: 'auto',
    borderRadius: 20,
    backgroundColor: Colors.primary950,
    flex: 1,
    overflow: 'hidden',
  },
  scrollContainer: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary950,
    paddingHorizontal: 12,
    paddingVertical: 15,
  },
  btnGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  menuBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: Colors.primary800,
  },
  menuTxt: {
    fontFamily: 'IBM-Bold',
    fontSize: 14,
    color: Colors.primary50,
  },
  contentContainer: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  nameTitle: {
    fontFamily: 'IBM-Bold',
    fontSize: 18,
    color: Colors.primary50,
  },
  categoryCircle: {
    width: 30,
    height: 30,
    borderRadius: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  categoryText: {
    fontFamily: 'IBM-Bold',
    fontSize: 14,
    color: Colors.white,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderRadius: 5,
  },
  statusText: {
    fontFamily: 'IBM-SemiBold',
    fontSize: 13,
    color: Colors.primary900,
  },
  addressTxt: {
    fontFamily: 'IBM-Bold',
    fontSize: 16,
    color: Colors.emerald400,
  },
  whatsAppImage: {
    width: 40,
    aspectRatio: 'auto',
    height: 40,
  },
  contactText: {
    fontFamily: 'IBM-Bold',
    fontSize: 16,
    color: Colors.emerald400,
  },
  dateText: {
    fontFamily: 'IBM-Bold',
    fontSize: 16,
    color: Colors.primary300,
  },
  publicationsText: {
    fontFamily: 'IBM-SemiBoldItalic',
    fontSize: 18,
    color: Colors.lemon100,
    marginTop: 5,
  },
  remarksBox: {
    padding: 12,
    paddingBottom: 15,
    backgroundColor: Colors.primary800,
    borderRadius: 5,
    marginVertical: 10,
  },
  remarksText: {
    fontFamily: 'IBM-Regular',
    fontSize: 15,
    color: Colors.primary50,
  },
  tagContainer: {
    marginBottom: 10,
  },
  tagBox: {
    padding: 5,
    borderRadius: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.primary300,
    marginRight: 8,
  },
  tagText: {
    fontFamily: 'IBM-Medium',
    fontSize: 12,
    color: Colors.primary300,
  },
  labelText: {
    fontFamily: 'IBM-Medium',
    fontSize: 14,
    color: Colors.primary300,
    paddingLeft: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
  },
  submitBtn: {
    padding: 8,
    backgroundColor: Colors.emerald500,
    borderRadius: 5,
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
    bottom: 20,
    left: 10,
    zIndex: 1,
  },
})
