import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useLayoutEffect,
  useCallback,
} from 'react'
import {
  StyleSheet,
  View,
  Pressable,
  Platform,
} from 'react-native'
import Text from '@/components/Text'
import { useNavigation, useRouter, useFocusEffect } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { FontAwesome6 } from '@expo/vector-icons'
import { Colors } from '@/constants/Colors'
import ModalForm from '@/components/reportComponents/ReportModal'
import { db } from '@/drizzle/db'
import { Report } from '@/drizzle/schema'
import { useQuery } from '@tanstack/react-query'
import { FlashList, FlashListRef } from '@shopify/flash-list'
import {
  buildReportTableItems,
  ReportTableItemView,
  ReportTableListItem,
} from '@/components/reportComponents/reportTable'
import SvcYrDropdown from '@/components/reportComponents/SvcYrDropdown'
import { isAfter, isBefore, formatDistanceStrict, Locale } from 'date-fns'
import { cleanupOldReports } from '@/utils/cleanupOldReports'
import convertFloatToTime from '@/utils/convertFloatToTime'
import { useTranslations } from '@/app/_layout'
import { enUS, es, ja, zhCN, ptBR, fr, ko } from 'date-fns/locale'
import useMyStore from '@/store/store'
import Ionicons from '@expo/vector-icons/Ionicons'
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated'

const headerTransition = LinearTransition.duration(450)

const localeMap: Record<string, Locale> = {
  en: enUS,
  es: es,
  ja: ja,
  zh: zhCN,
  ptBR: ptBR,
  fr: fr,
  ko: ko,
}

const fsTypeList = [
  { type: 'hh', label: 'house to house', color: Colors.emerald300 },
  { type: 'cart', label: 'cart', color: Colors.rose400 },
  { type: 'publ', label: 'public', color: Colors.sky500 },
  { type: 'inf', label: 'informal', color: Colors.lemon500 },
]

type ReportsListItem =
  | { type: 'stats'; id: 'stats' }
  | { type: 'year'; id: 'year' }
  | { type: 'empty'; id: 'empty' }
  | ReportTableListItem

const currentSvcYr = () => {
  const now = new Date()
  if (isBefore(now, new Date(now.getFullYear(), 8, 1))) {
    return now.getFullYear()
  } else {
    return now.getFullYear() + 1
  }
}

const reportPage = () => {
  const { bottom, top } = useSafeAreaInsets()
  const [modalVisible, setModalVisible] = useState(false)
  const listRef = useRef<FlashListRef<ReportsListItem>>(null)
  const router = useRouter()
  const navigation = useNavigation()
  const i18n = useTranslations()
  const lang = useMyStore((state) => state.language)
  const [headerMinimized, setHeaderMinimized] = useState(true)

  useEffect(() => {
    cleanupOldReports()
  }, [])

  const svcYrs = useMemo(
    () => ({
      currentYr: currentSvcYr(),
      previousYr: currentSvcYr() - 1,
    }),
    [],
  )

  const [selectedYr, setSelectedYr] = useState(svcYrs.currentYr)

  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['reports'],
    queryFn: () => {
      const result = db.select().from(Report).all()
      return result
    },
  })

  const filteredData = useMemo(() => {
    return (
      data?.filter((report) => {
        return (
          isAfter(report.date, new Date(selectedYr - 1, 8, 1)) &&
          isBefore(report.date, new Date(selectedYr, 8, 1))
        )
      }) || []
    )
  }, [data, selectedYr])

  // Calculate totals
  const totals = useMemo(
    () =>
      filteredData?.reduce(
        (acc, curr) => ({
          bs: acc.bs + (curr.bs || 0),
          hrs: acc.hrs + (curr.hrs || 0),
          hhHrs: acc.hhHrs + (curr.type === 'hh' ? curr.hrs || 0 : 0),
          cartHrs: acc.cartHrs + (curr.type === 'cart' ? curr.hrs || 0 : 0),
          publHrs: acc.publHrs + (curr.type === 'publ' ? curr.hrs || 0 : 0),
          infHrs: acc.infHrs + (curr.type === 'inf' ? curr.hrs || 0 : 0),
        }),
        { bs: 0, hrs: 0, hhHrs: 0, cartHrs: 0, publHrs: 0, infHrs: 0 },
      ) || { bs: 0, hrs: 0, hhHrs: 0, cartHrs: 0, publHrs: 0, infHrs: 0 },
    [filteredData],
  )

  const creditTotals = useMemo(
    () =>
      filteredData?.reduce(
        (acc, curr) => ({
          credit: acc.credit + (curr.credit || 0),
        }),
        { credit: 0 },
      ) || { credit: 0 },
    [filteredData],
  )

  const tableItems = useMemo(
    () => buildReportTableItems(filteredData, lang),
    [filteredData, lang],
  )

  const listData = useMemo<ReportsListItem[]>(() => {
    if (!filteredData.length) {
      return [
        { type: 'stats', id: 'stats' },
        { type: 'year', id: 'year' },
        { type: 'empty', id: 'empty' },
      ]
    }
    return [
      { type: 'stats', id: 'stats' },
      { type: 'year', id: 'year' },
      ...tableItems,
    ]
  }, [filteredData.length, tableItems])

  const scrollBottomPadding = Platform.OS === 'android' ? bottom + 100 : 80
  const fabBottom = Platform.OS === 'android' ? 95 : 100
  const pendingScrollRef = useRef<'instant' | 'animated' | null>(null)
  const prevReportCountRef = useRef<number | null>(null)

  const scrollToBottom = (animated: boolean) => {
    listRef.current?.scrollToEnd({ animated })
  }

  useFocusEffect(
    useCallback(() => {
      pendingScrollRef.current = 'instant'
      const timeout = setTimeout(() => {
        scrollToBottom(false)
        pendingScrollRef.current = null
      }, 100)
      return () => {
        clearTimeout(timeout)
        pendingScrollRef.current = null
      }
    }, []),
  )

  useEffect(() => {
    const prevCount = prevReportCountRef.current
    prevReportCountRef.current = filteredData.length
    if (prevCount !== null && filteredData.length > prevCount) {
      pendingScrollRef.current = 'animated'
      const timeout = setTimeout(() => {
        scrollToBottom(true)
        pendingScrollRef.current = null
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [filteredData.length])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerShadowVisible: false,
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
          <Text style={styles.btnTextLeft}>
            {i18n.t('reports.tabHeaderLeft')}
          </Text>
        </Pressable>
      ),
      headerRight: () => (
        <Pressable
          style={styles.headerRightBtn}
          onPress={() => {
            router.navigate('/(options)/optionsPage')
          }}
        >
          <Text style={styles.btnTextRight}>
            {i18n.t('reports.tabHeaderRight')}
          </Text>
        </Pressable>
      ),
    })
  }, [navigation, top, i18n, router])

  const renderItem = useCallback(
    ({ item }: { item: ReportsListItem }) => {
      if (item.type === 'stats') {
        return (
          <Animated.View
            style={[
              styles.stickyHeader,
              headerMinimized && styles.stickyHeaderMinimized,
            ]}
            layout={headerTransition}
          >
            <Animated.View
              style={[
                styles.totalRow,
                { overflow: 'hidden' },
                headerMinimized && styles.totalRowMinimized,
              ]}
              layout={headerTransition}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                {headerMinimized ? (
                  <Animated.View
                    key="minimized-title"
                    entering={FadeIn.duration(280)}
                    exiting={FadeOut.duration(200)}
                  >
                    <Text
                      style={[styles.totalLabel, { fontFamily: 'IBM-Bold' }]}
                    >
                      {i18n.t('reports.stickyHeader5')}
                    </Text>
                    <Text style={[styles.remainingHrs, { fontSize: 23 }]}>
                      {convertFloatToTime(creditTotals.credit + totals.hrs)}
                    </Text>
                  </Animated.View>
                ) : (
                  <Animated.View
                    key="expanded-title"
                    entering={FadeIn.duration(280)}
                    exiting={FadeOut.duration(200)}
                  >
                    <Text style={styles.totalYrHeader}>
                      {i18n.t('reports.stickyHeader1') + selectedYr}
                    </Text>
                  </Animated.View>
                )}
                <Pressable
                  onPress={() => {
                    setHeaderMinimized((prev) => !prev)
                  }}
                >
                  <Ionicons
                    name={headerMinimized ? 'chevron-down' : 'chevron-up'}
                    size={23}
                    color={Colors.primary950}
                    style={{ marginRight: 5 }}
                  />
                </Pressable>
              </View>
              {!headerMinimized && (
                <Animated.View
                  entering={FadeIn.duration(320)}
                  exiting={FadeOut.duration(250)}
                  layout={headerTransition}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginVertical: 5,
                      paddingHorizontal: 5,
                    }}
                  >
                    <View style={styles.totalValues}>
                      <Text style={styles.totalLabel}>
                        {i18n.t('reports.stickyHeader2')}
                      </Text>
                      <Text style={styles.totalText}>
                        {convertFloatToTime(totals.hrs)}
                      </Text>
                    </View>
                    <View style={styles.totalValues}>
                      <Text
                        style={[
                          styles.totalLabel,
                          { color: Colors.purple700, textAlign: 'right' },
                        ]}
                      >
                        {i18n.t('reports.stickyHeader3')}
                      </Text>
                      <Text
                        style={[
                          styles.totalText,
                          { color: Colors.purple700, textAlign: 'right' },
                        ]}
                      >
                        {convertFloatToTime(creditTotals.credit)}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      marginVertical: 5,
                      borderTopWidth: 1,
                      borderBottomWidth: 1,
                      borderColor: Colors.primary300,
                      borderRadius: 8,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-around',
                        paddingVertical: 5,
                      }}
                    >
                      {fsTypeList.map((fsType) => (
                        <View
                          key={fsType.type}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 5,
                          }}
                        >
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 100,
                              backgroundColor: fsType.color,
                            }}
                          />
                          <Text style={{ fontFamily: 'IBM-Bold', fontSize: 14 }}>
                            {fsType.type === 'hh'
                              ? 'HH'
                              : fsType.type === 'cart'
                                ? 'Cart'
                                : fsType.type === 'publ'
                                  ? 'Public'
                                  : 'Informal'}
                          </Text>
                        </View>
                      ))}
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-around',
                        paddingVertical: 5,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: 'IBM-Medium',
                          fontSize: 14,
                          flex: 1,
                          textAlign: 'center',
                        }}
                      >
                        {convertFloatToTime(totals.hhHrs)}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'IBM-Medium',
                          fontSize: 14,
                          flex: 1,
                          textAlign: 'center',
                        }}
                      >
                        {convertFloatToTime(totals.cartHrs)}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'IBM-Medium',
                          fontSize: 14,
                          flex: 1,
                          textAlign: 'center',
                        }}
                      >
                        {convertFloatToTime(totals.publHrs)}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'IBM-Medium',
                          fontSize: 14,
                          flex: 1,
                          textAlign: 'center',
                        }}
                      >
                        {convertFloatToTime(totals.infHrs)}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginTop: 3,
                      paddingHorizontal: 5,
                    }}
                  >
                    <View>
                      <Text
                        style={[styles.totalLabel, { fontFamily: 'IBM-Bold' }]}
                      >
                        {i18n.t('reports.stickyHeader5')}
                      </Text>
                      <Text style={[styles.remainingHrs, { fontSize: 23 }]}>
                        {convertFloatToTime(creditTotals.credit + totals.hrs)}
                      </Text>
                    </View>
                    <View>
                      <Text
                        style={[styles.totalLabel, { textAlign: 'right' }]}
                      >
                        {i18n.t('reports.stickyHeader4')}
                      </Text>
                      <Text
                        style={[
                          styles.remainingHrs,
                          { textAlign: 'right', fontSize: 16 },
                        ]}
                      >
                        {selectedYr === svcYrs.previousYr
                          ? `0${i18n.t('reports.stickyDays')}`
                          : formatDistanceStrict(
                              new Date(),
                              new Date(selectedYr, 8, 1, 0, 0, 0),
                              {
                                unit: 'day',
                                locale: localeMap[lang] || enUS,
                              },
                            )}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              )}
            </Animated.View>
          </Animated.View>
        )
      }

      if (item.type === 'year') {
        return (
          <View style={styles.dropDownContainer}>
            <SvcYrDropdown
              selectedYr={selectedYr}
              setItem={setSelectedYr}
              svcYrs={svcYrs}
            />
          </View>
        )
      }

      if (item.type === 'empty') {
        return (
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
        )
      }

      return <ReportTableItemView item={item} />
    },
    [
      creditTotals.credit,
      headerMinimized,
      i18n,
      lang,
      selectedYr,
      svcYrs,
      totals.cartHrs,
      totals.hhHrs,
      totals.hrs,
      totals.infHrs,
      totals.publHrs,
    ],
  )

  const getItemType = useCallback((item: ReportsListItem) => item.type, [])

  return (
    <SafeAreaView
      style={[styles.container]}
      collapsable={false}
      edges={Platform.OS === 'android' ? ['bottom'] : []}
    >
      <FlashList
        ref={listRef}
        data={listData}
        renderItem={renderItem}
        getItemType={getItemType}
        keyExtractor={(item) => item.id}
        stickyHeaderIndices={[0]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          const mode = pendingScrollRef.current
          if (!mode) return
          scrollToBottom(mode === 'animated')
        }}
        refreshing={isRefetching}
        onRefresh={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          refetch()
        }}
        contentContainerStyle={{
          paddingBottom: scrollBottomPadding,
          paddingTop: 10,
          backgroundColor: Colors.primary50,
        }}
      />

      <ModalForm
        setModalVisible={setModalVisible}
        modalVisible={modalVisible}
        svcYrs={svcYrs}
      />
      <Pressable
        style={{
          position: 'absolute',
          bottom: fabBottom,
          backgroundColor: Colors.emerald900,
          borderRadius: 100,
          borderWidth: 2,
          borderColor: Colors.primary300,
          opacity: 0.85,
          width: 58,
          height: 58,
          alignSelf: 'flex-end',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 10,
        }}
        onPress={() => {
          router.push('/remindersPage')
        }}
      >
        <FontAwesome6
          name="pen-to-square"
          size={24}
          color={Colors.emerald400}
        />
      </Pressable>
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
    lineHeight: 20,
  },
  btnTextRight: {
    color: Colors.emerald800,
    fontFamily: 'IBM-Medium',
    fontSize: 18,
    lineHeight: 20,
  },
  headerLeftBtn: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginVertical: -8,
  },
  headerRightBtn: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginVertical: -8,
  },
  stickyHeader: {
    backgroundColor: Colors.primary50,
    paddingVertical: 5,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderBottomColor: Colors.primary100,
    borderBottomWidth: 2,
    shadowColor: Colors.primary500,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.33,
    shadowRadius: 4,
    elevation: 5,
  },
  stickyHeaderMinimized: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    borderBottomWidth: 1,
  },
  totalRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary100,
    padding: 10,
    borderRadius: 10,
    shadowColor: Colors.primary950,
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 4,
    shadowRadius: 4,
    elevation: 5,
  },
  totalRowMinimized: {
    shadowOpacity: 0.18,
    shadowRadius: 1,
    elevation: 1,
  },
  totalValues: {
    flexDirection: 'column',
    // backgroundColor: Colors.primary400,
    gap: 1,
  },
  totalYrHeader: {
    fontFamily: 'IBM-Bold',
    fontSize: 14,
    color: Colors.primary900,
  },
  totalLabel: {
    fontFamily: 'IBM-Medium',
    fontSize: 13,
    color: Colors.primary900,
  },
  totalText: {
    fontFamily: 'IBM-Bold',
    fontSize: 18,
    color: Colors.primary900,
    fontVariant: ['tabular-nums'],
  },
  remainingHrs: {
    fontFamily: 'IBM-Bold',
    fontSize: 17,
    color: Colors.primary900,
    fontVariant: ['tabular-nums'],
  },
  dropDownContainer: {
    width: '90%',
    marginHorizontal: 'auto',
    marginBottom: 10,
  },
})
