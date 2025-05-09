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
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import convertFloatToTime from '@/utils/convertFloatToTime'
import useMyStore from '@/store/store'
import { enUS, es, ja, zhCN, ptBR, fr, ko } from 'date-fns/locale'
import { useTranslations } from '@/app/_layout'

const columnHelper = createColumnHelper<TReport>()

type TProps = {
  data: TReport[]
}

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
      columnHelper.accessor('hrs', {
        header: () => <Text style={styles.headerTxt}>Hrs</Text>,
        cell: (info) => (
          <Text style={styles.cellTxt}>
            {convertFloatToTime(info.getValue() || 0)}
          </Text>
        ),
        aggregationFn: 'sum',
      }),
      columnHelper.display({
        id: 'actions',
        cell: (info) => (
          <View>
            <FontAwesome6
              name="ellipsis-vertical"
              size={18}
              color={Colors.primary300}
            />
          </View>
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
                {headerGroup.headers.map((header, index) => (
                  <View
                    key={header.id}
                    style={[styles.headerCell, { flex: index === 3 ? 0 : 1 }]}
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
                  onPress={() => {
                    const { id: rowId, date: rowDate } = row.original
                    handleActionSheet(rowId, rowDate)
                  }}
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <View
                      key={cell.id}
                      style={[styles.cell, { flex: index === 3 ? 0 : 1 }]}
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
            <View style={styles.subtotalRow}>
              <View style={[styles.cell, { flex: 1 }]}>
                <Text style={styles.subtotalText}>
                  {i18n.t('reports.tableSubtotalLabel')}
                </Text>
              </View>
              <View style={[styles.cell, { flex: 1 }]}>
                <Text style={styles.subtotalText}>
                  {monthGroup.getValue('bs')}
                </Text>
              </View>
              <View style={[styles.cell, { flex: 1 }]}>
                <Text style={styles.subtotalText}>
                  {convertFloatToTime(monthGroup.getValue('hrs'))}
                </Text>
              </View>
              <View style={{ flex: 0.25 }}></View>
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
    // borderBottomLeftRadius: 8,
    // borderBottomRightRadius: 8,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary200,
  },
  headerCell: {
    padding: 10,
    backgroundColor: Colors.primary200,
  },
  cell: {
    padding: 10,
  },
  cellTxt: {
    fontFamily: 'IBM-Regular',
    fontSize: 14,
  },
  headerTxt: {
    fontFamily: 'IBM-SemiBold',
    fontSize: 16,
  },
  subtotalRow: {
    flexDirection: 'row',
    backgroundColor: Colors.primary200,
    borderTopWidth: 1,
    borderTopColor: Colors.primary500,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  subtotalText: {
    fontFamily: 'IBM-SemiBold',
    fontSize: 15,
  },
})
