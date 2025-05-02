import { Colors } from '@/constants/Colors'
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Pressable,
  FlatList,
} from 'react-native'
import * as Location from 'expo-location'
import useMyStore from '@/store/store'
import { useForm, Controller } from 'react-hook-form'
import TextInputComponent from '@/components/TextInputComponent'
import { useState, useEffect } from 'react'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import { router } from 'expo-router'

import { toast } from 'sonner-native'
import * as Haptics from 'expo-haptics'

import { db } from '@/drizzle/db'
import {
  Person,
  personsToTags,
  TPerson,
  TPersonsToTags,
  TTags,
} from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import { SegmentedButtons } from 'react-native-paper'
import WebView from 'react-native-webview'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from '@/app/_layout'
import { CirclePlusIcon } from 'lucide-react-native'
import FormTagModal from '@/components/reportComponents/FormTagModal'
import { usePostHog } from 'posthog-react-native'

type TFormData = Omit<
  TPerson,
  'id' | 'category' | 'latitude' | 'longitude' | 'interest' | 'status'
>

const EditPage = () => {
  const queryClient = useQueryClient()

  const selectedPerson = useMyStore((state) => state.selectedPerson)
  const [category, setCategory] = useState(selectedPerson.category!)
  const [status, setStatus] = useState<TPerson['status']>(
    selectedPerson.status || 'frequent'
  )

  const [openTagModal, setOpenTagModal] = useState(false)

  const [updatedLat, setUpdatedLat] = useState(selectedPerson.latitude)
  const [updatedLng, setUpdatedLng] = useState(selectedPerson.longitude)
  const postHog = usePostHog()

  const i18n = useTranslations()

  const { data: personsTag } = useQuery({
    queryKey: ['tags', selectedPerson.id],
    queryFn: async () => {
      return await db.query.personsToTags.findMany({
        where: (personsToTags, { eq }) =>
          eq(personsToTags.personId, selectedPerson.id),
        columns: {
          tagId: true,
        },
      })
    },
  })
  const [selectedTags, setSelectedTags] = useState<number[]>([])

  useEffect(() => {
    if (personsTag) {
      setSelectedTags(personsTag.map((tag) => tag.tagId))
    }
  }, [personsTag])

  // console.log('selectedTags', selectedTags)

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      return await db.query.tags.findMany()
    },
  })

  const statusOptions: {
    type: TPerson['status']
    color: string
    label: string
  }[] = [
    {
      type: 'irregular',
      label: i18n.t('statusOptions.labelIrregular'),
      color: Colors.sky200,
    },
    {
      type: 'frequent',
      label: i18n.t('statusOptions.labelFrequent'),
      color: Colors.purple100,
    },
    {
      type: 'committed',
      label: i18n.t('statusOptions.labelCommitted'),
      color: Colors.purple300,
    },
  ]

  const categoryOptions = [
    {
      color: Colors.emerald400,
      value: 'CA',
      label: i18n.t('form.callAgain'),
    },
    {
      color: Colors.emerald600,
      value: 'RV',
      label: i18n.t('form.returnVisit'),
    },
    {
      color: Colors.emerald900,
      value: 'BS',
      label: i18n.t('form.bibleStudy'),
    },
  ]

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      block: selectedPerson.block || '',
      unit: selectedPerson.unit || '',
      street: selectedPerson.street || '',
      name: selectedPerson.name || '',
      contact: selectedPerson.contact || '',
      date: selectedPerson.date || '',
      remarks: selectedPerson.remarks || '',
      publications: selectedPerson.publications || '',
    },
  })

  const submitPressed = async (data: TFormData) => {
    const nameCheck = data['name']
    if (nameCheck === '' || nameCheck === null) {
      setError('name', { type: 'min', message: 'cannot be empty' })
      return
    } else if (nameCheck.length > 25) {
      setError('name', { type: 'max', message: 'exceed 25 characters' })
      return
    }

    const { name, contact, remarks, date, block, unit, street, publications } =
      data
    const toUpperBlock = block === null ? '' : block.toUpperCase()
    await db
      .update(Person)
      .set({
        block: toUpperBlock,
        unit: unit,
        street: street,
        name: name,
        contact: contact,
        remarks: remarks,
        date: date,
        category: category,
        latitude: updatedLat,
        longitude: updatedLng,
        publications: publications,
        status: status,
      })
      .where(eq(Person.id, selectedPerson.id))

    // Update associations for selected tags
    if (selectedTags.length > 0) {
      // First, delete existing associations for this person
      await db
        .delete(personsToTags)
        .where(eq(personsToTags.personId, selectedPerson.id))

      // Then, insert new associations based on selectedTags
      const tagAssociations = selectedTags.map((tagId) => ({
        personId: selectedPerson.id,
        tagId: tagId,
      }))
      await db.insert(personsToTags).values(tagAssociations)
    } else {
      // If no tags are selected, delete all associations for this person
      await db
        .delete(personsToTags)
        .where(eq(personsToTags.personId, selectedPerson.id))
    }

    queryClient.invalidateQueries({ queryKey: ['persons'] })
    queryClient.invalidateQueries({ queryKey: ['tags', selectedPerson.id] })
    console.log('edit done')
    reset()
    toast.success(i18n.t('editForm.toastSuccess'))
    postHog.capture('record_edited')
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    router.back()
  }

  const handleNewAddress = async () => {
    try {
      const [block, unit, street] = getValues(['block', 'unit', 'street'])
      console.log(block, unit, street)
      const addressString = block ? `${block} ${street}` : `${unit} ${street}`
      const newGeoCode = await Location.geocodeAsync(addressString)
      const lat = newGeoCode[0].latitude
      const lng = newGeoCode[0].longitude
      setUpdatedLat(lat)
      setUpdatedLng(lng)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch (error) {
      Alert.alert("This address doesn't exist")
    }
  }

  const htmlContent = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leaflet Map</title>
   <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css" />
    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
    <script src="https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js"></script>

    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <style>
        body, html, #map { height: 100%; margin: 0; padding: 0; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        (function() {
            const map = L.map('map',{zoomControl:false}).setView([${updatedLat}, ${updatedLng}], 18);
            
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

           
            const currentLocIcon = L.divIcon({
            className: 'custom-div-icon',
            html: "<span class='material-icons' style='font-size:35px;color:#5d3ff4;'>location_on</span>",
            iconSize: [10, 10],
            iconAnchor: null,
            popupAnchor: [0,-20]
            });

            L.marker([${updatedLat}, ${updatedLng}], {icon:currentLocIcon}).addTo(map)
                

        })();
    </script>
</body>
</html>
  `

  // console.log('edit Page', selectedPerson)

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{
          flex: 1,
          backgroundColor: Colors.primary50,
        }}
      > */}
      <StatusBar barStyle={'dark-content'} />

      <View
        style={{
          flex: 1,
          backgroundColor: Colors.primary50,
          // paddingTop: 20,
        }}
      >
        <ScrollView
          style={styles.scrollViewContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.twoColumnsContainer}>
            <Controller
              control={control}
              name="unit"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInputComponent
                  value={value.toUpperCase()}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  label={i18n.t('form.houseLabel')}
                  placeholderText="unit"
                  extraStyles={{
                    width: 110,
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="block"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInputComponent
                  value={value.toUpperCase()}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  label={i18n.t('form.aptLabel')}
                  placeholderText="blk no."
                  extraStyles={{
                    width: 110,
                  }}
                />
              )}
            />

            <TouchableOpacity
              activeOpacity={0.8}
              style={{
                padding: 6,
                paddingHorizontal: 10,
                backgroundColor: Colors.primary900,
                borderRadius: 8,
                alignSelf: 'flex-end',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                shadowColor: '#000',
                shadowOffset: { width: 2, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
                elevation: 5,
                minWidth: 80,
              }}
              onPress={handleNewAddress}
            >
              <FontAwesome6
                name="location-arrow"
                size={20}
                color={Colors.primary100}
              />
              <Text
                style={{
                  fontFamily: 'IBM-SemiBold',
                  fontSize: 14,
                  color: Colors.primary100,
                  textAlign: 'center',
                }}
              >
                {i18n.t('form.updateMapLabel')}
              </Text>
            </TouchableOpacity>
          </View>
          <Controller
            control={control}
            name="street"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInputComponent
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                label={i18n.t('form.streetLabel')}
                placeholderText="kingdom ave."
                extraStyles={{
                  width: '100%',
                }}
              />
            )}
          />
          <View
            style={{
              height: 250,
              marginTop: 20,
              borderRadius: 10,
              overflow: 'hidden',
              pointerEvents: 'none',
            }}
          >
            <WebView
              style={{ height: '100%' }}
              originWhitelist={['*']}
              source={{ html: htmlContent }}
              startInLoadingState
              renderLoading={() => (
                <View style={{ height: '100%' }}>
                  <ActivityIndicator
                    size={'small'}
                    color={Colors.emerald500}
                    style={{ height: '100%' }}
                  />
                </View>
              )}
            />
          </View>
          <View style={styles.twoColumnsContainer}>
            <View style={{ flexDirection: 'column', gap: 1 }}>
              <Controller
                control={control}
                name="name"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInputComponent
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    label={i18n.t('form.nameLabel')}
                    placeholderText="nicodemus"
                    extraStyles={{
                      width: 175,
                    }}
                  />
                )}
              />
              {errors['name'] && (
                <Text style={styles.errorText}>
                  {errors['name']?.message?.toString()}
                </Text>
              )}
            </View>
            <Controller
              control={control}
              name="contact"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInputComponent
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  label={i18n.t('form.contactLabel')}
                  placeholderText="hp no."
                  extraStyles={{
                    width: 140,
                  }}
                />
              )}
            />
          </View>
          <Controller
            control={control}
            name="publications"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInputComponent
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                label={i18n.t('form.pubLabel')}
                placeholderText="stopped at lff lesson3 pt5"
                extraStyles={{ width: '100%' }}
              />
            )}
          />
          <Controller
            control={control}
            name="remarks"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInputComponent
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                label={i18n.t('form.remarksLabel')}
                placeholderText="....."
                extraStyles={{
                  width: '100%',
                  height: 140,
                }}
                multiline={true}
              />
            )}
          />
          <View style={styles.twoColumnsContainer}>
            <Controller
              control={control}
              name="date"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInputComponent
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  label={i18n.t('form.dateLabel')}
                  placeholderText=""
                  extraStyles={{
                    width: 130,
                  }}
                />
              )}
            />
          </View>

          <Text style={styles.label}>{i18n.t('form.labelTags')}</Text>
          <View
            style={{
              flexDirection: 'row',
              gap: 6,
              alignItems: 'center',
              marginBottom: 7,
              // backgroundColor: 'green',
            }}
          >
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setOpenTagModal(true)
                postHog.capture('create_tag')
              }}
            >
              <CirclePlusIcon
                size={30}
                color={Colors.primary700}
                strokeWidth={1}
              />
            </Pressable>
            {tags?.length === 0 ? (
              <Text
                style={{
                  color: Colors.primary600,
                  fontFamily: 'IBM-Regular',
                }}
              >
                {i18n.t('form.noTagText')}
              </Text>
            ) : (
              <FlatList
                style={{
                  padding: 3,
                  borderRadius: 10,
                }}
                horizontal
                showsHorizontalScrollIndicator={false}
                data={tags}
                renderItem={({ item }) => (
                  <Pressable
                    key={item.id}
                    style={[
                      styles.tag,
                      selectedTags.includes(item.id) && {
                        backgroundColor: Colors.emerald600,
                        borderColor: Colors.emerald600,
                      },
                    ]}
                    onPress={() => {
                      setSelectedTags((prev) => {
                        if (prev.includes(item.id)) {
                          return prev.filter((id) => id !== item.id)
                        } else {
                          return [...prev, item.id]
                        }
                      })
                    }}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        selectedTags.includes(item.id) && {
                          color: Colors.white,
                        },
                      ]}
                    >
                      {item.tagName}
                    </Text>
                  </Pressable>
                )}
              />
            )}
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flexDirection: 'column', flex: 5 }}>
              <Text style={styles.label}>
                {i18n.t('form.labelContactable')}
              </Text>
              <View style={{ flexDirection: 'column', gap: 5 }}>
                {statusOptions.map((option) => (
                  <Pressable
                    key={option.type}
                    style={[
                      styles.optionBox,
                      option.type === status && {
                        borderColor: option.color,
                        backgroundColor: `${option.color}`,
                      },
                    ]}
                    onPress={() => setStatus(option.type)}
                  >
                    <Text style={[styles.categoryOptionText]}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={{ flexDirection: 'column', flex: 4 }}>
              <Text style={styles.label}>{i18n.t('form.labelCategory')}</Text>
              <View style={{ flexDirection: 'column', gap: 5 }}>
                {categoryOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.optionBox,
                      category === option.value && {
                        borderColor: option.color,
                        backgroundColor: `${option.color}`,
                      },
                    ]}
                    onPress={() => setCategory(option.value)}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        category === option.value && { color: Colors.white },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={handleSubmit(submitPressed)}
            activeOpacity={0.8}
          >
            <FontAwesome6 name="pen-to-square" size={22} color={Colors.white} />
            <Text style={styles.buttonText}>
              {i18n.t('editForm.saveLabel')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
        <FormTagModal
          openTagModal={openTagModal}
          setOpenTagModal={setOpenTagModal}
          setSelectedTags={setSelectedTags}
        />
      </View>
      {/* </KeyboardAvoidingView> */}
    </SafeAreaView>
  )
}
export default EditPage

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
    paddingHorizontal: 18,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    paddingHorizontal: 15,
    backgroundColor: Colors.primary50,
  },
  twoColumnsContainer: {
    flexDirection: 'row',
    // gap: 20,
    justifyContent: 'space-between',
    marginVertical: 7,
    width: '100%',
    // borderWidth: 1,
    // borderColor: 'red',
  },
  buttonStyle: {
    width: '100%',
    padding: 15,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    marginTop: 18,
    marginBottom: 130,
    backgroundColor: Colors.primary900,
  },
  buttonText: {
    fontFamily: 'IBM-SemiBold',
    fontSize: 18,
    color: Colors.white,
  },
  errorText: {
    fontFamily: 'IBM-Medium',
    fontSize: 13,
    color: Colors.rose500,
    position: 'absolute',
    top: 2,
    left: 50,
  },
  label: {
    fontFamily: 'IBM-Regular',
    color: Colors.primary900,
    paddingLeft: 3,
    fontSize: 16,
    marginBottom: 3,
  },
  interestOption: {
    padding: 11,
    borderWidth: 1,
    borderColor: Colors.primary200,
    backgroundColor: Colors.primary100,
    borderRadius: 3,
  },
  categoryOption: {
    padding: 11,
    borderWidth: 1,
    borderColor: Colors.primary200,
    backgroundColor: Colors.primary100,
    borderRadius: 3,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  categoryOptionText: { fontFamily: 'IBM-Medium', fontSize: 14 },
  optionBox: {
    padding: 11,
    borderWidth: 1,
    borderColor: Colors.primary200,
    backgroundColor: Colors.primary100,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tag: {
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 3,
    minWidth: 80,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.primary400,
  },
  tagText: {
    fontFamily: 'IBM-Regular',
    fontSize: 13,
    color: Colors.primary900,
  },
})
