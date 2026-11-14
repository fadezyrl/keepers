import React, {useEffect} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Screen} from '../../components';
import {RootStackParamList} from '../../navigation/types';
import {spacing, useThemeColors} from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MyAdventureHistory'>;

/**
 * Legacy route — adventure history now lives under Trips → My Trips.
 * Keep the screen so old links still resolve without duplicate UI.
 */
export function MyAdventureHistoryScreen({navigation}: Props) {
  const theme = useThemeColors();

  useEffect(() => {
    navigation.replace('Main', {screen: 'Trips', params: {tab: 'mine'}});
  }, [navigation]);

  return (
    <Screen>
      <View style={{paddingTop: spacing.xxl, alignItems: 'center'}}>
        <ActivityIndicator color={theme.text} />
      </View>
    </Screen>
  );
}
