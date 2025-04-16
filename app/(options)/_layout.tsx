import { Pressable, Text } from 'react-native'
import { router, Stack } from 'expo-router'
import { Colors } from '@/constants/Colors'
import { useTranslations } from '../_layout'

const OptionsLayout = () => {
  const i18n = useTranslations()
  return (
    <Stack>
      <Stack.Screen
        name="optionsPage"
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: i18n.t('options.tabHeader'),
          headerTitleStyle: {
            color: Colors.emerald800,
            fontFamily: 'IBM-Medium',
            fontSize: 18,
          },
          headerRight: () => (
            <Pressable
              onPress={() => {
                router.dismiss()
              }}
            >
              <Text style={{ fontFamily: 'IBM-Regular' }}>
                {i18n.t('options.closeBtn')}
              </Text>
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="readmePage"
        options={{
          presentation: 'card',
          // gestureEnabled: false,
          headerShown: true,
          headerTitle: i18n.t('readme.tabHeader'),
          headerTitleStyle: {
            color: Colors.emerald800,
            fontFamily: 'IBM-Medium',
            fontSize: 18,
          },
          headerBackTitle: i18n.t('readme.backBtn'),
          headerBackTitleStyle: {
            fontFamily: 'IBM-Regular',
            fontSize: 16,
          },
          headerStyle: {
            backgroundColor: Colors.primary50,
          },
          headerTintColor: Colors.primary600,
        }}
      />
      <Stack.Screen
        name="settingsPage"
        options={{
          presentation: 'card',
          // gestureEnabled: false,
          headerShown: true,
          headerTitle: i18n.t('settings.tabHeader'),
          headerTitleStyle: {
            color: Colors.emerald800,
            fontFamily: 'IBM-Medium',
            fontSize: 18,
          },
          headerBackTitle: i18n.t('settings.backBtn'),
          headerBackTitleStyle: {
            fontFamily: 'IBM-Regular',
            fontSize: 16,
          },
          headerStyle: {
            backgroundColor: Colors.primary50,
          },
          headerTintColor: Colors.primary600,
        }}
      />
      <Stack.Screen
        name="tagsPage"
        options={{
          presentation: 'card',
          // gestureEnabled: false,
          headerShown: true,
          headerTitle: i18n.t('tagsPage.tabHeader'),
          headerTitleStyle: {
            color: Colors.emerald800,
            fontFamily: 'IBM-Medium',
            fontSize: 18,
          },
          headerBackTitle: i18n.t('tagsPage.backBtn'),
          headerBackTitleStyle: {
            fontFamily: 'IBM-Regular',
            fontSize: 16,
          },
          headerStyle: {
            backgroundColor: Colors.primary50,
          },
          headerTintColor: Colors.primary600,
        }}
      />
    </Stack>
  )
}
export default OptionsLayout
