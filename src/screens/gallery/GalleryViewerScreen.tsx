import React, {useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Icon, RemoteImage} from '../../components';
import {RootStackParamList} from '../../navigation/types';
import {colors, spacing, typography} from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'GalleryViewer'>;

const {width, height} = Dimensions.get('window');

export function GalleryViewerScreen({navigation, route}: Props) {
  const {images, index} = route.params;
  const [active, setActive] = useState(index);
  const listRef = useRef<FlatList<string>>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    setActive(next);
  };

  return (
    <View style={styles.root}>
      <Pressable style={styles.close} onPress={() => navigation.goBack()}>
        <Icon name="close" color={colors.ivory} />
      </Pressable>
      <FlatList
        ref={listRef}
        data={images}
        horizontal
        pagingEnabled
        initialScrollIndex={index}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
        onScroll={onScroll}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, i) => `${item}-${i}`}
        renderItem={({item}) => (
          <View style={styles.slide}>
            <RemoteImage uri={item} style={styles.image} />
          </View>
        )}
      />
      <Text style={styles.counter}>
        {active + 1} / {images.length}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.black,
  },
  close: {
    position: 'absolute',
    top: spacing.xxl,
    right: spacing.lg,
    zIndex: 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17,17,16,0.55)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  slide: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width,
    height: height * 0.7,
  },
  counter: {
    ...typography.label,
    position: 'absolute',
    bottom: spacing.xxl,
    alignSelf: 'center',
    color: colors.ivory,
  },
});
