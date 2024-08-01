import { Stack } from 'expo-router'
import { useFonts } from 'expo-font'
import { useCallback, useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { Colors } from '@/constants/Colors'
import { RootSiblingParent } from 'react-native-root-siblings'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import * as Font from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'

import { useMigrations, migrate } from 'drizzle-orm/expo-sqlite/migrator'
import migrations from '../drizzle/migrations/migrations'
import { db } from '@/drizzle/db'

SplashScreen.preventAutoHideAsync()

const RootLayout = () => {
  // const [loaded, error] = useFonts({
  //   'IBM-Italic': require('../assets/fonts/IBMPlexSans-Italic.ttf'),
  //   'IBM-Regular': require('../assets/fonts/IBMPlexSans-Regular.ttf'),
  //   'IBM-Medium': require('../assets/fonts/IBMPlexSans-Medium.ttf'),
  //   'IBM-MediumItalic': require('../assets/fonts/IBMPlexSans-MediumItalic.ttf'),
  //   'IBM-SemiBold': require('../assets/fonts/IBMPlexSans-SemiBold.ttf'),
  //   'IBM-SemiBoldItalic': require('../assets/fonts/IBMPlexSans-SemiBoldItalic.ttf'),
  //   'IBM-Bold': require('../assets/fonts/IBMPlexSans-Bold.ttf'),
  // })
  // const { success, error: migrationError } = useMigrations(db, migrations)

  // useEffect(() => {
  //   if (loaded || error) {
  //     SplashScreen.hideAsync()
  //   }
  // }, [loaded, error])

  // if (!loaded && !error) {
  //   return null
  // }
  const [appIsReady, setAppIsReady] = useState(false)

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
        })
        await migrate(db, migrations)
        await new Promise((resolve) => setTimeout(resolve, 3000))
      } catch (error) {
        console.warn(error)
      } finally {
        setAppIsReady(true)
      }
    }
    prepare()
  }, [])

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync()
    }
  }, [appIsReady])

  if (!appIsReady) {
    return null
  }

  // if (migrationError) {
  //   return (
  //     <View>
  //       <Text>Migration error: {migrationError.message}</Text>
  //     </View>
  //   )
  // }

  // if (!success) {
  //   return (
  //     <View>
  //       <Text>Migration is in progress...</Text>
  //     </View>
  //   )
  // }

  return (
    <GestureHandlerRootView>
      <ActionSheetProvider>
        <RootSiblingParent>
          <View onLayout={onLayoutRootView} style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="formPage"
                options={{
                  presentation: 'card',
                  // gestureEnabled: false,
                  headerShown: true,
                  headerTitle: 'Create New Record',
                  headerTitleStyle: {
                    fontFamily: 'IBM-Regular',
                    color: Colors.primary600,
                    fontSize: 22,
                  },
                  headerBackTitle: 'Back',
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
                name="readmePage"
                options={{
                  presentation: 'card',
                  // gestureEnabled: false,
                  headerShown: true,
                  headerTitle: 'readme',
                  headerTitleStyle: {
                    fontFamily: 'IBM-Regular',
                    color: Colors.primary600,
                    fontSize: 22,
                  },
                  headerBackTitle: 'Back',
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
            </Stack>
          </View>
        </RootSiblingParent>
      </ActionSheetProvider>
    </GestureHandlerRootView>
  )
}

export default RootLayout
