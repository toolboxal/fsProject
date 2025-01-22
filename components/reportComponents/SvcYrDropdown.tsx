import { StyleSheet, Text, View } from 'react-native'
import * as DropdownMenu from 'zeego/dropdown-menu'
import Entypo from '@expo/vector-icons/Entypo'
import { Colors } from '@/constants/Colors'

type Props = {
  selectedYr: number
  setItem: React.Dispatch<React.SetStateAction<number>>
  svcYrs: { currentYr: number; previousYr: number }
}

const SvcYrDropdown = ({ selectedYr, setItem, svcYrs }: Props) => {
  return (
    <View style={styles.trigger}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <View style={styles.triggerContainer}>
            <Text style={styles.triggerTxt}>
              {`service year ${selectedYr.toString()}`}
            </Text>
            <Entypo name="chevron-down" size={20} color="black" />
          </View>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="center">
          <DropdownMenu.Item
            key="previous"
            onSelect={() => setItem(svcYrs.previousYr)}
          >
            <DropdownMenu.ItemTitle>previous</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            key="current"
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
    backgroundColor: Colors.primary300,
    alignSelf: 'flex-start',
    borderRadius: 5,
    shadowColor: '#292524',
    shadowOffset: { width: -3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 1,
    elevation: 5,
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
  },
})
