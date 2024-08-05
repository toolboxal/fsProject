import { Colors } from '@/constants/Colors'
import { Text, StyleSheet } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

const readmePage = () => {
  return (
    <ScrollView style={{ flex: 1, padding: 15 }}>
      <Text style={styles.header}>Welcome to FsPal 👋</Text>
      <Text style={styles.subheader}>Purpose</Text>
      <Text style={styles.body}>
        The primary design of this app is to use your current geolocation. When
        geolocation permission is granted, each new record created will have its
        geolocation stored in the background. The records will then show up on
        the map as markers. You can refresh the map to see which record is
        closest to you in the ministry.
      </Text>
      <Text style={styles.subheader}>Are the records stored in the cloud?</Text>
      <Text style={styles.body}>
        No. The records are stored locally on your phone. No backup is available
        on a server. If you delete the app, the data will also be deleted. You
        can do a local backup onto a JSON file and save to your phone's file
        system. This JSON file can then be used to restore all your data when
        you reinstall the app.
      </Text>
      <Text style={styles.body}>
        You can also export a PDF of all your records.
      </Text>
      <Text style={styles.subheader}>Is sharing available?</Text>
      <Text style={styles.body}>
        Yes. You can transfer a record to another person who is also using
        FsPal.
      </Text>
    </ScrollView>
  )
}
export default readmePage

const styles = StyleSheet.create({
  header: {
    fontFamily: 'IBM-Bold',
    fontSize: 26,
    marginBottom: 10,
  },
  subheader: {
    fontFamily: 'IBM-SemiBold',
    fontSize: 20,
    marginVertical: 10,
  },
  body: {
    fontFamily: 'IBM-Regular',
    fontSize: 18,
    color: Colors.primary800,
  },
})
