import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Pressable,
  FlatList,
} from 'react-native'
import { router } from 'expo-router'
import * as Location from 'expo-location'
import { useForm, Controller } from 'react-hook-form'
import { Colors } from '@/constants/Colors'
import { useEffect, useState } from 'react'
import * as Haptics from 'expo-haptics'
import TextInputComponent from './TextInputComponent'
import FontAwesome from '@expo/vector-icons/FontAwesome6'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import useMyStore from '@/store/store'
import getTimeDate from '../utils/getTimeDate'
import { toast } from 'sonner-native'
import { db } from '@/drizzle/db'
import { Person, TPerson, personsToTags } from '@/drizzle/schema'
import WebView from 'react-native-webview'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from '@/app/_layout'
import { CirclePlusIcon } from 'lucide-react-native'
import FormTagModal from './reportComponents/FormTagModal'

type TFormData = Omit<
  TPerson,
  'id' | 'category' | 'latitude' | 'longitude' | 'status'
>

const statusOptions: {
  type: TPerson['status']
  color: string
  label: string
}[] = [
  { type: 'irregular', label: 'hard to find', color: Colors.primary200 },
  { type: 'frequent', label: 'frequent visits', color: Colors.purple200 },
  { type: 'committed', label: 'established', color: Colors.purple400 },
]

const Form = () => {
  const queryClient = useQueryClient()
  const [category, setCategory] = useState('RV')
  const [status, setStatus] = useState<TPerson['status']>('frequent')
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [openTagModal, setOpenTagModal] = useState(false)
  const geoCoords = useMyStore((state) => state.geoCoords)
  const setGeoCoords = useMyStore((state) => state.setGeoCoords)
  const address = useMyStore((state) => state.address)
  const lang = useMyStore((state) => state.language)
  let { latitude, longitude } = geoCoords

  const [updatedLat, setUpdatedLat] = useState(latitude)
  const [updatedLng, setUpdatedLng] = useState(longitude)

  const { todayDate } = getTimeDate()

  const i18n = useTranslations()

  const { street, streetNumber } = address
  const displayBlock = streetNumber?.split(' ')[1]

  useEffect(() => {
    setValue('block', displayBlock || '')
    setValue('street', street || '')
    setValue('date', todayDate)
  }, [address])

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

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      return await db.query.tags.findMany()
    },
  })
  console.log('tags -->', tags)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      block: '',
      unit: '',
      street: '',
      name: '',
      contact: '',
      date: '',
      remarks: '',
      publications: '',
    },
  })

  const submitPressed = async (data: TFormData) => {
    console.log('pressed')
    const nameCheck = data['name']
    if (nameCheck === '' || nameCheck === null) {
      setError('name', { type: 'min', message: 'cannot be empty' })
      return
    } else if (nameCheck.length > 25) {
      setError('name', { type: 'max', message: 'exceed 25 characters' })
      return
    }
    const toUpperBlock = data.block === null ? '' : data.block.toUpperCase()
    const { name, unit, street, remarks, contact, date, publications } = data

    // Insert the new person record and get its ID
    const newPerson = await db
      .insert(Person)
      .values({
        name: name,
        unit: unit,
        street: street,
        remarks: remarks,
        contact: contact,
        block: toUpperBlock,
        date: date,
        latitude: updatedLat,
        longitude: updatedLng,
        category: category,
        publications: publications,
        status: status,
      })
      .returning({ id: Person.id })

    const personId = newPerson[0].id

    // Insert associations for selected tags
    if (selectedTags.length > 0) {
      const tagAssociations = selectedTags.map((tagId) => ({
        personId: personId,
        tagId: tagId,
      }))
      await db.insert(personsToTags).values(tagAssociations)
    }

    queryClient.invalidateQueries({ queryKey: ['persons'] })
    console.log('submitted new user with tags')
    reset()

    toast.success(
      lang === 'en'
        ? `Record ${name} has been created 👍`
        : i18n.t('form.toastSuccess')
    )
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    router.replace('/recordsPage')
  }

  const handleNewAddress = async () => {
    try {
      const [block, unit, street] = getValues(['block', 'unit', 'street'])
      console.log(block, unit, street)
      const addressString = block ? `${block} ${street}` : `${unit} ${street}`
      const newGeoCode = await Location.geocodeAsync(addressString)
      const lat = newGeoCode[0].latitude
      const lng = newGeoCode[0].longitude
      // setGeoCoords({ latitude: lat, longitude: lng })
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
  // console.log('category-->', category)
  // console.log('interest-->', status)
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.primary50,
      }}
    >
      <ScrollView style={styles.scrollViewContainer}>
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
                extraStyles={{ width: 110 }}
                // autoFocus={true}
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
                extraStyles={{ width: 110 }}
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
                lineHeight: 18,
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
              extraStyles={{ width: '100%' }}
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
                  extraStyles={{ width: 175 }}
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
                extraStyles={{ width: 140 }}
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
                extraStyles={{ width: 130 }}
              />
            )}
          />
        </View>

        <Text style={styles.label}>tags</Text>
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
              style={{ color: Colors.primary600, fontFamily: 'IBM-Regular' }}
            >
              add your first tag
            </Text>
          ) : (
            <FlatList
              style={{
                padding: 3,
                borderRadius: 10,
              }}
              horizontal
              showsHorizontalScrollIndicator={true}
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
            <Text style={styles.label}>contactable</Text>
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
            <Text style={styles.label}>category</Text>
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
          <FontAwesome name="check" size={22} color={Colors.white} />
          <Text style={styles.buttonText}>{i18n.t('form.saveLabel')}</Text>
        </TouchableOpacity>
      </ScrollView>
      <FormTagModal
        openTagModal={openTagModal}
        setOpenTagModal={setOpenTagModal}
        setSelectedTags={setSelectedTags}
      />
    </View>
  )
}
export default Form

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
    paddingHorizontal: 18,
  },
  apartmentBtnsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 13,
    gap: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 7,
    elevation: 5,
    backgroundColor: Colors.primary50,
  },
  twoColumnsContainer: {
    flexDirection: 'row',
    // gap: 20,
    justifyContent: 'space-between',
    marginVertical: 7,
    width: '100%',
    alignItems: 'flex-end',
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
  categoryOptionText: { fontFamily: 'IBM-Medium', fontSize: 14 },
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
