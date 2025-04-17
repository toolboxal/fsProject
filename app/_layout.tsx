import { Stack } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { View, Text, TextInput } from 'react-native'

import { Colors } from '@/constants/Colors'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import * as Font from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { PaperProvider } from 'react-native-paper'
import { Toaster } from 'sonner-native'

import { migrate } from 'drizzle-orm/expo-sqlite/migrator'
import migrations from '../drizzle/migrations/migrations'
import { db, expoDb } from '@/drizzle/db'
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as Location from 'expo-location'
import getCurrentLocation from '@/utils/getCurrentLoc'
import useMyStore from '@/store/store'
import { I18n } from 'i18n-js'
import { en, es, ja, zh, ptBR } from '../constants/localizations'

SplashScreen.preventAutoHideAsync()

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
})

const i18n = new I18n({
  en: en,
  es: es,
  ja: ja,
  zh: zh,
  ptBR: ptBR,
})

const theme = {
  colors: {
    secondaryContainer: Colors.emerald900,
    onSecondaryContainer: Colors.primary50,
    primary: Colors.emerald900,
    onSurface: Colors.emerald900,
    outline: Colors.emerald900,
  },
}

const RootLayout = () => {
  const [appIsReady, setAppIsReady] = useState(false)

  const setAddress = useMyStore((state) => state.setAddress)
  const setGeoCoords = useMyStore((state) => state.setGeoCoords)
  const lang = useMyStore((state) => state.language)

  i18n.enableFallback = true
  i18n.locale = lang

  const queryClient = new QueryClient()

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          'IBM-Italic': require('../assets/fonts/IBMPlexSans-Italic.ttf'),
          'IBM-Regular': require('../assets/fonts/IBMPlexSans-Regular.ttf'),
          'IBM-Medium': require('../assets/fonts/IBMPlexSans-Medium.ttf'),
          'IBM-MediumItalic': require('../assets/fonts/IBMPlexSans-MediumItalic.ttf'),
          'IBM-SemiBold': require('../assets/fonts/IBMPlexSans-SemiBold.ttf'),
          'IBM-SemiBoldItalic': require('../assets/fonts/IBMPlexSans-SemiBoldItalic.ttf'),
          'IBM-Bold': require('../assets/fonts/IBMPlexSans-Bold.ttf'),
          'Lora-Regular': require('../assets/fonts/Lora-Regular.ttf'),
          'Lora-Italic': require('../assets/fonts/Lora-Italic.ttf'),
          'Lora-Bold': require('../assets/fonts/Lora-Bold.ttf'),
          'Lora-SemiBoldItalic': require('../assets/fonts/Lora-SemiBoldItalic.ttf'),
        })
        await migrate(db, migrations)

        if ((Text as any).defaultProps == null) (Text as any).defaultProps = {}
        ;(Text as any).defaultProps.allowFontScaling = false

        if ((TextInput as any).defaultProps == null)
          (TextInput as any).defaultProps = {}
        ;(TextInput as any).defaultProps.allowFontScaling = false

        await new Promise((resolve) => setTimeout(resolve, 2000))
      } catch (error) {
        console.warn(error)
      } finally {
        setAppIsReady(true)
      }

      const getLocationPermission = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
          console.log('Permission to access location was denied')
          return
        }

        const { latitude, longitude, getAddress } = await getCurrentLocation()

        setGeoCoords({ latitude, longitude })

        setAddress(getAddress[0])
      }
      getLocationPermission()
    }

    prepare()
  }, [])

  useDrizzleStudio(expoDb)

  const onLayoutRootView = useCallback(() => {
    if (appIsReady) {
      SplashScreen.hide()
    }
  }, [appIsReady])

  if (!appIsReady) {
    return null
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <ActionSheetProvider>
          <PaperProvider theme={theme}>
            <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="formPage"
                  options={{
                    presentation: 'card',
                    // gestureEnabled: false,
                    headerShown: true,
                    headerTitle: i18n.t('form.tabHeader'),
                    headerTitleStyle: {
                      fontFamily: 'IBM-Regular',
                      color: Colors.primary600,
                      fontSize: 22,
                    },
                    headerBackTitle: i18n.t('form.tabHeaderLeft'),
                    headerBackTitleStyle: {
                      fontFamily: 'Roboto-Regular',
                      fontSize: 18,
                    },
                    headerStyle: {
                      backgroundColor: Colors.primary50,
                    },
                    headerTintColor: Colors.primary600,
                  }}
                />
                <Stack.Screen
                  name="editPage"
                  options={{
                    presentation: 'card',
                    // gestureEnabled: false,
                    headerShown: true,
                    headerTitle: i18n.t('editForm.tabHeader'),
                    headerTitleStyle: {
                      fontFamily: 'IBM-Regular',
                      color: Colors.primary600,
                      fontSize: 22,
                    },
                    headerBackTitle: i18n.t('editForm.tabHeaderLeft'),
                    headerBackTitleStyle: {
                      fontFamily: 'Roboto-Regular',
                      fontSize: 18,
                    },

                    headerStyle: {
                      backgroundColor: Colors.primary50,
                    },
                    headerTintColor: Colors.primary600,
                  }}
                />

                <Stack.Screen
                  name="(options)"
                  options={{ presentation: 'modal' }}
                />
              </Stack>
              <Toaster position="top-center" richColors />
            </View>
          </PaperProvider>
        </ActionSheetProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  )
}

export const useTranslations = () => {
  return i18n
}

export default RootLayout
