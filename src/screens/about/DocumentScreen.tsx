import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Icon, Screen} from '../../components';
import {useApp} from '../../context/AppContext';
import {RootStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';

type DocRoute = 'ClubProtocols' | 'SafetyBriefing' | 'ClubBrochure';

export function ClubProtocolsScreen(
  props: NativeStackScreenProps<RootStackParamList, 'ClubProtocols'>,
) {
  return <DocumentBody {...props} route="ClubProtocols" />;
}

export function SafetyBriefingScreen(
  props: NativeStackScreenProps<RootStackParamList, 'SafetyBriefing'>,
) {
  return <DocumentBody {...props} route="SafetyBriefing" />;
}

export function ClubBrochureScreen(
  props: NativeStackScreenProps<RootStackParamList, 'ClubBrochure'>,
) {
  return <DocumentBody {...props} route="ClubBrochure" />;
}

function DocumentBody({
  navigation,
  route,
}: {
  navigation: {goBack: () => void};
  route: DocRoute;
}) {
  const theme = useThemeColors();
  const {clubProtocols, safetyBriefing, clubBrochure} = useApp();

  return (
    <Screen scroll>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={12}
        onPress={() => navigation.goBack()}
        style={styles.back}>
        <Icon
          name="chevron-left"
          size={22}
          color={theme.text}
          strokeWidth={1.25}
        />
      </Pressable>

      {route === 'ClubProtocols' ? (
        <>
          <Text style={[styles.kicker, {color: theme.textMuted}]}>
            Club document
          </Text>
          <Text style={[styles.title, {color: theme.text}]}>
            {clubProtocols.title}
          </Text>
          {clubProtocols.sections.map(section => (
            <View key={section.heading} style={styles.block}>
              <Text style={[styles.heading, {color: theme.text}]}>
                {section.heading}
              </Text>
              <Text style={[styles.body, {color: theme.text}]}>
                {section.body}
              </Text>
            </View>
          ))}
        </>
      ) : null}

      {route === 'SafetyBriefing' ? (
        <>
          <Text style={[styles.kicker, {color: theme.textMuted}]}>
            Club document
          </Text>
          <Text style={[styles.title, {color: theme.text}]}>
            {safetyBriefing.title}
          </Text>
          {safetyBriefing.sections.map(section => (
            <View key={section.heading} style={styles.block}>
              <Text style={[styles.heading, {color: theme.text}]}>
                {section.heading}
              </Text>
              <Text style={[styles.body, {color: theme.text}]}>
                {section.body}
              </Text>
            </View>
          ))}
        </>
      ) : null}

      {route === 'ClubBrochure' ? (
        <>
          <Text style={[styles.kicker, {color: theme.textMuted}]}>
            Club document
          </Text>
          <Text style={[styles.title, {color: theme.text}]}>
            {clubBrochure.title}
          </Text>
          <Text style={[styles.body, {color: theme.text, marginBottom: spacing.lg}]}>
            {clubBrochure.intro}
          </Text>
          <Text style={[styles.heading, {color: theme.text}]}>Highlights</Text>
          {clubBrochure.highlights.map(item => (
            <Text
              key={item}
              style={[styles.bullet, {color: theme.text, borderColor: theme.border}]}>
              {item}
            </Text>
          ))}
          <Text
            style={[
              styles.heading,
              {color: theme.text, marginTop: spacing.lg},
            ]}>
            Membership
          </Text>
          <Text style={[styles.body, {color: theme.text}]}>
            {clubBrochure.membership}
          </Text>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  kicker: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.hero,
    textTransform: 'none',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '300',
    letterSpacing: 0.2,
    marginBottom: spacing.lg,
  },
  block: {
    marginBottom: spacing.lg,
  },
  heading: {
    ...typography.section,
    marginBottom: spacing.xs,
  },
  body: {
    ...typography.body,
  },
  bullet: {
    ...typography.body,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
