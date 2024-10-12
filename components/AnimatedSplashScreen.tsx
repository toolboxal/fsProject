import { Colors } from '@/constants/Colors'
import { useEffect } from 'react'
import { StyleSheet, Text, View, Image, ImageBackground } from 'react-native'
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type AnimatedProps = {
  setSplashAnimationComplete: () => void
}

const AnimatedSplashScreen = ({
  setSplashAnimationComplete,
}: AnimatedProps) => {
  const { top } = useSafeAreaInsets()

  useEffect(() => {
    setTimeout(() => {
      setSplashAnimationComplete()
    }, 4500)
  }, [])

  return (
    <ImageBackground
      source={require('@/assets/images/splashscreen_bg.png')}
      style={styles.backgroundImage}
    >
      <View style={styles.overlay} />
      <View
        style={{
          flex: 1,
          //   backgroundColor: Colors.primary700,
          paddingHorizontal: 40,
          paddingTop: top + 120,
        }}
      >
        <Animated.View
          style={styles.animatedView}
          entering={FadeInDown.duration(1500)}
          exiting={FadeOut}
        >
          <Image
            source={require('@/assets/images/icon.png')}
            style={[styles.imageStyle]}
            resizeMode="contain"
          />
          <Text style={[styles.H1, { color: Colors.white }]}>Welcome to</Text>
          <Text style={[styles.H1, { color: Colors.emerald400 }]}>FSPal</Text>
          <Text style={[styles.textBody, { color: Colors.emerald400 }]}>
            Locate your calls on a map.
          </Text>
        </Animated.View>
      </View>
    </ImageBackground>
  )
}
export default AnimatedSplashScreen

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primary700,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.primary900,
    opacity: 0.77, // Adjust opacity as needed
  },
  imageStyle: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginBottom: 15,
  },
  animatedView: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  H1: {
    fontFamily: 'IBM-Bold',
    fontSize: 35,
    letterSpacing: -1,
    lineHeight: 40,
  },
  textBody: {
    fontFamily: 'IBM-Medium',
    fontSize: 16,
    letterSpacing: -1,
  },
})
