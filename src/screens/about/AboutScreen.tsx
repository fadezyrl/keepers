import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppHeader, Icon, RemoteImage, Screen} from '../../components';
import {APP_DISPLAY_NAME, getAppVersion} from '../../config/appIdentity';
import {useCachedEvents} from '../../hooks/useCachedQueries';
import {RootStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';

type DocumentRoute = 'ClubProtocols' | 'SafetyBriefing' | 'ClubBrochure';

const links: {label: string; route: DocumentRoute}[] = [
  {label: 'Keepers Adventures Protocols', route: 'ClubProtocols'},
  {
    label: 'Keepers Adventures Safety Briefing & Disclaimer',
    route: 'SafetyBriefing',
  },
  {label: 'Keepers Adventures Brochure', route: 'ClubBrochure'},
];

/** Matches the floating tab bar in MainTabNavigator. */
const TAB_BAR_HEIGHT = 64;
const TAB_BAR_MIN_OFFSET = 10;

export function AboutScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const version = getAppVersion();
  const eventsQuery = useCachedEvents();
  const events = eventsQuery.data || [];
  const tabClearance =
    TAB_BAR_HEIGHT + Math.max(insets.bottom, TAB_BAR_MIN_OFFSET) + spacing.md;

  return (
    <Screen
      scroll
      padded={false}
      edges={['top']}
      onRefresh={async () => {
        await eventsQuery.refetch();
      }}>
      <AppHeader />
      <View style={[styles.body, {paddingBottom: tabClearance}]}>
        <Text style={[styles.heading, {color: theme.text}]}>About us</Text>

        <View style={styles.list}>
          {links.map(item => (
            <Pressable
              key={item.route}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              android_ripple={{color: theme.bgMuted}}
              onPress={() => navigation.navigate(item.route)}
              style={({pressed}) => [
                styles.row,
                {
                  borderColor: theme.border,
                  backgroundColor: pressed ? theme.bgMuted : theme.surface,
                },
              ]}>
              <Text
                numberOfLines={2}
                style={[styles.rowLabel, {color: theme.text}]}>
                {item.label}
              </Text>
              <Icon
                name="chevron-right"
                size={18}
                color={theme.text}
                strokeWidth={1.25}
              />
            </Pressable>
          ))}
        </View>

        {events.length > 0 ? (
          <View style={styles.events}>
            <Text style={[styles.eventsHeading, {color: theme.text}]}>
              Upcoming events
            </Text>
            {events.map(event => (
              <View
                key={event.id}
                style={[
                  styles.eventCard,
                  {borderColor: theme.border, backgroundColor: theme.surface},
                ]}>
                {event.image ? (
                  <RemoteImage uri={event.image} style={styles.eventImage} />
                ) : null}
                <Text style={[styles.eventTitle, {color: theme.text}]}>
                  {event.title}
                </Text>
                <Text style={[styles.eventMeta, {color: theme.textMuted}]}>
                  {event.date}
                  {event.location ? ` · ${event.location}` : ''}
                </Text>
                {event.description ? (
                  <Text style={[styles.eventBody, {color: theme.textMuted}]}>
                    {event.description}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.spacer} />

        <View style={styles.versionBlock}>
          <Text style={[styles.appName, {color: theme.text}]}>
            {APP_DISPLAY_NAME}
          </Text>
          <Text style={[styles.version, {color: theme.textMuted}]}>
            Version {version}
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  heading: {
    ...typography.hero,
    textTransform: 'none',
    fontWeight: '300',
    letterSpacing: 0.2,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  list: {
    gap: spacing.sm,
  },
  events: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  eventsHeading: {
    ...typography.title,
    fontSize: 18,
    marginBottom: spacing.sm,
  },
  eventCard: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  eventImage: {
    width: '100%',
    height: 140,
    marginBottom: spacing.sm,
  },
  eventTitle: {
    ...typography.title,
    fontSize: 16,
  },
  eventMeta: {
    ...typography.caption,
    marginTop: 4,
  },
  eventBody: {
    ...typography.body,
    marginTop: spacing.sm,
  },
  row: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    gap: spacing.md,
  },
  rowLabel: {
    ...typography.body,
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  spacer: {
    flex: 1,
    minHeight: spacing.xl,
  },
  versionBlock: {
    alignItems: 'center',
    paddingBottom: spacing.sm,
    gap: spacing.xxs,
  },
  appName: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  version: {
    ...typography.caption,
    letterSpacing: 0.6,
  },
});
