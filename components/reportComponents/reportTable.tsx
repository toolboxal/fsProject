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
import { format } from 'date-fns'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { Colors } from '@/constants/Colors'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'

function convertFloatToTime(floatTime: number): string {
  const hours = Math.floor(floatTime)
  const minutes = Math.round((floatTime - hours) * 60)
  if (hours === 0 && minutes !== 0) {
    return `${minutes}m`
  } else if (hours === 0 && minutes === 0) {
    return '--'
  } else if (hours !== 0 && minutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${minutes}m`
}

const columnHelper = createColumnHelper<TReport>()

const columns = [
  columnHelper.accessor('date', {
    header: () => <Text style={styles.headerTxt}>Date</Text>,
    cell: (info) => {
      const date = info.getValue()
      const formattedDate = format(date!, 'dd MMM')
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

type TProps = {
  data: TReport[]
}

const ReportTable = ({ data }: TProps) => {
  const queryClient = useQueryClient()
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

  const handleActionSheet = (rowId: number) => {
    const options = ['Delete', 'Edit', 'Cancel']
    const destructiveButtonIndex = 0
    const cancelButtonIndex = 2
    showActionSheetWithOptions(
      {
        options,
        destructiveButtonIndex,
        cancelButtonIndex,
      },
      (selectedIndex: number | undefined) => {
        switch (selectedIndex) {
          case destructiveButtonIndex:
            handleDeleteSingleReport(rowId)
            break
          case 1:
            console.log('to edit')

            break
          case cancelButtonIndex:
            console.log('canceled')
        }
      }
    )
  }

  const handleDeleteSingleReport = async (rowId: number) => {
    console.log('to delete')
    await db.delete(Report).where(eq(Report.id, rowId))
    queryClient.invalidateQueries({ queryKey: ['reports'] })
  }

  return (
    <View style={styles.container}>
      {groupedRows.map((monthGroup) => (
        <View key={monthGroup.id} style={styles.monthContainer}>
          <View style={styles.monthHeader}>
            <Text style={styles.monthTitle}>
              {format(new Date(monthGroup.getValue('date')), 'MMMM yyyy')}
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
                  onPressIn={() => {
                    const rowId = row.original.id
                    handleActionSheet(rowId)
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
                <Text style={styles.subtotalText}>Subtotal</Text>
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
