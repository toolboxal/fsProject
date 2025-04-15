import { Tabs } from 'expo-router'
import { Colors } from '@/constants/Colors'
import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useTranslations } from '../_layout'

const TabsLayout = () => {
  const { bottom } = useSafeAreaInsets()
  const i18n = useTranslations()
  console.log('tabslayout page')
  return (
    <Tabs
      screenListeners={{
        tabPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
        },
      }}
      screenOptions={{
        headerShown: true,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: 'IBM-SemiBold',
        },
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor:
            Platform.OS === 'android'
              ? 'rgba(35,35,35,0.92)'
              : 'rgba(35,35,35,0.82) ',
          height: Platform.OS === 'android' ? 75 : bottom + 62,
          position: 'absolute',
          paddingTop: 5,
        },
        animation: 'fade',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: i18n.t('tabbar.map'),
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <FontAwesome5
              size={24}
              name="map-marked-alt"
              color={`${focused ? Colors.emerald500 : Colors.primary500}`}
            />
          ),
          tabBarActiveTintColor: Colors.emerald500,
        }}
      />

      <Tabs.Screen
        name="recordsPage"
        options={{
          title: i18n.t('tabbar.records'),
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <FontAwesome5
              size={24}
              name="folder-open"
              color={`${focused ? Colors.emerald500 : Colors.primary500}`}
            />
          ),
          tabBarActiveTintColor: Colors.emerald500,
        }}
      />

      <Tabs.Screen
        name="reportPage"
        options={{
          title: i18n.t('tabbar.reports'),
          tabBarIcon: ({ focused }) => (
            <FontAwesome
              name="list-alt"
              size={24}
              color={`${focused ? Colors.emerald500 : Colors.primary500}`}
            />
          ),
          tabBarActiveTintColor: Colors.emerald500,
        }}
      />
      <Tabs.Screen
        name="schedulePage"
        options={{
          title: i18n.t('tabbar.schedule'),
          tabBarIcon: ({ focused }) => (
            <MaterialIcons
              name="grid-on"
              size={24}
              color={`${focused ? Colors.emerald500 : Colors.primary500}`}
            />
          ),
          tabBarActiveTintColor: Colors.emerald500,
        }}
      />
    </Tabs>
  )
}
export default TabsLayout
