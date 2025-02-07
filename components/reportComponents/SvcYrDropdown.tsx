import { StyleSheet, Text, View } from 'react-native'
import * as DropdownMenu from 'zeego/dropdown-menu'
import Entypo from '@expo/vector-icons/Entypo'
import { Colors } from '@/constants/Colors'
import { useTranslations } from '@/app/_layout'

type Props = {
  selectedYr: number
  setItem: React.Dispatch<React.SetStateAction<number>>
  svcYrs: { currentYr: number; previousYr: number }
}

const SvcYrDropdown = ({ selectedYr, setItem, svcYrs }: Props) => {
  const i18n = useTranslations()
  return (
    <View style={styles.trigger}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <View style={styles.triggerContainer}>
            <Text style={styles.triggerTxt}>
              {`${i18n.t('reports.dropDownTitle')}${selectedYr.toString()}`}
            </Text>
            <Entypo name="chevron-down" size={20} color={Colors.white} />
          </View>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item
            key={i18n.t('reports.dropDownPrevious')}
            onSelect={() => setItem(svcYrs.previousYr)}
          >
            <DropdownMenu.ItemTitle>previous</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            key={i18n.t('reports.dropDownCurrent')}
            onSelect={() => setItem(svcYrs.currentYr)}
          >
            <DropdownMenu.ItemTitle>
              {/* {svcYrs.currentYr.toString()} */}
              current
            </DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </View>
  )
}
export default SvcYrDropdown
const styles = StyleSheet.create({
  trigger: {
    backgroundColor: Colors.primary950,
    alignSelf: 'flex-start',
    borderRadius: 5,
    shadowColor: Colors.primary500,
    shadowOffset: { width: -1, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.primary300,
  },
  triggerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    padding: 8,
  },
  triggerTxt: {
    fontFamily: 'IBM-Regular',
    fontSize: 16,
    color: Colors.white,
  },
})
