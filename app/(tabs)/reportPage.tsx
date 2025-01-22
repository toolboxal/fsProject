import { useState, useEffect } from 'react'
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native'
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
import { isAfter, isBefore } from 'date-fns'
import { cleanupOldReports } from '@/utils/cleanupOldReports'

const reportPage = () => {
  const { bottom, top } = useSafeAreaInsets()
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    cleanupOldReports()
  }, [])

  const currentSvcYr = () => {
    const now = new Date('2024-10-15')
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

  const { data } = useQuery({
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
  const totals = data?.reduce(
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
              <Text style={styles.btnText}>New Report</Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView
        contentContainerStyle={{
          paddingBottom: bottom + 75,
          paddingTop: 10,
          backgroundColor: Colors.primary50,
        }}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        <View style={styles.stickyHeader}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <View style={styles.totalValues}>
              <Text style={styles.totalText}>BS: {totals.bs}</Text>
              <Text style={styles.totalText}>Hrs: {totals.hrs}</Text>
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
          <Text>No data available</Text>
        ) : (
          <ReportTable data={filteredData} />
        )}
      </ScrollView>

      {/* :::::button to delete all data */}
      {/* <Pressable
        onPress={async () => {
          await db.delete(Report).execute()
        }}
        style={{
          padding: 5,
          backgroundColor: 'red',
          width: 100,
          borderRadius: 15,
        }}
      >
        <Text>Delete all data</Text>
      </Pressable> */}

      <ModalForm
        setModalVisible={setModalVisible}
        modalVisible={modalVisible}
      />
    </SafeAreaView>
  )
}

export default reportPage
const styles = StyleSheet.create({
  container: { flex: 1 },
  btnText: {
    color: Colors.emerald800,
    fontFamily: 'IBM-SemiBold',
    fontSize: 18,
  },
  headerLeftBtn: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
    marginLeft: 10,
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
    alignItems: 'center',
    backgroundColor: Colors.emerald300,
    padding: 10,
    borderRadius: 8,
  },
  totalLabel: {
    fontFamily: 'IBM-Bold',
    fontSize: 18,
    color: Colors.primary800,
  },
  totalValues: {
    flexDirection: 'row',
    gap: 22,
  },
  totalText: {
    fontFamily: 'IBM-Bold',
    fontSize: 18,
    color: Colors.primary800,
  },
  dropDownContainer: {
    width: '90%',
    marginHorizontal: 'auto',
    marginBottom: 10,
  },
})
