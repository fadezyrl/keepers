import React, {useCallback, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  BackHeader,
  EmptyState,
  ErrorState,
  LoadingState,
  RemoteImage,
  Screen,
} from '../../components';
import {fetchChatInbox} from '../../chat/chatApi';
import {ChatInboxItem} from '../../chat/types';
import {RootStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatInbox'>;

export function ChatInboxScreen({navigation}: Props) {
  const theme = useThemeColors();
  const [items, setItems] = useState<ChatInboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchChatInbox();
      setItems(data.items || []);
    } catch (err) {
      setError(
        err && typeof err === 'object' && 'message' in err
          ? String((err as {message: string}).message)
          : 'Unable to load chats.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  if (loading && items.length === 0) {
    return (
      <Screen>
        <BackHeader onBack={() => navigation.goBack()} />
        <LoadingState />
      </Screen>
    );
  }

  if (error && items.length === 0) {
    return (
      <Screen>
        <BackHeader onBack={() => navigation.goBack()} />
        <ErrorState
          title="Chats unavailable"
          message={error}
          actionLabel="Retry"
          onAction={load}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll onRefresh={load}>
      <BackHeader onBack={() => navigation.goBack()} />
      <Text style={[styles.kicker, {color: theme.textMuted}]}>Messages</Text>
      <Text style={[styles.title, {color: theme.text}]}>Trip chats</Text>

      {items.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          message="Join a trip and get confirmed to open group and private Marshall chats."
        />
      ) : (
        items.map(item => (
          <Pressable
            key={item.id}
            onPress={() =>
              navigation.navigate('ChatThread', {
                conversationId: item.id,
                title: item.tripTitle,
              })
            }
            style={({pressed}) => [
              styles.row,
              {
                borderColor: theme.border,
                backgroundColor: theme.surface,
                opacity: pressed ? 0.88 : 1,
              },
            ]}>
            {item.coverImage ? (
              <RemoteImage uri={item.coverImage} style={styles.cover} />
            ) : (
              <View style={[styles.cover, {backgroundColor: theme.bgMuted}]} />
            )}
            <View style={styles.meta}>
              <View style={styles.topLine}>
                <Text style={[styles.name, {color: theme.text}]} numberOfLines={1}>
                  {item.tripTitle}
                </Text>
                {item.unreadCount > 0 ? (
                  <View style={[styles.badge, {backgroundColor: theme.text}]}>
                    <Text style={[styles.badgeText, {color: theme.bg}]}>
                      {item.unreadCount > 99 ? '99+' : item.unreadCount}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.sub, {color: theme.textMuted}]} numberOfLines={1}>
                {item.type === 'private' ? 'Private · ' : 'Group · '}
                {item.lastPreview || 'No messages yet'}
              </Text>
            </View>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {...typography.label, marginTop: spacing.md},
  title: {...typography.hero, fontSize: 28, marginBottom: spacing.lg},
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cover: {width: 56, height: 56},
  meta: {flex: 1, justifyContent: 'center'},
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: {...typography.title, fontSize: 16, flex: 1},
  sub: {...typography.caption, marginTop: 2},
  badge: {
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: 'center',
  },
  badgeText: {...typography.label, fontSize: 10},
});
