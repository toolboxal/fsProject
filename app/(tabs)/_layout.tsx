import { Tabs } from 'expo-router'
import { Colors } from '@/constants/Colors'
import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import FontAwesome from '@expo/vector-icons/FontAwesome'

const TabsLayout = () => {
  const { bottom } = useSafeAreaInsets()
  console.log('tabslayout page')
  return (
    <Tabs
      screenListeners={{
        tabPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
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
          backgroundColor: 'rgba(30,30,30,0.88)',
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
          title: 'Map',
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
          title: 'Records',
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
          title: 'Report',
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
    </Tabs>
  )
}
export default TabsLayout
