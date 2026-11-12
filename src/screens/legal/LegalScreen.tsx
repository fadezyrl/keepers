import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {BackHeader, Screen} from '../../components';
import {RootStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Legal'>;
type DocType = 'terms' | 'privacy';

const TERMS = [
  {
    heading: 'Overview',
    body: 'These Terms & Conditions govern membership and participation in Keepers Adventures 4x4 expeditions, events, workshops and related club services. By creating an account or joining an adventure you agree to follow these terms and all published club protocols.',
  },
  {
    heading: 'Membership',
    body: 'Membership is subject to approval, vehicle readiness and conduct standards. Keepers may suspend or revoke access for unsafe driving, repeated no-shows, harassment or breach of convoy rules. Membership tiers (Junior, Intermediate, Advanced) determine which expeditions you may register for.',
  },
  {
    heading: 'Participation & cancellation',
    body: 'Adventure registration is binding once confirmed. Cancel at least 24 hours before departure unless an emergency applies. Participants must arrive on time with required recovery gear, water and a roadworthy 4x4. Guides may refuse departure if safety standards are not met.',
  },
  {
    heading: 'Liability & conduct',
    body: 'Off-road activity carries inherent risk. Members participate voluntarily and are responsible for their vehicle, passengers and personal equipment. Reckless driving, littering and unauthorized drone use are prohibited. Contact hello@keepersadventures.ae for membership or legal questions.',
  },
];

const PRIVACY = [
  {
    heading: 'Overview',
    body: 'Keepers Adventures 4x4 respects member privacy. This policy explains what information we collect in the app, why we use it, and the choices available to you.',
  },
  {
    heading: 'Information we collect',
    body: 'We collect account details (name, email, phone), profile and vehicle information you provide, expedition registrations, notification preferences, and basic device settings such as display mode. Emergency contacts are stored so guides can reach the right person if needed.',
  },
  {
    heading: 'How information is used',
    body: 'We use your data to authenticate membership, manage trip registrations, send trip and club notifications, operate the members directory according to your privacy settings, and improve expedition safety and operations.',
  },
  {
    heading: 'Your choices',
    body: 'You may update profile details, notification preferences and privacy controls in Settings. You may request account deletion from the club administration. For privacy requests email hello@keepersadventures.ae. We retain membership records only as long as needed for club operations and safety compliance.',
  },
];

export function LegalScreen({navigation, route}: Props) {
  const theme = useThemeColors();
  const [active, setActive] = useState<DocType>(route.params.type);
  const sections = active === 'terms' ? TERMS : PRIVACY;

  return (
    <Screen scroll>
      <BackHeader onBack={() => navigation.goBack()} />
      <Text style={[styles.kicker, {color: theme.textMuted}]}>
        Keepers Adventures
      </Text>
      <Text style={[styles.title, {color: theme.text}]}>
        Terms & Privacy
      </Text>

      <View style={[styles.tabs, {borderColor: theme.border}]}>
        <Tab
          label="Terms & Conditions"
          active={active === 'terms'}
          onPress={() => setActive('terms')}
        />
        <Tab
          label="Privacy Policy"
          active={active === 'privacy'}
          onPress={() => setActive('privacy')}
        />
      </View>

      <Text style={[styles.updated, {color: theme.textMuted}]}>
        Last updated · November 2026
      </Text>

      {sections.map(section => (
        <View key={section.heading} style={styles.block}>
          <Text style={[styles.heading, {color: theme.text}]}>
            {section.heading}
          </Text>
          <Text style={[styles.body, {color: theme.text}]}>
            {section.body}
          </Text>
        </View>
      ))}
    </Screen>
  );
}

function Tab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const theme = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tab,
        active && {
          borderBottomColor: theme.text,
          borderBottomWidth: 1,
        },
      ]}>
      <Text
        style={[
          styles.tabLabel,
          {color: active ? theme.text : theme.textMuted},
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  kicker: {...typography.label},
  title: {
    ...typography.hero,
    fontSize: 24,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    ...typography.label,
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  updated: {
    ...typography.caption,
    marginBottom: spacing.lg,
  },
  block: {marginBottom: spacing.lg},
  heading: {...typography.section, marginBottom: spacing.xs},
  body: {...typography.body},
});
