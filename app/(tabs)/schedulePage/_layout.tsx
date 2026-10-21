import { Stack } from 'expo-router'
import { Colors } from '@/constants/Colors'

export default function SchedulePageLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: Colors.primary50 },
      }}
    />
  )
}
