import { Colors } from '@/constants/Colors'
import { Text, StyleSheet, View, ScrollView } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'

const ReadmePage = () => {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Welcome to FsPal 👋</Text>
        <Text style={styles.subheader}>To note.</Text>
        <Text style={styles.body}>
          Whenever you create a new record, check the minimap to see whether
          marker is at the desired location. Sometimes, you will need to press
          the 'Update Map' button to refresh the marker's location.
        </Text>
        <Text style={styles.subheader}>
          Are the records stored in the cloud?
        </Text>
        <Text style={styles.body}>
          No. The records are stored locally on your phone. No backup is
          available on a server. If you delete the app, the data will also be
          deleted. You can do a local backup onto a JSON file and save to your
          phone's file system. This JSON file can then be used to restore all
          your data when you reinstall the app.
        </Text>
        <Text style={styles.subheader}>Is sharing available?</Text>
        <Text style={styles.body}>
          Yes. You can transfer a record to another person who is also using
          FsPal.
        </Text>
        <Text
          style={[
            styles.subheader,
            { color: Colors.emerald700, fontFamily: 'IBM-SemiBoldItalic' },
          ]}
        >
          New Feature! - Export as Docs
          <Ionicons
            name="document-outline"
            size={24}
            color={Colors.emerald700}
          />
        </Text>
        <Text style={styles.body}>
          You can create a copy of your records in a .docx file, and open it on{' '}
          {''}
          <MaterialCommunityIcons
            name="google"
            size={20}
            color={Colors.emerald700}
          />
          oogle Docs! Or whichever compatible note-taking app you prefer.
        </Text>
      </ScrollView>
    </View>
  )
}

export default ReadmePage

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary100,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 15,
    paddingBottom: 50,
  },
  header: {
    fontFamily: 'IBM-Bold',
    fontSize: 26,
    marginBottom: 10,
    color: Colors.primary800,
  },
  subheader: {
    fontFamily: 'IBM-SemiBold',
    fontSize: 20,
    marginVertical: 10,
    color: Colors.primary800,
  },
  body: {
    fontFamily: 'IBM-Regular',
    fontSize: 18,
    color: Colors.primary800,
    marginBottom: 10,
  },
})
