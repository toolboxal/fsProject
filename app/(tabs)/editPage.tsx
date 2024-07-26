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
} from 'react-native'
import useMyStore from '@/store/store'
import { useForm, Controller } from 'react-hook-form'
import TextInputComponent from '@/components/TextInputComponent'
import CustomRadioButtons from '@/components/CustomRadioButton'
import { useState } from 'react'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import { router } from 'expo-router'
import Toast from 'react-native-root-toast'

import { db } from '@/drizzle/db'
import { Person, TPerson } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

type TFormData = Omit<
  TPerson,
  | 'id'
  | 'isPrivate'
  | 'latitude'
  | 'longitude'
  | 'block'
  | 'unit'
  | 'street'
  | 'category'
>

const EditPage = () => {
  const selectedPerson = useMyStore((state) => state.selectedPerson)
  const [category, setCategory] = useState(selectedPerson.category!)

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: selectedPerson.name || '',
      contact: selectedPerson.contact || '',
      date: selectedPerson.date || '',
      remarks: selectedPerson.remarks || '',
    },
  })

  const showToast = (name?: string) => {
    Toast.show(`Edit saved 💾`, {
      duration: 5000,
      position: 60,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
      backgroundColor: Colors.emerald100,
      textColor: Colors.primary900,
      opacity: 1,
    })
  }

  const submitPressed = async (data: TFormData) => {
    const { name, contact, remarks, date } = data

    // await extendedClient.person.update({
    //   where: {
    //     id: selectedPerson.id,
    //   },
    //   data: {
    //     name: data.name,
    //     contact: data.contact,
    //     remarks: data.remarks,
    //     date: data.date,
    //     category: category,
    //   },
    // })
    await db
      .update(Person)
      .set({
        name: name,
        contact: contact,
        remarks: remarks,
        date: date,
        category: category,
      })
      .where(eq(Person.id, selectedPerson.id))
    console.log('edit done')
    reset()
    showToast(data.name === null ? '' : data.name)
    router.navigate('/(tabs)/recordsPage')
  }

  // console.log('edit Page', selectedPerson)

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{
          flex: 1,
          backgroundColor: Colors.primary50,
        }}
      >
        <StatusBar barStyle={'dark-content'} />

        <View
          style={{
            flex: 1,
            backgroundColor: Colors.primary50,
            paddingTop: 20,
          }}
        >
          <ScrollView style={styles.scrollViewContainer}>
            <View style={styles.twoColumnsContainer}>
              <Controller
                control={control}
                name="name"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInputComponent
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    label="name"
                    placeholderText="nicodemus"
                    extraStyles={{ width: 175 }}
                  />
                )}
              />
              <Controller
                control={control}
                name="contact"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInputComponent
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    label="contact"
                    placeholderText="hp no."
                    extraStyles={{ width: 140 }}
                  />
                )}
              />
            </View>
            <Controller
              control={control}
              name="remarks"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInputComponent
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  label="remarks"
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
                    label="date"
                    placeholderText=""
                    extraStyles={{ width: 130 }}
                  />
                )}
              />
            </View>
            <CustomRadioButtons setSelected={setCategory} selected={category} />
            <TouchableOpacity
              style={styles.buttonStyle}
              onPress={handleSubmit(submitPressed)}
              activeOpacity={0.8}
            >
              <FontAwesome6
                name="pen-to-square"
                size={22}
                color={Colors.white}
              />
              <Text style={styles.buttonText}>Save Edit</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
export default EditPage

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
    paddingHorizontal: 20,
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
    gap: 20,
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
})
