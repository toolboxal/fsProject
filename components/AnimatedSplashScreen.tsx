import { Colors } from '@/constants/Colors'
import { useEffect } from 'react'
import { StyleSheet, Text, View, Image, ImageBackground } from 'react-native'
import Animated, { FadeInLeft, FadeOut } from 'react-native-reanimated'

type AnimatedProps = {
  setSplashAnimationComplete: () => void
}

const AnimatedSplashScreen = ({
  setSplashAnimationComplete,
}: AnimatedProps) => {
  useEffect(() => {
    setTimeout(() => {
      setSplashAnimationComplete()
    }, 4000)
  }, [])

  return (
    <ImageBackground
      source={require('@/assets/images/splashscreen_bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* <View style={styles.overlay} /> */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: 40,
          paddingTop: 160,
        }}
      >
        <Animated.View
          style={styles.animatedView}
          entering={FadeInLeft.duration(1200)}
          exiting={FadeOut}
        >
          <Image
            source={require('@/assets/images/icon.png')}
            style={[styles.imageStyle]}
            resizeMode="contain"
          />
          <Text style={[styles.H1, { color: Colors.white }]}>Welcome to</Text>
          <Text style={[styles.H1, { color: Colors.emerald300 }]}>FSPal</Text>
          <Text style={[styles.textBody, { color: Colors.emerald300 }]}>
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
  //   overlay: {
  //     ...StyleSheet.absoluteFillObject,
  //     backgroundColor: Colors.primary900,
  //     opacity: 0.77,
  //   },
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
