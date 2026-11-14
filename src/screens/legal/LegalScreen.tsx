import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  BackHeader,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
} from '../../components';
import {useCachedDocument} from '../../hooks/useCachedQueries';
import {RootStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Legal'>;
type DocType = 'terms' | 'privacy';

const SLUG: Record<DocType, string> = {
  terms: 'terms',
  privacy: 'privacy',
};

export function LegalScreen({navigation, route}: Props) {
  const theme = useThemeColors();
  const type = route.params.type;
  const [active, setActive] = useState<DocType>(type);
  const docQuery = useCachedDocument(SLUG[active]);
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

  return (
    <Screen scroll onRefresh={load}>
      <BackHeader onBack={() => navigation.goBack()} />
      <Text style={[styles.kicker, {color: theme.textMuted}]}>Legal</Text>
      <Text style={[styles.title, {color: theme.text}]}>
        Terms and Privacy
      </Text>

      <View style={styles.tabs}>
        {(['terms', 'privacy'] as DocType[]).map(tab => {
          const selected = active === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActive(tab)}
              style={[
                styles.tab,
                {
                  borderColor: selected ? theme.text : theme.border,
                  backgroundColor: selected ? theme.inverse : theme.surface,
                },
              ]}>
              <Text
                style={{
                  color: selected ? theme.onInverse : theme.text,
                  ...typography.label,
                }}>
                {tab === 'terms' ? 'Terms' : 'Privacy'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? <LoadingState /> : null}
      {!loading && error ? (
        <ErrorState
          title="Document unavailable"
          message={error}
          actionLabel="Retry"
          onAction={load}
        />
      ) : null}
      {!loading && !error && !doc?.content?.trim() ? (
        <EmptyState
          title="No content yet"
          message="This legal document has not been published."
        />
      ) : null}
      {!loading && !error && doc?.content ? (
        <View style={styles.body}>
          <Text style={[styles.docTitle, {color: theme.text}]}>{doc.title}</Text>
          <Text style={[styles.copy, {color: theme.text}]}>{doc.content}</Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {...typography.label},
  title: {...typography.hero, fontSize: 28, marginTop: spacing.xs},
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  tab: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  body: {marginTop: spacing.sm},
  docTitle: {...typography.title, fontSize: 18, marginBottom: spacing.md},
  copy: {...typography.body, lineHeight: 24},
});
