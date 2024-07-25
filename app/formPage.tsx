import Form from '@/components/Form'
import { Colors } from '@/constants/Colors'
import useMyStore from '@/store/store'
import getCurrentLocation from '@/utils/getCurrentLoc'
import { useEffect } from 'react'
import { KeyboardAvoidingView, Platform, StatusBar } from 'react-native'

const FormPage = () => {
  const setGeoCoords = useMyStore((state) => state.setGeoCoords)
  const setAddress = useMyStore((state) => state.setAddress)

  useEffect(() => {
    const getGeo = async () => {
      const { latitude, longitude, getAddress } = await getCurrentLocation()
      setGeoCoords({ latitude, longitude })
      setAddress(getAddress[0])
    }
    getGeo()
  }, [])

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{
        flex: 1,
        backgroundColor: Colors.primary50,
      }}
    >
      <StatusBar barStyle={'dark-content'} />

      <Form />
    </KeyboardAvoidingView>
  )
}
export default FormPage
