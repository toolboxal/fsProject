import { Colors } from '../constants/Colors'

import { View, Pressable, StyleSheet, Text } from 'react-native'

type TRadioProps = {
  setSelected: React.Dispatch<React.SetStateAction<string>>
  selected: string
}

export default function CustomRadioButtons({
  setSelected,
  selected,
}: TRadioProps) {
  const radioOptions = [
    {
      id: 'CA', // acts as primary key, should be unique and non-empty string
      label: 'Call Again',
      value: 'ca',
    },
    {
      id: 'RV', // acts as primary key, should be unique and non-empty string
      label: 'Return Visit',
      value: 'rv',
    },
    {
      id: 'BS', // acts as primary key, should be unique and non-empty string
      label: 'Bible Study',
      value: 'bs',
    },
  ]

  return (
    <View style={styles.radioContainer}>
      {radioOptions.map((option) => (
        <Pressable
          key={option.id}
          onPress={() => {
            setSelected(option.id)
          }}
          style={[
            styles.radioButton,
            option.id === selected ? styles.active : null,
          ]}
        >
          <Text
            style={[
              styles.labelText,
              option.id === selected ? styles.active : null,
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
    marginTop: 12,
    marginBottom: 15,
  },
  radioButton: {
    padding: 9,
    paddingHorizontal: 14,
    borderColor: Colors.emerald800,
    borderWidth: 1,
    borderRadius: 20,
  },
  labelText: {
    fontFamily: 'IBM-Bold',
    fontSize: 16,
    color: Colors.emerald800,
  },
  active: {
    backgroundColor: Colors.emerald800,
    color: Colors.white,
  },
})
