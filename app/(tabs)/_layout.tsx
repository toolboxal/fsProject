import { Tabs } from 'expo-router'
import { Colors } from '@/constants/Colors'
import { Platform, Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useTranslations } from '../_layout'
import { BlurView } from 'expo-blur'

const TabsLayout = () => {
  const { bottom } = useSafeAreaInsets()
  const i18n = useTranslations()
  const { width: innerWidth } = Dimensions.get('window')
  console.log('tabslayout page')
  return (
    <Tabs
      screenListeners={{
        tabPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid)
        },
      }}
      screenOptions={{
        headerShown: true,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: 'IBM-SemiBold',
        },
        tabBarHideOnKeyboard: true,
        // tabBarStyle: {
        //   backgroundColor:
        //     Platform.OS === 'android'
        //       ? 'rgba(35,35,35,0.92)'
        //       : 'rgba(35,35,35,0.82) ',
        //   height: Platform.OS === 'android' ? 75 : bottom + 62,
        //   position: 'absolute',
        //   paddingTop: 5,
        // },
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderRadius: 50,
          height: 70,
          bottom: bottom - 10,
          width: '90%',
          paddingTop: 6,
          elevation: 0,
          position: 'absolute',
          alignSelf: 'center',
          marginLeft: innerWidth * 0.05,
        },
        tabBarInactiveTintColor: Colors.primary100,
        tabBarBackground: () => (
          <BlurView
            intensity={52}
            tint="dark"
            style={{
              borderRadius: 50,
              overflow: 'hidden',
              flex: 1,
            }}
          />
        ),
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
              color={`${focused ? Colors.emerald200 : Colors.primary100}`}
            />
          ),
          tabBarActiveTintColor: Colors.emerald200,
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
              color={`${focused ? Colors.emerald200 : Colors.primary100}`}
            />
          ),
          tabBarActiveTintColor: Colors.emerald200,
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
              color={`${focused ? Colors.emerald200 : Colors.primary100}`}
            />
          ),
          tabBarActiveTintColor: Colors.emerald200,
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
              color={`${focused ? Colors.emerald200 : Colors.primary100}`}
            />
          ),
          tabBarActiveTintColor: Colors.emerald200,
        }}
      />
    </Tabs>
  )
}
export default TabsLayout
