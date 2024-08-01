import { router, Tabs } from 'expo-router'
import { Colors } from '@/constants/Colors'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import { MaterialIcons } from '@expo/vector-icons'
import { Platform } from 'react-native'

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        unmountOnBlur: true,
        // tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: Colors.primary700,
          height: Platform.OS === 'android' ? 70 : 90,
          paddingBottom: Platform.OS === 'android' ? 10 : 30,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',

          tabBarIcon: ({ focused }) => (
            <FontAwesome5
              size={25}
              name="map-marked-alt"
              color={`${focused ? Colors.emerald500 : Colors.primary500}`}
            />
          ),
          tabBarActiveTintColor: Colors.emerald500,
        }}
      />
      <Tabs.Screen
        name="editPage"
        options={{
          title: 'EditPage',
          href: null,
          headerTitle: 'Edit Record',
          headerShown: true,
          headerTitleStyle: {
            fontFamily: 'IBM-Regular',
            color: Colors.primary600,
            fontSize: 22,
          },
          headerLeft: () => (
            <MaterialIcons
              name="arrow-back"
              size={28}
              color="black"
              style={{ paddingHorizontal: 10 }}
              onPress={() => router.navigate('/(tabs)/recordsPage')}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="recordsPage"
        options={{
          title: 'Records',
          tabBarIcon: ({ focused }) => (
            <FontAwesome5
              size={30}
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
