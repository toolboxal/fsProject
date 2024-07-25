import { Colors } from '../constants/Colors'

import { View, Pressable, StyleSheet, Text } from 'react-native'

type TRadioProps = {
  handleSetPrivate: () => void
  isPrivate: boolean
}

export default function ApartmentRadioButtons({
  handleSetPrivate,
  isPrivate,
}: TRadioProps) {
  const radioOptions = [
    {
      id: 'publicHouse', // acts as primary key, should be unique and non-empty string
      label: 'Public Apartments',
      value: false,
    },
    {
      id: 'privateHouse', // acts as primary key, should be unique and non-empty string
      label: 'Private Homes',
      value: true,
    },
  ]

  return (
    <View style={styles.radioContainer}>
      {radioOptions.map((option) => (
        <Pressable
          key={option.id}
          onPress={() => {
            handleSetPrivate()
          }}
          style={[
            styles.radioButton,
            option.value === isPrivate ? styles.active : null,
          ]}
        >
          <Text
            style={[
              styles.labelText,
              option.value === isPrivate ? styles.active : null,
            ]}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  radioContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  radioButton: {
    padding: 8,
    paddingHorizontal: 12,
    borderColor: Colors.primary900,
    borderWidth: 1,
    borderRadius: 20,
  },
  labelText: {
    fontSize: 16,
    fontFamily: 'IBM-Bold',
    color: Colors.primary900,
  },
  active: {
    backgroundColor: Colors.primary900,
    color: Colors.white,
  },
})
