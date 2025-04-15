import { StyleSheet, Text, View } from 'react-native'
import { Stack } from 'expo-router'

const RecordsLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: true }} />
    </Stack>
  )
}
export default RecordsLayout
const styles = StyleSheet.create({})
