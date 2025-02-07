import { Colors } from '@/constants/Colors'
import { Text, StyleSheet, View, ScrollView, Image } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTranslations } from '../_layout'

const ReadmePage = () => {
  const i18n = useTranslations()
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>{i18n.t('readme.title')}</Text>
        <Text style={styles.subheader}>{i18n.t('readme.toNoteHeader')}</Text>
        <Text style={styles.body}>{i18n.t('readme.toNoteBody')}</Text>
        <Text style={styles.subheader}>{i18n.t('readme.cloudHeader')}</Text>
        <Text style={styles.body}>{i18n.t('readme.cloudBody')}</Text>
        <Text style={styles.subheader}>{i18n.t('readme.sharingHeader')}</Text>
        <Text style={styles.body}>{i18n.t('readme.sharingBody')}</Text>
        <Text style={[styles.subheader]}>
          {i18n.t('readme.exportHeader')}
          <Ionicons
            name="document-outline"
            size={24}
            color={Colors.primary800}
          />
        </Text>
        <Text style={styles.body}>{i18n.t('readme.exportBody')}</Text>
        <Text
          style={[
            styles.subheader,
            { color: Colors.emerald700, fontFamily: 'IBM-SemiBoldItalic' },
          ]}
        >
          {i18n.t('readme.reportHeader')}
        </Text>
        <Text style={styles.body}>{i18n.t('readme.reportBody')}</Text>
        <Text
          style={[
            styles.subheader,
            { color: Colors.emerald700, fontFamily: 'IBM-SemiBoldItalic' },
          ]}
        >
          {i18n.t('readme.scheduleHeader')}
        </Text>
        <Text style={styles.body}>{i18n.t('readme.scheduleBody')}</Text>
        <Text
          style={[
            styles.subheader,
            { color: Colors.emerald700, fontFamily: 'IBM-SemiBoldItalic' },
          ]}
        >
          {i18n.t('readme.translateHeader')}
        </Text>
        <Text style={styles.body}>{i18n.t('readme.translateBody')}</Text>
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
  BMCImage: {
    width: 150,
    aspectRatio: 'auto',
    height: 40,
    marginVertical: 7,
  },
})
