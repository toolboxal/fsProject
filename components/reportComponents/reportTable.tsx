import { useMemo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getGroupedRowModel,
} from '@tanstack/react-table'
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

const columnHelper = createColumnHelper<TReport>()

type TProps = {
  data: TReport[]
}

const fsTypeList = [
  { type: 'hh', label: 'house to house', color: Colors.emerald300 },
  { type: 'cart', label: 'cart', color: Colors.rose400 },
  { type: 'publ', label: 'public', color: Colors.sky500 },
  { type: 'inf', label: 'informal', color: Colors.lemon500 },
]

const ReportTable = ({ data }: TProps) => {
  const queryClient = useQueryClient()
  const lang = useMyStore((state) => state.language)

  const localeMap: Record<string, Locale> = {
    en: enUS,
    es: es,
    ja: ja,
    zh: zhCN,
    ptBR: ptBR,
    fr: fr,
    ko: ko,
  }

  const i18n = useTranslations()

  const columns = useMemo(() => {
    return [
      columnHelper.accessor('date', {
        header: () => (
          <Text style={styles.headerTxt}>
            {i18n.t('reports.tableHeadDate')}
          </Text>
        ),
        cell: (info) => {
          const date = info.getValue()
          const formattedDate = format(date!, 'dd MMM', {
            locale: localeMap[lang] || enUS,
          })
          return <Text style={styles.cellTxt}>{formattedDate}</Text>
        },
        sortingFn: 'datetime',
        getGroupingValue: (row) => format(row.date!, 'yyyy-MM'),
      }),
      columnHelper.accessor('bs', {
        header: () => <Text style={styles.headerTxt}>BS</Text>,
        cell: (info) => <Text style={styles.cellTxt}>{info.getValue()}</Text>,
        aggregationFn: 'sum',
      }),
      columnHelper.accessor('type', {
        header: () => <Text style={styles.headerTxt}></Text>,
        cell: (info) => (
          // <Text style={styles.cellTxt}>
          //   {convertFloatToTime(info.getValue() || 0)}
          // </Text>
          <View
            style={{
              backgroundColor: fsTypeList.find(
                (item) => item.type === info.getValue()
              )?.color,
              width: 8,
              height: 8,
              borderRadius: 100,
              alignSelf: 'center',
              marginTop: 5,
            }}
          />
        ),
        // aggregationFn: 'sum',
      }),
      columnHelper.accessor('hrs', {
        header: () => <Text style={styles.headerTxt}>Hrs</Text>,
        cell: (info) => (
          <Text style={styles.cellTxt}>
            {convertFloatToTime(info.getValue() || 0)}
          </Text>
        ),
        aggregationFn: 'sum',
      }),
      columnHelper.accessor('credit', {
        header: () => (
          <Text style={[styles.headerTxt, { color: Colors.purple800 }]}>
            {i18n.t('reports.tableHeadCredit')}
          </Text>
        ),
        cell: (info) => (
          <Text style={[styles.cellTxt, { color: Colors.purple800 }]}>
            {convertFloatToTime(info.getValue() || 0)}
          </Text>
        ),
      }),
      columnHelper.accessor('comment', {
        header: () => (
          <Text
            style={[
              styles.headerTxt,
              { fontSize: 10, color: Colors.purple800 },
            ]}
          >
            {i18n.t('reports.tableHeadComments')}
          </Text>
        ),
        cell: (info) => (
          <Text
            style={[styles.cellTxt, { fontSize: 10, color: Colors.purple800 }]}
          >
            {info.getValue() || ''}
          </Text>
        ),
      }),
    ]
  }, [])

  const table = useReactTable({
    columns,
    data: data || [],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    initialState: {
      sorting: [
        {
          id: 'date',
          desc: false,
        },
      ],
      grouping: ['date'],
    },
    enableGrouping: true,
  })

  // Group rows by month
  const groupedRows = table
    .getGroupedRowModel()
    .rows.sort((a, b) => String(a.id).localeCompare(String(b.id)))
  const { showActionSheetWithOptions } = useActionSheet()

  const handleActionSheet = (rowId: number, rowDate: Date) => {
    const title = format(rowDate, 'dd MMM yyyy')
    const options = [
      i18n.t('reports.actionDelete'),
      i18n.t('reports.actionCancel'),
    ]
    const destructiveButtonIndex = 0
    const cancelButtonIndex = 1
    showActionSheetWithOptions(
      {
        title,
        // userInterfaceStyle: 'dark',
        options,
        destructiveButtonIndex,
        cancelButtonIndex,
      },
      (selectedIndex: number | undefined) => {
        switch (selectedIndex) {
          case destructiveButtonIndex:
            handleDeleteSingleReport(rowId)
            break
          case cancelButtonIndex:
            console.log('canceled')
        }
      }
    )
  }

  const handleDeleteSingleReport = async (rowId: number) => {
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
          backgroundColor: Colors.black,
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
      }
    )
  }

  return (
    <View style={styles.container}>
      {groupedRows.map((monthGroup) => (
        <View key={monthGroup.id} style={styles.monthContainer}>
          <View style={styles.monthHeader}>
            <Text style={styles.monthTitle}>
              {format(new Date(monthGroup.getValue('date')), 'MMMM yyyy', {
                locale: localeMap[lang] || enUS,
              })}
            </Text>
          </View>

          <View style={styles.table}>
            {/* Table Headers */}
            {table.getHeaderGroups().map((headerGroup) => (
              <View key={headerGroup.id} style={styles.row}>
                {headerGroup.headers.map((header) => (
                  <View
                    key={header.id}
                    style={[
                      styles.headerCell,
                      header.id === 'type' || header.id === 'bs'
                        ? styles.typeColumn
                        : styles.column,
                    ]}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </View>
                ))}
              </View>
            ))}

            {/* Table Rows */}
            {monthGroup.subRows
              .sort((a, b) => {
                const dateA = new Date(a.getValue('date'))
                const dateB = new Date(b.getValue('date'))
                return dateA.getTime() - dateB.getTime()
              })
              .map((row) => (
                <Pressable
                  key={row.id}
                  style={({ pressed }) => {
                    return [
                      styles.row,
                      {
                        backgroundColor: pressed
                          ? Colors.primary100
                          : Colors.primary50,
                      },
                    ]
                  }}
                  onLongPress={() => {
                    const { id: rowId, date: rowDate } = row.original
                    handleActionSheet(rowId, rowDate)
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <View
                      key={cell.id}
                      style={[
                        styles.cell,
                        cell.column.id === 'type' || cell.column.id === 'bs'
                          ? styles.typeColumn
                          : styles.column,
                      ]}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </View>
                  ))}
                </Pressable>
              ))}

            {/* Subtotal Row */}
            <View style={styles.subtotalContainer}>
              <View style={styles.subtotalRow}>
                <View style={[styles.cell, styles.column]}>
                  <Text style={[styles.subtotalText, { fontSize: 11 }]}>
                    {i18n.t('reports.tableSubtotalLabel')}
                  </Text>
                </View>
                <View style={[styles.cell, { flex: 0.3 }]}>
                  <Text style={styles.subtotalText}>
                    {monthGroup.getValue('bs')}
                  </Text>
                </View>
                <View style={[styles.cell, { flex: 0.3 }]} />
                <View style={[styles.cell, styles.column]}>
                  <Text style={styles.subtotalText}>
                    {convertFloatToTime(monthGroup.getValue('hrs'))}
                  </Text>
                </View>
                <View style={[styles.cell, styles.column]}>
                  <Text
                    style={[styles.subtotalText, { color: Colors.purple800 }]}
                  >
                    {convertFloatToTime(monthGroup.getValue('credit'))}
                  </Text>
                </View>
                <View style={[styles.cell, styles.column]} />
              </View>
              <View
                style={[
                  styles.subtotalRow,
                  { backgroundColor: Colors.primary50 },
                ]}
              >
                <View
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
                  <View
                    style={{
                      backgroundColor: fsTypeList[0].color,
                      width: 8,
                      height: 8,
                      borderRadius: 100,
                    }}
                  />
                  <Text style={{ fontSize: 11 }}>HH</Text>
                </View>
                <View
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
                  <View
                    style={{
                      backgroundColor: fsTypeList[1].color,
                      width: 8,
                      height: 8,
                      borderRadius: 100,
                    }}
                  />
                  <Text style={{ fontSize: 11 }}>Cart</Text>
                </View>
                <View
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
                  <View
                    style={{
                      backgroundColor: fsTypeList[2].color,
                      width: 8,
                      height: 8,
                      borderRadius: 100,
                    }}
                  />
                  <Text style={{ fontSize: 11 }}>Public</Text>
                </View>
                <View
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
                  <View
                    style={{
                      backgroundColor: fsTypeList[3].color,
                      width: 8,
                      height: 8,
                      borderRadius: 100,
                    }}
                  />
                  <Text style={{ fontSize: 11 }}>Informal</Text>
                </View>
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
                    {convertFloatToTime(
                      monthGroup.subRows
                        .filter((row) => row.original.type === 'hh')
                        .reduce((sum, row) => sum + (row.original.hrs || 0), 0)
                    )}
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
                    {convertFloatToTime(
                      monthGroup.subRows
                        .filter((row) => row.original.type === 'cart')
                        .reduce((sum, row) => sum + (row.original.hrs || 0), 0)
                    )}
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
                    {convertFloatToTime(
                      monthGroup.subRows
                        .filter((row) => row.original.type === 'publ')
                        .reduce((sum, row) => sum + (row.original.hrs || 0), 0)
                    )}
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
                    {convertFloatToTime(
                      monthGroup.subRows
                        .filter((row) => row.original.type === 'inf')
                        .reduce((sum, row) => sum + (row.original.hrs || 0), 0)
                    )}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  )
}

export default ReportTable

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 20,
  },
  monthContainer: {
    width: '90%',
    marginHorizontal: 'auto',
    // marginBottom: 20,
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
  table: {
    // borderWidth: StyleSheet.hairlineWidth,
    // borderColor: '#ddd',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
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
