import React from 'react';
import {Linking, Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  Button,
  EmptyState,
  ErrorState,
  Icon,
  LoadingState,
  Screen,
} from '../../components';
import {useCachedDocument} from '../../hooks/useCachedQueries';
import {RootStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';

type DocRoute = 'ClubProtocols' | 'SafetyBriefing' | 'ClubBrochure';

const SLUG_BY_ROUTE: Record<DocRoute, string> = {
  ClubProtocols: 'protocols',
  SafetyBriefing: 'safety-briefing',
  ClubBrochure: 'brochure',
};

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
  const slug = SLUG_BY_ROUTE[route];
  const docQuery = useCachedDocument(slug);
  const doc = docQuery.data || null;
  const loading = docQuery.isLoading && !doc;
  const error =
    docQuery.isError && !doc
      ? docQuery.error instanceof Error
        ? docQuery.error.message
        : 'Unable to load document.'
      : null;
  const load = async () => {
    await docQuery.refetch();
  };

  const sections = parseDocumentSections(doc?.content || '');

  return (
    <Screen scroll onRefresh={load}>
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

      {loading ? <LoadingState /> : null}

      {!loading && error ? (
        <ErrorState
          title="Document unavailable"
          message={error}
          actionLabel="Retry"
          onAction={load}
        />
      ) : null}

      {!loading && !error && !doc?.content?.trim() && !doc?.file_url ? (
        <EmptyState
          title="No content yet"
          message="This club document has not been published."
        />
      ) : null}

      {!loading && !error && doc ? (
        <>
          <Text style={[styles.kicker, {color: theme.textMuted}]}>
            Club document
          </Text>
          <Text style={[styles.title, {color: theme.text}]}>{doc.title}</Text>
          {doc.version ? (
            <Text style={[styles.version, {color: theme.textMuted}]}>
              Version {doc.version}
            </Text>
          ) : null}
          {doc.file_url ? (
            <Button
              label="Open attachment"
              variant="secondary"
              onPress={() => Linking.openURL(doc.file_url!)}
              style={{marginTop: spacing.md}}
            />
          ) : null}
          {sections.map(section => (
            <View key={section.heading} style={styles.block}>
              {section.heading !== 'Overview' || sections.length > 1 ? (
                <Text style={[styles.heading, {color: theme.text}]}>
                  {section.heading}
                </Text>
              ) : null}
              <Text style={[styles.body, {color: theme.text}]}>
                {section.body}
              </Text>
            </View>
          ))}
        </>
      ) : null}
    </Screen>
  );
}

function parseDocumentSections(content: string) {
  const trimmed = content.trim();
  if (!trimmed) {
    return [];
  }
  // Support "## Heading" markdown-ish sections; otherwise single body block.
  const parts = trimmed.split(/\n(?=##\s+)/);
  if (parts.length === 1 && !trimmed.startsWith('## ')) {
    return [{heading: 'Overview', body: trimmed}];
  }
  return parts.map((part, index) => {
    const lines = part.trim().split('\n');
    const first = lines[0] || '';
    const heading = first.replace(/^##\s+/, '').trim() || `Section ${index + 1}`;
    const body = lines.slice(1).join('\n').trim() || first.replace(/^##\s+/, '').trim();
    return {heading, body};
  });
}

const styles = StyleSheet.create({
  back: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  kicker: {...typography.label},
  title: {...typography.hero, fontSize: 28, marginTop: spacing.xs},
  version: {...typography.caption, marginTop: spacing.xs},
  block: {marginTop: spacing.lg},
  heading: {...typography.title, fontSize: 16, marginBottom: spacing.xs},
  body: {...typography.body, lineHeight: 24},
});
