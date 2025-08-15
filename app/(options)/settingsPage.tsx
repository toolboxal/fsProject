import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  Linking,
  Platform,
} from 'react-native'
import { useTranslations } from '../_layout'
import { Colors } from '@/constants/Colors'
import SingleOption from '@/components/SingleOption'
import { storage } from '@/store/storage'
import useMyStore from '@/store/store'
import { router } from 'expo-router'
import * as Link from 'expo-linking'
import { ScrollView } from 'react-native-gesture-handler'

const APP_STORE_ID = '6745219755'
const PLAY_STORE_ID = 'YOUR_PACKAGE_NAME' // Replace with your Android package name e.g. 'com.yourcompany.appname'

const openAppStore = () => {
  const url = Platform.select({
    ios: `https://apps.apple.com/app/id${APP_STORE_ID}`,
    android: `https://play.google.com/store/apps/details?id=${PLAY_STORE_ID}`,
    default: `https://apps.apple.com/app/id${APP_STORE_ID}`,
  })

  Linking.canOpenURL(url).then((supported) => {
    if (supported) {
      Linking.openURL(url)
    } else {
      console.log(`Cannot open store URL: ${url}`)
    }
  })
}

const settingsPage = () => {
  const i18n = useTranslations()
  const setLang = useMyStore((state) => state.setLanguage)

  const BUYMEACOFFEE_URL = 'https://www.buymeacoffee.com/alvinw'

  const handleLanguageChange = (lang: string) => {
    setLang(lang)
    storage.set('language', lang)
    // Refresh the entire app
    router.replace('/')
  }

  return (
    <ScrollView
      style={styles.mainContainer}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeadTxt}>
          {i18n.t('settings.permissionHeader')}
        </Text>
        <SingleOption
          handler={() => Link.openSettings()}
          headerTxt={i18n.t('settings.permissionTitle')}
          descTxt={i18n.t('settings.permissionDesc')}
        />
      </View>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeadTxt}>
          {i18n.t('settings.languageHeader')}
        </Text>
        <SingleOption
          handler={() => handleLanguageChange('en')}
          headerTxt="English"
          descTxt="Thank you for using this app"
        />
        <SingleOption
          handler={() => handleLanguageChange('es')}
          headerTxt="Spanish"
          descTxt="Gracias por usar esta aplicación"
        />
        <SingleOption
          handler={() => handleLanguageChange('fr')}
          headerTxt="French"
          descTxt="Merci d'utiliser cette application"
        />
        <SingleOption
          handler={() => handleLanguageChange('ptBR')}
          headerTxt="Portuguese"
          descTxt="Obrigado por usar este aplicativo."
        />
        <SingleOption
          handler={() => handleLanguageChange('ko')}
          headerTxt="Korean"
          descTxt="이 앱을 사용해 주셔서 감사합니다"
        />
        <SingleOption
          handler={() => handleLanguageChange('ja')}
          headerTxt="Japanese"
          descTxt="このアプリをご利用いただき、ありがとうございます"
        />
        <SingleOption
          handler={() => handleLanguageChange('zh')}
          headerTxt="Chinese"
          descTxt="谢谢您使用这个应用程序."
        />
      </View>
      <Text
        style={{
          fontFamily: 'IBM-Regular',
          fontSize: 14,
          color: Colors.primary700,
          marginVertical: 5,
        }}
      >
        version 1.5.0
      </Text>
      <Pressable
        onPress={openAppStore}
        style={{
          padding: 10,
          borderRadius: 5,
          backgroundColor: 'white',
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 10,
          gap: 10,
        }}
      >
        <Image
          source={require('@/assets/images/preciouslives-icon.png')}
          style={{
            width: 60,
            height: 60,
            aspectRatio: 1,
            borderRadius: 10,
          }}
        />
        <View>
          <Text
            style={{
              fontFamily: 'IBM-SemiBold',
              fontSize: 18,
              marginBottom: 3,
              color: Colors.primary700,
            }}
          >
            preciousLives App
          </Text>
          <Text
            style={{
              fontFamily: 'IBM-Regular',
              fontSize: 14,
              color: Colors.primary700,
            }}
          >
            GoBag App available on App Store.
          </Text>
        </View>
      </Pressable>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeadTxt}>
          {i18n.t('settings.supportHeader')}
        </Text>

        <Text style={styles.supportTxt}>{i18n.t('settings.supportDesc')}</Text>
        <Pressable
          style={{ marginTop: 5 }}
          onPress={async () => {
            await Linking.openURL(BUYMEACOFFEE_URL)
          }}
        >
          <Image
            source={require('@/assets/images/BMC_Button_Logo.png')}
            style={styles.BMCImage}
          />
        </Pressable>
      </View>
    </ScrollView>
  )
}
export default settingsPage
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.primary300,
    paddingVertical: 10,
    paddingHorizontal: 15,
    gap: 10,
  },
  sectionContainer: {
    flexDirection: 'column',
    gap: 2,
  },
  sectionHeadTxt: {
    fontFamily: 'IBM-Italic',
    fontSize: 16,
    color: Colors.primary700,
    marginBottom: 3,
    paddingLeft: 3,
  },
  supportTxt: {
    marginBottom: 3,
    fontFamily: 'IBM-Regular',
    fontSize: 15,
    color: Colors.primary800,
    lineHeight: 23,
  },
  BMCImage: {
    width: 180,
    aspectRatio: 'auto',
    height: 50,
    marginVertical: 5,
    borderColor: Colors.lemon400,
    borderWidth: 2,
    borderRadius: 8,
  },
})
