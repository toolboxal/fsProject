import { useState } from 'react'
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

const reportPage = () => {
  const { bottom, top } = useSafeAreaInsets()
  const [modalVisible, setModalVisible] = useState(false)

  const { data } = useQuery({
    queryKey: ['reports'],
    queryFn: () => {
      const result = db.select().from(Report).all()
      return result
    },
  })

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

        {!data || data.length === 0 ? (
          <Text>No data available</Text>
        ) : (
          <ReportTable data={data} />
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
    backgroundColor: Colors.primary100,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 15,
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
})
