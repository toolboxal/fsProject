import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { db } from '@/drizzle/db'
import { tags, personsToTags } from '@/drizzle/schema'
import { Colors } from '@/constants/Colors'
import { X } from 'lucide-react-native'
import { eq } from 'drizzle-orm'
import { useTranslations } from '@/app/_layout'
import { toast } from 'sonner-native'
const tagsPage = () => {
  const queryClient = useQueryClient()
  const { data: tagsArr } = useQuery({
    queryKey: ['tags'],
    queryFn: () => db.query.tags.findMany(),
  })

  const handleDelete = async (id: number) => {
    const i18n = useTranslations()
    try {
      // Check if the tag is in use in personsToTags table
      const tagUsage = await db
        .select()
        .from(personsToTags)
        .where(eq(personsToTags.tagId, id))
        .limit(1)

      if (tagUsage.length > 0) {
        Alert.alert(
          i18n.t('tagsPage.alertHeader'),
          i18n.t('tagsPage.alertDesc')
        )
        return
      }
      // If not in use, proceed with deletion
      await db.delete(tags).where(eq(tags.id, id)).execute()
      console.log('Successfully deleted tag with ID:', id)

      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      toast.success(i18n.t('tagsPage.toastSuccess'))
    } catch (error) {
      console.error('Error deleting tag with ID:', id, 'Error:', error)
      Alert.alert(
        'Error',
        'Failed to delete the tag due to an unexpected error.'
      )
    }
  }

  return (
    <View style={styles.fullPage}>
      <ScrollView
        style={{
          flex: 1,
          padding: 8,
          backgroundColor: Colors.primary300,
        }}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {tagsArr ? (
          tagsArr.map((tag) => (
            <Pressable key={tag.id} style={styles.tagBox}>
              <Text style={styles.tagText}>{tag.tagName}</Text>
              <Pressable onPress={() => handleDelete(tag.id)}>
                <X size={20} color={Colors.emerald800} strokeWidth={1.5} />
              </Pressable>
            </Pressable>
          ))
        ) : (
          <Text>No tags found</Text>
        )}
      </ScrollView>
    </View>
  )
}
export default tagsPage
const styles = StyleSheet.create({
  fullPage: {
    flex: 1,
    backgroundColor: Colors.primary50,
  },
  tagBox: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagText: {
    fontFamily: 'IBM-Medium',
    fontSize: 14,
    color: Colors.emerald800,
  },
})
