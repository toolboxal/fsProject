import { Tabs } from 'expo-router'
import { Colors } from '@/constants/Colors'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const TabsLayout = () => {
  const { bottom } = useSafeAreaInsets()
  console.log('tabslayout page')
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        unmountOnBlur: true,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: Colors.primary900,
          height: Platform.OS === 'android' ? 75 : bottom + 60,
          // paddingBottom: Platform.OS === 'android' ? 10 : 30,
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          position: 'absolute',
          // height: 75,
          // marginBottom: bottom,
          // marginHorizontal: 15,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',

          tabBarIcon: ({ focused }) => (
            <FontAwesome5
              size={30}
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
              size={33}
              name="folder-open"
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
