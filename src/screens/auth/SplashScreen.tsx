import React, {useEffect} from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';
import {BrandLogo, RemoteImage} from '../../components';
import {useApp} from '../../context/AppContext';
import {images} from '../../data/images';
import {colors, spacing, typography} from '../../theme';

export function SplashScreen() {
  const {bootstrap} = useApp();
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();

    // Hold the splash hero long enough to enjoy the opening frame (~3.5s after fade-in).
    const timer = setTimeout(() => {
      bootstrap();
    }, 4800);

    return () => clearTimeout(timer);
  }, [bootstrap, opacity, translateY]);

  return (
    <View style={styles.root}>
      <RemoteImage uri={images.hero.splash} style={StyleSheet.absoluteFill} />
      <View style={styles.overlay} />
      <Animated.View style={{opacity, transform: [{translateY}]}}>
        <BrandLogo size="lg" tone="dark" />
        <Text style={styles.line}>THE ADVENTURE NEVER ENDS</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlayHeavy,
  },
  line: {
    ...typography.label,
    textAlign: 'center',
    marginTop: spacing.xl,
    color: colors.ivory,
  },
});
