import { memo, useCallback } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import Text from '@/components/Text'
import { db } from '@/drizzle/db'
import { eq } from 'drizzle-orm'
import { Report, TReport } from '@/drizzle/schema'
import { useQueryClient } from '@tanstack/react-query'
import { format, Locale } from 'date-fns'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { Colors } from '@/constants/Colors'
import { toast } from 'sonner-native'

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import convertFloatToTime from '@/utils/convertFloatToTime'
import useMyStore from '@/store/store'
import { enUS, es, ja, zhCN, ptBR, fr, ko } from 'date-fns/locale'
import { useTranslations } from '@/app/_layout'

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
] as const

export type ReportTableListItem =
  | { type: 'monthHeader'; id: string; title: string }
  | { type: 'colHeader'; id: string }
  | { type: 'row'; id: string; report: TReport }
  | {
      type: 'subtotal'
      id: string
      bs: number
      hrs: number
      credit: number
      hhHrs: number
      cartHrs: number
      publHrs: number
      infHrs: number
    }

export const buildReportTableItems = (
  data: TReport[],
  lang: string,
): ReportTableListItem[] => {
  const months = new Map<string, TReport[]>()
  const sorted = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  for (const report of sorted) {
    const key = format(report.date, 'yyyy-MM')
    const existing = months.get(key)
    if (existing) {
      existing.push(report)
    } else {
      months.set(key, [report])
    }
  }

  const items: ReportTableListItem[] = []
  const locale = localeMap[lang] || enUS

  for (const [key, reports] of [...months.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const [year, month] = key.split('-').map(Number)
    items.push({
      type: 'monthHeader',
      id: `month-${key}`,
      title: format(new Date(year, month - 1, 1), 'MMMM yyyy', { locale }),
    })
    items.push({ type: 'colHeader', id: `cols-${key}` })
    for (const report of reports) {
      items.push({ type: 'row', id: `row-${report.id}`, report })
    }

    items.push({
      type: 'subtotal',
      id: `sub-${key}`,
      bs: reports.reduce((sum, row) => sum + (row.bs || 0), 0),
      hrs: reports.reduce((sum, row) => sum + (row.hrs || 0), 0),
      credit: reports.reduce((sum, row) => sum + (row.credit || 0), 0),
      hhHrs: reports.reduce(
        (sum, row) => sum + (row.type === 'hh' ? row.hrs || 0 : 0),
        0,
      ),
      cartHrs: reports.reduce(
        (sum, row) => sum + (row.type === 'cart' ? row.hrs || 0 : 0),
        0,
      ),
      publHrs: reports.reduce(
        (sum, row) => sum + (row.type === 'publ' ? row.hrs || 0 : 0),
        0,
      ),
      infHrs: reports.reduce(
        (sum, row) => sum + (row.type === 'inf' ? row.hrs || 0 : 0),
        0,
      ),
    })
  }

  return items
}

const TypeDot = ({ color }: { color: string }) => (
  <View
    style={{
      backgroundColor: color,
      width: 8,
      height: 8,
      borderRadius: 100,
    }}
  />
)

export const ReportTableItemView = memo(function ReportTableItemView({
  item,
}: {
  item: ReportTableListItem
}) {
  const queryClient = useQueryClient()
  const i18n = useTranslations()
  const lang = useMyStore((state) => state.language)
  const { showActionSheetWithOptions } = useActionSheet()

  const handleDeleteSingleReport = useCallback(
    async (rowId: number) => {
      await db.delete(Report).where(eq(Report.id, rowId))
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      toast.custom(
        <View
          style={{
            alignSelf: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            backgroundColor: Colors.primary950,
            width: 240,
            paddingHorizontal: 8,
            paddingVertical: 10,
            borderRadius: 8,
          }}
        >
          <MaterialCommunityIcons
            name="delete"
            size={23}
            color={Colors.rose500}
          />
          <Text
            style={{
              fontFamily: 'IBM-Regular',
              fontSize: 15,
              color: Colors.white,
            }}
          >
            {i18n.t('reportsModal.toastDelete')}
          </Text>
        </View>,
        {
          duration: 3000,
        },
      )
    },
    [i18n, queryClient],
  )

  const handleActionSheet = useCallback(
    (rowId: number, rowDate: Date) => {
      const title = format(rowDate, 'dd MMM yyyy')
      const options = [
        i18n.t('reports.actionDelete'),
        i18n.t('reports.actionCancel'),
      ]
      showActionSheetWithOptions(
        {
          title,
          options,
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1,
        },
        (selectedIndex: number | undefined) => {
          if (selectedIndex === 0) {
            handleDeleteSingleReport(rowId)
          }
        },
      )
    },
    [handleDeleteSingleReport, i18n, showActionSheetWithOptions],
  )

  if (item.type === 'monthHeader') {
    return (
      <View style={styles.monthWrap}>
        <View style={styles.monthHeader}>
          <Text style={styles.monthTitle}>{item.title}</Text>
        </View>
      </View>
    )
  }

  if (item.type === 'colHeader') {
    return (
      <View style={styles.monthWrap}>
        <View style={styles.row}>
          <View style={[styles.headerCell, styles.column]}>
            <Text style={styles.headerTxt}>
              {i18n.t('reports.tableHeadDate')}
            </Text>
          </View>
          <View style={[styles.headerCell, styles.typeColumn]}>
            <Text style={styles.headerTxt}>BS</Text>
          </View>
          <View style={[styles.headerCell, styles.typeColumn]} />
          <View style={[styles.headerCell, styles.column]}>
            <Text style={styles.headerTxt}>Hrs</Text>
          </View>
          <View style={[styles.headerCell, styles.column]}>
            <Text style={[styles.headerTxt, { color: Colors.purple700 }]}>
              {i18n.t('reports.tableHeadCredit')}
            </Text>
          </View>
          <View style={[styles.headerCell, styles.column]}>
            <Text
              style={[styles.headerTxt, { fontSize: 10, color: Colors.purple700 }]}
            >
              {i18n.t('reports.tableHeadComments')}
            </Text>
          </View>
        </View>
      </View>
    )
  }

  if (item.type === 'row') {
    const { report } = item
    const typeColor = fsTypeList.find((t) => t.type === report.type)?.color
    return (
      <View style={styles.monthWrap}>
        <Pressable
          style={({ pressed }) => [
            styles.row,
            {
              backgroundColor: pressed ? Colors.primary100 : Colors.primary50,
            },
          ]}
          onLongPress={() => handleActionSheet(report.id, report.date)}
        >
          <View style={[styles.cell, styles.column]}>
            <Text style={styles.cellTxt}>
              {format(report.date, 'dd MMM', {
                locale: localeMap[lang] || enUS,
              })}
            </Text>
          </View>
          <View style={[styles.cell, styles.typeColumn]}>
            <Text style={styles.cellTxt}>{report.bs}</Text>
          </View>
          <View style={[styles.cell, styles.typeColumn]}>
            <View
              style={{
                backgroundColor: typeColor,
                width: 8,
                height: 8,
                borderRadius: 100,
                alignSelf: 'center',
                marginTop: 5,
              }}
            />
          </View>
          <View style={[styles.cell, styles.column]}>
            <Text style={styles.cellTxt}>
              {convertFloatToTime(report.hrs || 0)}
            </Text>
          </View>
          <View style={[styles.cell, styles.column]}>
            <Text style={[styles.cellTxt, { color: Colors.purple700 }]}>
              {convertFloatToTime(report.credit || 0)}
            </Text>
          </View>
          <View style={[styles.cell, styles.column]}>
            <Text
              style={[styles.cellTxt, { fontSize: 10, color: Colors.purple700 }]}
            >
              {report.comment || ''}
            </Text>
          </View>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={[styles.monthWrap, { paddingBottom: 20 }]}>
      <View style={styles.subtotalContainer}>
        <View style={styles.subtotalRow}>
          <View style={[styles.cell, styles.column]}>
            <Text style={[styles.subtotalText, { fontSize: 11 }]}>
              {i18n.t('reports.tableSubtotalLabel')}
            </Text>
          </View>
          <View style={[styles.cell, { flex: 0.3 }]}>
            <Text style={styles.subtotalText}>{item.bs}</Text>
          </View>
          <View style={[styles.cell, { flex: 0.3 }]} />
          <View style={[styles.cell, styles.column]}>
            <Text style={styles.subtotalText}>
              {convertFloatToTime(item.hrs)}
            </Text>
          </View>
          <View style={[styles.cell, styles.column]}>
            <Text style={[styles.subtotalText, { color: Colors.purple700 }]}>
              {convertFloatToTime(item.credit)}
            </Text>
          </View>
          <View style={[styles.cell, styles.column]} />
        </View>
        <View style={[styles.subtotalRow, { backgroundColor: Colors.primary50 }]}>
          {fsTypeList.map((fsType) => (
            <View
              key={fsType.type}
              style={[
                styles.cell,
                styles.column,
                {
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 2,
                },
              ]}
            >
              <TypeDot color={fsType.color} />
              <Text style={{ fontSize: 11 }}>
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
          style={[
            styles.subtotalRow,
            {
              backgroundColor: Colors.primary50,
              borderBottomColor: Colors.primary500,
              borderBottomWidth: 1,
            },
          ]}
        >
          <View
            style={[
              styles.cell,
              styles.column,
              { alignItems: 'center', justifyContent: 'center' },
            ]}
          >
            <Text style={{ fontSize: 11 }}>
              {convertFloatToTime(item.hhHrs)}
            </Text>
          </View>
          <View
            style={[
              styles.cell,
              styles.column,
              { alignItems: 'center', justifyContent: 'center' },
            ]}
          >
            <Text style={{ fontSize: 11 }}>
              {convertFloatToTime(item.cartHrs)}
            </Text>
          </View>
          <View
            style={[
              styles.cell,
              styles.column,
              { alignItems: 'center', justifyContent: 'center' },
            ]}
          >
            <Text style={{ fontSize: 11 }}>
              {convertFloatToTime(item.publHrs)}
            </Text>
          </View>
          <View
            style={[
              styles.cell,
              styles.column,
              { alignItems: 'center', justifyContent: 'center' },
            ]}
          >
            <Text style={{ fontSize: 11 }}>
              {convertFloatToTime(item.infHrs)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  monthWrap: {
    width: '90%',
    marginHorizontal: 'auto',
  },
  monthHeader: {
    backgroundColor: Colors.primary200,
    padding: 10,
    paddingBottom: 2,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  monthTitle: {
    fontFamily: 'IBM-Bold',
    fontSize: 16,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary200,
  },
  headerCell: {
    padding: 10,
    paddingHorizontal: 5,
    backgroundColor: Colors.primary200,
  },
  cell: {
    padding: 10,
    paddingHorizontal: 5,
    justifyContent: 'center',
  },
  cellTxt: {
    fontFamily: 'IBM-Regular',
    fontSize: 14,
  },
  headerTxt: {
    fontFamily: 'IBM-SemiBold',
    fontSize: 12,
  },
  subtotalContainer: {
    flexDirection: 'column',
    borderTopWidth: 1,
    borderTopColor: Colors.primary500,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
  },
  subtotalRow: {
    flexDirection: 'row',
    backgroundColor: Colors.primary200,
    borderTopColor: Colors.primary500,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  subtotalText: {
    fontFamily: 'IBM-SemiBold',
    fontSize: 13,
  },
  column: {
    flex: 1,
  },
  typeColumn: {
    flex: 0.3,
  },
})
