import {
  View,
  FlatList,
  Pressable,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native'
import Text from '@/components/Text'
import { memo } from 'react'
import { Feather, FontAwesome5 } from '@expo/vector-icons'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import { format } from 'date-fns'
import { Colors } from '@/constants/Colors'
import { TPersonWithTagsAndFollowUps } from '@/drizzle/schema'
import { useTranslations } from '@/app/_layout'

type PersonStatus = {
  label: string
  color: string
}

type PersonMapCalloutProps = {
  person: TPersonWithTagsAndFollowUps
  sortedFollowUps: NonNullable<TPersonWithTagsAndFollowUps['followUp']>
  personStatus?: PersonStatus
  onEdit: (personId: number) => void
  onShare: (personId: number) => void
  onFollowUp: (personId: number) => void
  onDelete: (personId: number) => void
  onNavigate: (latitude: number, longitude: number) => void
  onCall: (phoneNumber: string) => void
  onWhatsApp: (phoneNumber: string) => void
}

const PersonMapCallout = ({
  person,
  sortedFollowUps,
  personStatus,
  onEdit,
  onShare,
  onFollowUp,
  onDelete,
  onNavigate,
  onCall,
  onWhatsApp,
}: PersonMapCalloutProps) => {
  const i18n = useTranslations()

  return (
    <View
      style={[
        styles.calloutContainer,
        Platform.OS === 'ios' ? { maxHeight: 320 } : { flex: 1 },
      ]}
    >
      <View style={styles.calloutActionRow}>
        <Pressable
          style={styles.calloutActionBtn}
          onPress={() => onEdit(person.id)}
        >
          <Text style={styles.calloutActionTxt}>
            {i18n.t('detailsModal.actionEdit')}
          </Text>
        </Pressable>
        <Pressable
          style={styles.calloutActionBtn}
          onPress={() => onShare(person.id)}
        >
          <Text style={styles.calloutActionTxt}>
            {i18n.t('detailsModal.actionShare')}
          </Text>
        </Pressable>
        <Pressable
          style={styles.calloutActionBtn}
          onPress={() => onFollowUp(person.id)}
        >
          <Text style={styles.calloutActionTxt}>
            {i18n.t('detailsModal.actionFollowUp')}
          </Text>
        </Pressable>
        <Pressable
          style={styles.calloutActionBtn}
          onPress={() => onDelete(person.id)}
        >
          <Text style={styles.calloutActionTxt}>
            {i18n.t('detailsModal.actionDelete')}
          </Text>
        </Pressable>
      </View>
      <View style={styles.topBar}>
        <Text style={styles.name}>{person.name || 'Unnamed Person'}</Text>
        <View
          style={[
            styles.contactableBox,
            { backgroundColor: personStatus?.color },
          ]}
        >
          <Text style={styles.contactableText}>{personStatus?.label}</Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          gap: 5,
          alignItems: 'center',
          marginVertical: 5,
        }}
      >
        <FlatList
          style={{ marginVertical: 2 }}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={person.personsToTags}
          renderItem={({ item }) => (
            <View
              key={item.tag.id}
              style={[
                styles.contactableBox,
                {
                  borderColor: Colors.lemon300,
                  borderWidth: 1,
                  marginRight: 5,
                },
              ]}
            >
              <Text
                style={{
                  fontFamily: 'IBM-Medium',
                  fontSize: 12,
                  color: Colors.lemon300,
                }}
              >
                {item.tag.tagName}
              </Text>
            </View>
          )}
        />
      </View>
      <View style={styles.horizontalLine} />

      <Text style={styles.address}>
        {person.block ? 'Apt.' + person.block : ''}{' '}
        {person.unit ? '#' + person.unit : ''} {person.street}
      </Text>
      {Platform.OS === 'ios' && (
        <Pressable
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 5,
            borderRadius: 30,
            width: 100,
            gap: 5,
            marginVertical: 3,
            backgroundColor: Colors.primary500,
          }}
          onPress={() => onNavigate(person.latitude!, person.longitude!)}
        >
          <FontAwesome5 name="car-alt" size={18} color={Colors.primary50} />
          <Text
            style={{
              fontFamily: 'IBM-Medium',
              fontSize: 14,
              color: Colors.primary50,
            }}
          >
            {i18n.t('statusOptions.labelNavigate')}
          </Text>
        </Pressable>
      )}
      {person.contact && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: 10,
          }}
        >
          <Text
            style={{
              fontFamily: 'IBM-Medium',
              fontSize: 14,
              color: Colors.primary50,
            }}
          >
            Contact
          </Text>
          <Text
            style={{
              fontFamily: 'IBM-Medium',
              fontSize: 14,
              color: Colors.primary50,
            }}
          >
            {person.contact}
          </Text>
          {Platform.OS === 'ios' && (
            <Pressable onPress={() => onCall(person.contact ?? '')}>
              <Feather name="phone-call" size={18} color="white" />
            </Pressable>
          )}
          {Platform.OS === 'ios' && (
            <Pressable onPress={() => onWhatsApp(person.contact ?? '')}>
              <FontAwesome6 name="whatsapp" size={20} color={Colors.emerald300} />
            </Pressable>
          )}
        </View>
      )}

      {person.date && (
        <Text
          style={{
            fontFamily: 'IBM-Medium',
            fontSize: 14,
            color: Colors.primary50,
            marginVertical: 3,
          }}
        >
          {i18n.t('statusOptions.labelInitialVisit')}{' '}
          {person.initialVisit
            ? format(new Date(person.initialVisit), 'dd MMM yyyy (EEE)')
            : person.date}
        </Text>
      )}
      {person.publications && (
        <Text
          style={{
            fontFamily: 'IBM-Bold',
            fontSize: 14,
            color: Colors.lemon200,
          }}
        >
          {person.publications}
        </Text>
      )}
      <ScrollView
        style={{ flex: 1 }}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
      >
        {person.remarks && (
          <View style={styles.remarksBox}>
            <Text style={styles.remarksText}>{person.remarks}</Text>
          </View>
        )}
        {sortedFollowUps.length > 0 && (
          <View>
            <Text style={styles.labelText}>
              {i18n.t('statusOptions.labelFollowUps')}
            </Text>
            {sortedFollowUps.map((followUp) => (
              <View
                key={followUp.id}
                style={[styles.remarksBox, { marginBottom: 0 }]}
              >
                <Text
                  style={{
                    color: Colors.primary400,
                    fontFamily: 'IBM-Regular',
                    fontSize: 13,
                    marginBottom: 3,
                  }}
                >
                  {format(new Date(followUp.date), 'dd MMM yyyy (EEE)')}
                </Text>
                <Text style={styles.remarksText}>{followUp.notes}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <View style={styles.calloutTail} />
    </View>
  )
}

export default memo(PersonMapCallout)

const styles = StyleSheet.create({
  calloutContainer: {
    backgroundColor: Colors.primary900,
    borderRadius: 15,
    padding: 8,
    marginBottom: 10,
    minWidth: 300,
    position: 'relative',
    flex: 1,
  },
  calloutActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
    paddingHorizontal: 2,
    flexGrow: 0,
  },
  calloutActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
    backgroundColor: Colors.primary700,
  },
  calloutActionTxt: {
    fontFamily: 'IBM-Bold',
    fontSize: 12,
    color: Colors.primary50,
  },
  calloutTail: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -5,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderLeftColor: 'transparent',
    borderRightWidth: 10,
    borderRightColor: 'transparent',
    borderTopWidth: 10,
    borderTopColor: Colors.primary900,
    transform: [{ translateX: 2 }],
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  name: {
    fontFamily: 'IBM-Bold',
    fontSize: 15,
    color: Colors.emerald300,
    paddingLeft: 3,
  },
  contactableBox: {
    padding: 3,
    borderRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactableText: {
    fontFamily: 'IBM-Medium',
    fontSize: 12,
    color: Colors.primary900,
  },
  horizontalLine: {
    marginVertical: 5,
    height: 1,
    backgroundColor: Colors.primary300,
  },
  address: {
    fontFamily: 'IBM-SemiBoldItalic',
    fontSize: 14,
    color: Colors.emerald300,
  },
  remarksBox: {
    padding: 5,
    paddingBottom: 15,
    backgroundColor: Colors.primary800,
    borderRadius: 5,
    marginVertical: 10,
  },
  remarksText: {
    fontFamily: 'IBM-Italic',
    fontSize: 13,
    color: Colors.primary50,
  },
  labelText: {
    fontFamily: 'IBM-MediumItalic',
    fontSize: 14,
    color: Colors.primary300,
    paddingLeft: 6,
  },
})
