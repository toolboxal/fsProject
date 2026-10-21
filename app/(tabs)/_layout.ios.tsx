import { useEffect, useRef } from 'react'
import { ThemeProvider, DefaultTheme } from '@react-navigation/native'
import {
  NativeTabs,
  Icon,
  Label,
  VectorIcon,
} from 'expo-router/unstable-native-tabs'
import { useSegments } from 'expo-router'
import * as Haptics from 'expo-haptics'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { Colors } from '@/constants/Colors'
import { useTranslations } from '../_layout'
import useMyStore from '@/store/store'

const TAB_LABEL_SIZE = 10
const selectedTint = Colors.emerald600
const defaultTint = Colors.primary500

const TabsLayout = () => {
  const i18n = useTranslations()
  const lang = useMyStore((state) => state.language)
  const segments = useSegments()
  const tab = segments[1] ?? 'index'
  const isFirstTab = useRef(true)

  useEffect(() => {
    if (isFirstTab.current) {
      isFirstTab.current = false
      return
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid)
  }, [tab])

  return (
    <ThemeProvider value={DefaultTheme}>
      <NativeTabs
        key={lang}
        blurEffect="none"
        disableTransparentOnScrollEdge
        tintColor={selectedTint}
        iconColor={{ default: defaultTint, selected: selectedTint }}
        labelStyle={{
          default: {
            fontFamily: 'IBM-SemiBold',
            fontSize: TAB_LABEL_SIZE,
            color: defaultTint,
          },
          selected: {
            fontFamily: 'IBM-SemiBold',
            fontSize: TAB_LABEL_SIZE,
            color: selectedTint,
          },
        }}
      >
        <NativeTabs.Trigger name="index">
          <Icon
            src={<VectorIcon family={FontAwesome5} name="map-marked-alt" />}
          />
          <Label>{i18n.t('tabbar.map')}</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name="recordsPage"
          options={{ disableTransparentOnScrollEdge: true }}
        >
          <Icon src={<VectorIcon family={FontAwesome5} name="folder-open" />} />
          <Label>{i18n.t('tabbar.records')}</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name="reportPage"
          options={{ disableTransparentOnScrollEdge: true }}
        >
          <Icon src={<VectorIcon family={FontAwesome} name="list-alt" />} />
          <Label>{i18n.t('tabbar.reports')}</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name="schedulePage"
          options={{ disableTransparentOnScrollEdge: true }}
        >
          <Icon src={<VectorIcon family={MaterialIcons} name="grid-on" />} />
          <Label>{i18n.t('tabbar.schedule')}</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </ThemeProvider>
  )
}

export default TabsLayout
