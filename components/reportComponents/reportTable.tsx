import { StyleSheet, Text, View } from 'react-native'
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
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
  }),
  columnHelper.accessor('bs', {
    header: () => <Text style={styles.headerTxt}>BS</Text>,
    cell: (info) => <Text>{info.getValue()}</Text>,
  }),
  columnHelper.accessor('hrs', {
    header: () => <Text style={styles.headerTxt}>Hrs</Text>,
    cell: (info) => <Text>{info.getValue()}</Text>,
  }),
]

type TProps = {
  data: TReport[]
}

const reportTable = ({ data }: TProps) => {
  const table = useReactTable({
    columns,
    data: data || [],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [
        {
          id: 'date',
          desc: false,
        },
      ],
    },
  })

  return (
    <View style={styles.table}>
      {table.getHeaderGroups().map((headerGroup) => (
        <View key={headerGroup.id} style={styles.row}>
          {headerGroup.headers.map((header, index) => {
            return (
              <View
                key={header.id}
                style={[styles.headerCell, { flex: index === 0 ? 2 : 1 }]}
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
              </View>
            )
          })}
        </View>
      ))}
      {table.getRowModel().rows.map((row) => (
        <View key={row.id} style={styles.row}>
          {row.getVisibleCells().map((cell, index) => {
            return (
              <View
                key={cell.id}
                style={[styles.headerCell, { flex: index === 0 ? 2 : 1 }]}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </View>
            )
          })}
        </View>
      ))}
    </View>
  )
}
export default reportTable
const styles = StyleSheet.create({
  table: {
    borderWidth: 2,
    borderColor: 'green',
    width: '90%',
    marginHorizontal: 'auto',
  },
  row: {
    flexDirection: 'row',
    backgroundColor: 'lightblue',
  },
  headerCell: {
    padding: 5,
    borderWidth: 1,
    borderColor: 'black',
    flex: 1,
  },
  headerTxt: {
    color: 'black',
    fontFamily: 'IBM-SemiBold',
    fontSize: 20,
  },
})
