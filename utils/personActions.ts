import { Alert } from 'react-native'
import { QueryClient } from '@tanstack/react-query'
import { db } from '@/drizzle/db'
import { Person, personsToTags } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import { toast } from 'sonner-native'
import sharePerson from '@/utils/sharePerson'
import shareAsNonFSPal from '@/utils/shareAsNonFSPal'

type DeletePersonLabels = {
  title: string
  description: string
  confirm: string
  cancel: string
  successToast: string
}

export const confirmDeletePerson = (
  personId: number,
  queryClient: QueryClient,
  labels: DeletePersonLabels,
  onSuccess?: () => void,
) => {
  Alert.alert(labels.title, labels.description, [
    {
      text: labels.confirm,
      onPress: async () => {
        await db
          .delete(personsToTags)
          .where(eq(personsToTags.personId, personId))
        await db.delete(Person).where(eq(Person.id, personId))
        queryClient.invalidateQueries({ queryKey: ['persons'] })
        queryClient.invalidateQueries({ queryKey: ['person', personId] })
        toast.success(`${labels.successToast} 🗑️`)
        onSuccess?.()
      },
      style: 'destructive',
    },
    {
      text: labels.cancel,
      style: 'cancel',
    },
  ])
}

export const promptSharePerson = (personId: number) => {
  Alert.alert('Share Record', 'The other publisher using FSPal?', [
    {
      text: 'FsPal User',
      onPress: () => sharePerson(personId),
      style: 'default',
    },
    {
      text: 'Non-FsPal User',
      onPress: () => shareAsNonFSPal(personId),
      style: 'default',
    },
    {
      text: 'Cancel',
      style: 'cancel',
    },
  ])
}
