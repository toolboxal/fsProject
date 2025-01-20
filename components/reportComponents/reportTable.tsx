import { StyleSheet, Text, View } from 'react-native'
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getGroupedRowModel,
} from '@tanstack/react-table'
import { TReport } from '@/drizzle/schema'
import { format } from 'date-fns'

const columnHelper = createColumnHelper<TReport>()

const columns = [
  columnHelper.accessor('date', {
    header: () => <Text style={styles.headerTxt}>Date</Text>,
    cell: (info) => {
      const date = info.getValue()
      const formattedDate = format(date!, 'dd MMM yyyy')
      return <Text>{formattedDate}</Text>
    },
    sortingFn: 'datetime',
    getGroupingValue: (row) => format(row.date!, 'yyyy-MM'),
  }),
  columnHelper.accessor('bs', {
    header: () => <Text style={styles.headerTxt}>BS</Text>,
    cell: (info) => <Text>{info.getValue()}</Text>,
    aggregationFn: 'sum',
  }),
  columnHelper.accessor('hrs', {
    header: () => <Text style={styles.headerTxt}>Hrs</Text>,
    cell: (info) => <Text>{info.getValue()}</Text>,
    aggregationFn: 'sum',
  }),
]

type TProps = {
  data: TReport[]
}

const ReportTable = ({ data }: TProps) => {
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
  const groupedRows = table.getGroupedRowModel().rows

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
                    style={[styles.headerCell, { flex: index === 0 ? 2 : 1 }]}
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
                <View key={row.id} style={styles.row}>
                  {row.getVisibleCells().map((cell, index) => (
                    <View
                      key={cell.id}
                      style={[styles.cell, { flex: index === 0 ? 2 : 1 }]}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </View>
                  ))}
                </View>
              ))}

            {/* Subtotal Row */}
            <View style={styles.subtotalRow}>
              <View style={[styles.cell, { flex: 2 }]}>
                <Text style={styles.subtotalText}>Subtotal</Text>
              </View>
              <View style={[styles.cell, { flex: 1 }]}>
                <Text style={styles.subtotalText}>
                  {monthGroup.getValue('bs')}
                </Text>
              </View>
              <View style={[styles.cell, { flex: 1 }]}>
                <Text style={styles.subtotalText}>
                  {monthGroup.getValue('hrs')}
                </Text>
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
    marginBottom: 20,
  },
  monthHeader: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerCell: {
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
  cell: {
    padding: 10,
  },
  headerTxt: {
    fontWeight: 'bold',
  },
  subtotalRow: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  subtotalText: {
    fontWeight: 'bold',
  },
})
