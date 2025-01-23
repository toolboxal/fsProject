import { Pressable, StyleSheet, Text, View } from 'react-native'
import { router, Stack } from 'expo-router'
import { Colors } from '@/constants/Colors'

const OptionsLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="optionsPage"
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Options',
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
              <Text style={{ fontFamily: 'IBM-Regular' }}>Close</Text>
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
          headerTitle: 'Readme',
          headerTitleStyle: {
            color: Colors.emerald800,
            fontFamily: 'IBM-Medium',
            fontSize: 18,
          },
          headerBackTitle: 'Back',
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
