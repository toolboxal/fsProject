import { useState, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Platform,
  RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { FontAwesome6 } from '@expo/vector-icons'
import { Colors } from '@/constants/Colors'
import ModalForm from '@/components/reportComponents/ReportModal'
import { db } from '@/drizzle/db'
import { Report } from '@/drizzle/schema'
import { useQuery } from '@tanstack/react-query'
import ReportTable from '@/components/reportComponents/reportTable'
import { Tabs } from 'expo-router'
import SvcYrDropdown from '@/components/reportComponents/SvcYrDropdown'
import { isAfter, isBefore, formatDistanceStrict, Locale } from 'date-fns'
import { cleanupOldReports } from '@/utils/cleanupOldReports'
import convertFloatToTime from '@/utils/convertFloatToTime'
import { useTranslations } from '../_layout'
import { enUS, es, ja, zhCN, ptBR } from 'date-fns/locale'
import useMyStore from '@/store/store'

const localeMap: Record<string, Locale> = {
  en: enUS,
  es: es,
  ja: ja,
  zh: zhCN,
  ptBR: ptBR,
}

const reportPage = () => {
  const { bottom, top } = useSafeAreaInsets()
  const [modalVisible, setModalVisible] = useState(false)
  const router = useRouter()
  const i18n = useTranslations()
  const lang = useMyStore((state) => state.language)

  useEffect(() => {
    cleanupOldReports()
  }, [])
  console.log('report page')

  const currentSvcYr = () => {
    const now = new Date()
    if (isBefore(now, new Date(now.getFullYear(), 8, 1))) {
      return now.getFullYear()
    } else {
      return now.getFullYear() + 1
    }
  }

  const svcYrs = {
    currentYr: currentSvcYr(),
    previousYr: currentSvcYr() - 1,
  }

  const [selectedYr, setSelectedYr] = useState(svcYrs.currentYr)
  console.log(selectedYr)

  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['reports'],
    queryFn: () => {
      const result = db.select().from(Report).all()
      return result
    },
  })

  const filteredData =
    data?.filter((report) => {
      return (
        isAfter(report.date, new Date(selectedYr - 1, 8, 1)) &&
        isBefore(report.date, new Date(selectedYr, 8, 1))
      )
    }) || []

  // Calculate totals
  const totals = filteredData?.reduce(
    (acc, curr) => ({
      bs: acc.bs + (curr.bs || 0),
      hrs: acc.hrs + (curr.hrs || 0),
    }),
    { bs: 0, hrs: 0 }
  ) || { bs: 0, hrs: 0 }

  return (
    <SafeAreaView style={[styles.container]} edges={['bottom']}>
      <Tabs.Screen
        options={{
          headerTitle: '',
          headerStyle: {
            backgroundColor: Colors.primary50,
            height: top + 45,
          },
          headerLeft: () => (
            <Pressable
              style={styles.headerLeftBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setModalVisible((prev) => !prev)
              }}
            >
              <FontAwesome6 name="add" size={13} color={Colors.primary900} />
              <Text style={styles.btnTextLeft}>
                {i18n.t('reports.tabHeaderLeft')}
              </Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              style={styles.headerRightBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                router.navigate('/(options)/optionsPage')
              }}
            >
              <Text style={styles.btnTextRight}>
                {i18n.t('reports.tabHeaderRight')}
              </Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={{
          flex: 1,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.emerald300}
            colors={[Colors.emerald300]}
            progressBackgroundColor={Colors.emerald50}
          />
        }
        contentContainerStyle={{
          paddingBottom: Platform.OS === 'android' ? bottom + 100 : bottom + 75,
          paddingTop: 10,
          backgroundColor: Colors.primary50,
        }}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        <View style={styles.stickyHeader}>
          <View style={styles.totalRow}>
            <View style={styles.totalValues}>
              <Text style={styles.totalYrHeader}>
                {i18n.t('reports.stickyHeader1') + selectedYr}
              </Text>
              <Text style={styles.totalLabel}>
                {i18n.t('reports.stickyHeader2')}
              </Text>
              <Text style={styles.totalText}>
                {convertFloatToTime(totals.hrs)}
              </Text>
            </View>
            <View style={[styles.totalValues, { alignItems: 'flex-end' }]}>
              <Text style={styles.totalLabel}>
                {i18n.t('reports.stickyHeader3')}
              </Text>
              <Text style={styles.remainingHrs}>
                {600 - totals.hrs <= 0
                  ? '0h 0m'
                  : convertFloatToTime(600 - totals.hrs)}
              </Text>
              <Text style={[styles.totalLabel, { textAlign: 'right' }]}>
                {i18n.t('reports.stickyHeader4')}
              </Text>
              <Text style={styles.remainingHrs}>
                {selectedYr === svcYrs.previousYr
                  ? `0${i18n.t('reports.stickyDays')}`
                  : formatDistanceStrict(
                      new Date(),
                      new Date(selectedYr, 8, 1, 0, 0, 0),
                      {
                        unit: 'day',
                        locale: localeMap[lang] || enUS,
                      }
                    )}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.dropDownContainer}>
          <SvcYrDropdown
            selectedYr={selectedYr}
            setItem={setSelectedYr}
            svcYrs={svcYrs}
          />
        </View>

        {!filteredData || filteredData.length === 0 ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: 'IBM-SemiBold',
                fontSize: 18,
                color: Colors.primary300,
                marginTop: 150,
              }}
            >
              {selectedYr === svcYrs.previousYr
                ? i18n.t('reports.backgroundTxt1')
                : i18n.t('reports.backgroundTxt2')}
            </Text>
          </View>
        ) : (
          <ReportTable data={filteredData} />
        )}
      </ScrollView>

      <ModalForm
        setModalVisible={setModalVisible}
        modalVisible={modalVisible}
        svcYrs={svcYrs}
      />
    </SafeAreaView>
  )
}

export default reportPage
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary50 },
  btnTextLeft: {
    color: Colors.emerald800,
    fontFamily: 'IBM-Medium',
    fontSize: 18,
  },
  btnTextRight: {
    color: Colors.emerald800,
    fontFamily: 'IBM-Medium',
    fontSize: 18,
  },
  headerLeftBtn: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
    marginLeft: 10,
    padding: 5,
  },
  headerRightBtn: {
    marginRight: 15,
    padding: 5,
  },
  stickyHeader: {
    backgroundColor: Colors.primary50,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: Colors.emerald200,
    padding: 10,
    borderRadius: 8,
    shadowColor: Colors.primary500,
    shadowOffset: { width: -1, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.primary300,
  },
  totalValues: {
    flexDirection: 'column',
    flex: 1,
    // backgroundColor: Colors.primary400,
    gap: 3,
  },
  totalYrHeader: {
    fontFamily: 'Lora-SemiBoldItalic',
    fontSize: 14,
    color: Colors.emerald900,
  },
  totalLabel: {
    fontFamily: 'Lora-Regular',
    fontSize: 13,
    color: Colors.emerald900,
  },
  totalText: {
    fontFamily: 'Lora-SemiBoldItalic',
    fontSize: 35,
    color: Colors.emerald900,
  },
  remainingHrs: {
    fontFamily: 'Lora-SemiBoldItalic',
    fontSize: 20,
    color: Colors.emerald900,
  },
  dropDownContainer: {
    width: '90%',
    marginHorizontal: 'auto',
    marginBottom: 10,
  },
})
