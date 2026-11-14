import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Sound, {
  PlayBackType,
  RecordBackType,
} from 'react-native-nitro-sound';
import {showAlert, showToast} from '../../alerts';
import {
  Avatar,
  BackHeader,
  Button,
  EmptyState,
  ImagePickerSheet,
  RemoteImage,
  VideoPlayer,
} from '../../components';
import {
  fetchConversation,
  fetchMessages,
  markConversationRead,
  markMessagesDelivered,
  sendChatMessageRest,
  uploadChatAttachment,
} from '../../chat/chatApi';
import {
  connectChatSocket,
  emitTyping,
  joinConversation,
  leaveConversation,
  setViewing,
  socketAckDelivered,
  socketAckRead,
  socketSendMessage,
} from '../../chat/chatSocket';
import {ChatAttachment, ChatConversation, ChatMessage} from '../../chat/types';
import {useApp} from '../../context/AppContext';
import {RootStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatThread'>;

function newClientId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Singleton Sound instance (nitro-sound). */
const recorder = Sound;

export function ChatThreadScreen({navigation, route}: Props) {
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const {user} = useApp();
  const conversationId = route.params.conversationId;
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const [conversation, setConversation] = useState<ChatConversation | null>(
    null,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [nextBefore, setNextBefore] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [picker, setPicker] = useState<'image' | 'video' | null>(null);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordMs, setRecordMs] = useState(0);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [socketOk, setSocketOk] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const title =
    conversation?.trip?.title || route.params.title || 'Trip chat';

  const loadConversation = useCallback(async () => {
    const data = await fetchConversation(conversationId);
    setConversation(data);
  }, [conversationId]);

  const loadMessages = useCallback(async () => {
    const data = await fetchMessages(conversationId, {limit: 40});
    setMessages(data.items || []);
    setNextBefore(data.nextBefore);
    const ids = (data.items || [])
      .filter(m => m.sender?.id !== user.id)
      .map(m => m.id);
    if (ids.length) {
      socketAckDelivered(conversationId, ids);
      markMessagesDelivered(conversationId, ids).catch(() => undefined);
    }
    await markConversationRead(conversationId);
    socketAckRead(conversationId);
  }, [conversationId, user.id]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await loadConversation();
        await loadMessages();
        await connectChatSocket({
          onReady: () => setSocketOk(true),
          onDisconnect: () => setSocketOk(false),
          onMessageNew: message => {
            if (message.conversationId !== conversationId) return;
            setMessages(prev => {
              if (prev.some(m => m.id === message.id)) return prev;
              const withoutLocal = prev.filter(
                m =>
                  !(
                    m.clientMessageId &&
                    message.clientMessageId &&
                    m.clientMessageId === message.clientMessageId
                  ),
              );
              return [...withoutLocal, {...message, localStatus: 'sent'}];
            });
            if (message.sender?.id !== user.id) {
              socketAckDelivered(conversationId, [message.id]);
              socketAckRead(conversationId, message.id);
            }
            requestAnimationFrame(() =>
              listRef.current?.scrollToEnd({animated: true}),
            );
          },
          onTyping: payload => {
            if (payload.conversationId !== conversationId) return;
            if (payload.userId === user.id) return;
            setTypingUser(payload.isTyping ? payload.userId : null);
          },
          onReceipt: payload => {
            if (
              payload.conversationId &&
              payload.conversationId !== conversationId
            ) {
              return;
            }
            const status = String(payload.status || '');
            const ids = Array.isArray(payload.messageIds)
              ? (payload.messageIds as string[])
              : payload.messageId
                ? [String(payload.messageId)]
                : [];
            if (!ids.length || (status !== 'delivered' && status !== 'read')) {
              return;
            }
            const idSet = new Set(ids);
            setMessages(prev =>
              prev.map(m => {
                if (!idSet.has(m.id) || !m.receipt) return m;
                if (status === 'delivered') {
                  return {
                    ...m,
                    receipt: {
                      ...m.receipt,
                      delivered: Math.min(
                        m.receipt.total,
                        m.receipt.delivered + 1,
                      ),
                    },
                  };
                }
                return {
                  ...m,
                  receipt: {
                    ...m.receipt,
                    delivered: Math.min(
                      m.receipt.total,
                      Math.max(m.receipt.delivered, m.receipt.read + 1),
                    ),
                    read: Math.min(m.receipt.total, m.receipt.read + 1),
                  },
                };
              }),
            );
          },
          onAccessRevoked: payload => {
            if (payload.conversationId !== conversationId) return;
            showAlert({
              type: 'warning',
              title: 'Chat access revoked',
              message: 'You no longer have access to this conversation.',
              onClose: () => navigation.goBack(),
            });
          },
        });
        const join = await joinConversation(conversationId);
        if (!join.ok) {
          showAlert({
            type: 'error',
            title: 'Unable to join chat',
            message: join.error?.message || 'Access denied',
          });
        } else {
          setViewing(conversationId, true);
          if (mounted) setSocketOk(true);
        }
      } catch (err) {
        showAlert({
          type: 'error',
          title: 'Chat error',
          message:
            err instanceof Error ? err.message : 'Unable to open conversation',
        });
      }
    })();

    return () => {
      mounted = false;
      setViewing(conversationId, false);
      leaveConversation(conversationId);
      emitTyping(conversationId, false);
    };
  }, [conversationId, loadConversation, loadMessages, navigation, user.id]);

  const loadOlder = async () => {
    if (!nextBefore || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await fetchMessages(conversationId, {
        before: nextBefore,
        limit: 40,
      });
      setMessages(prev => [...(data.items || []), ...prev]);
      setNextBefore(data.nextBefore);
    } finally {
      setLoadingMore(false);
    }
  };

  const onChangeText = (value: string) => {
    setText(value);
    emitTyping(conversationId, true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emitTyping(conversationId, false), 1200);
  };

  const pushOptimistic = (draft: ChatMessage) => {
    setMessages(prev => [...prev, draft]);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({animated: true}));
  };

  const sendPayload = async (payload: Record<string, unknown>, draft: ChatMessage) => {
    pushOptimistic(draft);
    setText('');
    setReplyTo(null);
    emitTyping(conversationId, false);

    const viaSocket = await socketSendMessage(conversationId, payload);
    if (viaSocket.ok && viaSocket.message) {
      setMessages(prev =>
        prev.map(m =>
          m.clientMessageId === draft.clientMessageId
            ? {...viaSocket.message!, localStatus: 'sent'}
            : m,
        ),
      );
      return;
    }

    try {
      const saved = await sendChatMessageRest(conversationId, payload);
      setMessages(prev =>
        prev.map(m =>
          m.clientMessageId === draft.clientMessageId
            ? {...saved, localStatus: 'sent'}
            : m,
        ),
      );
    } catch (err) {
      setMessages(prev =>
        prev.map(m =>
          m.clientMessageId === draft.clientMessageId
            ? {...m, localStatus: 'failed'}
            : m,
        ),
      );
      showToast({
        type: 'error',
        message:
          err && typeof err === 'object' && 'message' in err
            ? String((err as {message: string}).message)
            : 'Message failed',
      });
    }
  };

  const onSendText = async () => {
    const content = text.trim();
    if (!content || conversation?.isReadonly) return;
    const clientMessageId = newClientId();
    const draft: ChatMessage = {
      id: `local-${clientMessageId}`,
      conversationId,
      clientMessageId,
      type: 'text',
      content,
      replyToMessageId: replyTo?.id || null,
      sender: {id: user.id, name: `${user.firstName} ${user.lastName}`.trim()},
      attachments: [],
      createdAt: new Date().toISOString(),
      localStatus: 'sending',
    };
    await sendPayload(
      {
        messageType: 'text',
        content,
        clientMessageId,
        replyToMessageId: replyTo?.id || null,
      },
      draft,
    );
  };

  const onPickMedia = async (file: {uri: string; name: string; type: string}) => {
    if (!picker || conversation?.isReadonly) return;
    const kind = picker;
    setPicker(null);
    setUploading(true);
    try {
      const attachment = await uploadChatAttachment(conversationId, file, {
        kind,
      });
      const clientMessageId = newClientId();
      const draft: ChatMessage = {
        id: `local-${clientMessageId}`,
        conversationId,
        clientMessageId,
        type: kind,
        content: null,
        sender: {id: user.id, name: `${user.firstName} ${user.lastName}`.trim()},
        attachments: [attachment],
        createdAt: new Date().toISOString(),
        localStatus: 'sending',
      };
      await sendPayload(
        {
          messageType: kind,
          attachmentId: attachment.id,
          clientMessageId,
        },
        draft,
      );
    } catch (err) {
      showAlert({
        type: 'error',
        title: 'Upload failed',
        message:
          err && typeof err === 'object' && 'message' in err
            ? String((err as {message: string}).message)
            : 'Could not upload media',
      });
    } finally {
      setUploading(false);
    }
  };

  const startRecording = async () => {
    if (conversation?.isReadonly) return;
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        showAlert({
          type: 'warning',
          title: 'Microphone needed',
          message: 'Allow microphone access to send voice messages.',
        });
        return;
      }
    }
    setRecording(true);
    setRecordMs(0);
    await recorder.startRecorder();
    recorder.addRecordBackListener((e: RecordBackType) => {
      setRecordMs(e.currentPosition);
    });
  };

  const cancelRecording = async () => {
    try {
      await recorder.stopRecorder();
      recorder.removeRecordBackListener();
    } catch {
      // ignore
    }
    setRecording(false);
    setRecordMs(0);
  };

  const sendVoice = async () => {
    try {
      const path = await recorder.stopRecorder();
      recorder.removeRecordBackListener();
      setRecording(false);
      if (!path) return;
      if (recordMs > 120000) {
        showAlert({
          type: 'warning',
          title: 'Too long',
          message: 'Voice messages max 120 seconds.',
        });
        setRecordMs(0);
        return;
      }
      setUploading(true);
      const peaks = Array.from({length: 24}, (_, i) =>
        Math.max(0.15, Math.abs(Math.sin((recordMs / 1000 + i) * 0.7))),
      );
      const attachment = await uploadChatAttachment(
        conversationId,
        {
          uri: path.startsWith('file://') ? path : `file://${path}`,
          name: `voice-${Date.now()}.m4a`,
          type: 'audio/mp4',
        },
        {
          kind: 'voice',
          durationMs: String(Math.round(recordMs)),
          waveform: JSON.stringify(peaks),
        },
      );
      const clientMessageId = newClientId();
      const draft: ChatMessage = {
        id: `local-${clientMessageId}`,
        conversationId,
        clientMessageId,
        type: 'voice',
        content: null,
        sender: {id: user.id, name: `${user.firstName} ${user.lastName}`.trim()},
        attachments: [attachment],
        createdAt: new Date().toISOString(),
        localStatus: 'sending',
      };
      await sendPayload(
        {
          messageType: 'voice',
          attachmentId: attachment.id,
          clientMessageId,
        },
        draft,
      );
    } catch (err) {
      showAlert({
        type: 'error',
        title: 'Voice failed',
        message:
          err instanceof Error ? err.message : 'Could not send voice message',
      });
    } finally {
      setUploading(false);
      setRecordMs(0);
    }
  };

  const organizer = useMemo(
    () => conversation?.participants.find(p => p.roleInChat === 'organizer'),
    [conversation?.participants],
  );

  const renderAttachment = (att: ChatAttachment, mine: boolean) => {
    if (att.kind === 'image' && att.url) {
      return <RemoteImage uri={att.url} style={styles.image} />;
    }
    if (att.kind === 'video' && att.url) {
      return (
        <VideoPlayer
          uri={att.url}
          active={activeVideo === att.url}
          onActivate={() => setActiveVideo(att.url || null)}
          style={styles.video}
        />
      );
    }
    if (att.kind === 'voice') {
      return (
        <VoiceBubble
          uri={att.url || ''}
          durationMs={att.durationMs || 0}
          waveform={att.waveform || []}
          mine={mine}
        />
      );
    }
    return null;
  };

  const renderItem = ({item}: {item: ChatMessage}) => {
    const mine = item.sender?.id === user.id;
    const deleted = Boolean(item.deletedAt);
    return (
      <Pressable
        onLongPress={() => setReplyTo(item)}
        style={[styles.bubbleRow, mine && styles.bubbleRowMine]}>
        {!mine ? <Avatar uri={item.sender?.avatar || ''} size={28} /> : null}
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: mine ? theme.text : theme.surface,
              borderColor: theme.border,
            },
          ]}>
          {!mine ? (
            <Text style={[styles.sender, {color: theme.textMuted}]}>
              {item.sender?.name}
              {item.sender?.id === organizer?.id ? ' · Marshall' : ''}
            </Text>
          ) : null}
          {deleted ? (
            <Text style={{color: mine ? theme.bg : theme.textMuted}}>
              Message deleted
            </Text>
          ) : (
            <>
              {item.type === 'text' ? (
                <Text style={{color: mine ? theme.bg : theme.text}}>
                  {item.content}
                </Text>
              ) : null}
              {item.attachments?.map(att => (
                <View key={att.id}>{renderAttachment(att, mine)}</View>
              ))}
            </>
          )}
          <Text style={[styles.time, {color: mine ? theme.bgMuted : theme.textMuted}]}>
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
            {mine
              ? item.localStatus === 'sending'
                ? ' · Sending'
                : item.localStatus === 'failed'
                  ? ' · Failed'
                  : item.receipt && item.receipt.read > 0
                    ? ' · Read'
                    : item.receipt && item.receipt.delivered > 0
                      ? ' · Delivered'
                      : ' · Sent'
              : ''}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, {backgroundColor: theme.bg}]}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}>
      <View style={{paddingHorizontal: spacing.lg, paddingTop: insets.top}}>
        <BackHeader onBack={() => navigation.goBack()} title="Chat" />
      </View>
      <View style={styles.headerMeta}>
        <Text style={[styles.threadTitle, {color: theme.text}]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.metaText, {color: theme.textMuted}]}>
          {conversation?.type === 'private' ? 'Private chat' : 'Group chat'}
          {organizer ? ` · ${organizer.name}` : ''}
          {conversation?.participants
            ? ` · ${conversation.participants.length}`
            : ''}
          {socketOk ? '' : ' · Reconnecting…'}
        </Text>
        {conversation?.tripId ? (
          <Pressable
            onPress={() =>
              navigation.navigate('TripDetails', {tripId: conversation.tripId})
            }>
            <Text style={[styles.link, {color: theme.text}]}>Open trip details</Text>
          </Pressable>
        ) : null}
        {typingUser ? (
          <Text style={[styles.metaText, {color: theme.textMuted}]}>
            Someone is typing…
          </Text>
        ) : null}
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onEndReachedThreshold={0.2}
        ListHeaderComponent={
          nextBefore ? (
            <Button
              label={loadingMore ? 'Loading…' : 'Load earlier messages'}
              variant="ghost"
              onPress={loadOlder}
              disabled={loadingMore}
            />
          ) : undefined
        }
        ListEmptyComponent={
          <EmptyState
            title="No messages yet"
            message="Say hello — coordinate meeting points, gear and timing here."
          />
        }
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({animated: false})
        }
      />

      {replyTo ? (
        <View style={[styles.replyBar, {borderColor: theme.border}]}>
          <Text style={{color: theme.textMuted, flex: 1}} numberOfLines={1}>
            Replying to {replyTo.sender?.name || 'message'}
          </Text>
          <Pressable onPress={() => setReplyTo(null)}>
            <Text style={{color: theme.text}}>Cancel</Text>
          </Pressable>
        </View>
      ) : null}

      {conversation?.isReadonly ? (
        <Text style={[styles.readonly, {color: theme.textMuted}]}>
          This conversation is read-only.
        </Text>
      ) : (
        <View
          style={[
            styles.composer,
            {
              borderColor: theme.border,
              paddingBottom: Math.max(insets.bottom, spacing.md),
            },
          ]}>
          {recording ? (
            <View style={styles.recordRow}>
              <Text style={{color: theme.text}}>
                Recording {Math.round(recordMs / 1000)}s
              </Text>
              <Button label="Cancel" variant="ghost" onPress={cancelRecording} />
              <Button label="Send" onPress={sendVoice} />
            </View>
          ) : (
            <>
              <View style={styles.tools}>
                <Pressable onPress={() => setPicker('image')}>
                  <Text style={{color: theme.text}}>Photo</Text>
                </Pressable>
                <Pressable onPress={() => setPicker('video')}>
                  <Text style={{color: theme.text}}>Video</Text>
                </Pressable>
                <Pressable onPress={startRecording}>
                  <Text style={{color: theme.text}}>Voice</Text>
                </Pressable>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  value={text}
                  onChangeText={onChangeText}
                  placeholder="Message"
                  placeholderTextColor={theme.textMuted}
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      borderColor: theme.border,
                      backgroundColor: theme.surface,
                    },
                  ]}
                  multiline
                />
                <Button
                  label={uploading ? '…' : 'Send'}
                  onPress={onSendText}
                  disabled={uploading || !text.trim()}
                />
              </View>
            </>
          )}
          {uploading ? (
            <ActivityIndicator color={theme.text} style={{marginTop: spacing.sm}} />
          ) : null}
        </View>
      )}

      <ImagePickerSheet
        visible={picker === 'image'}
        title="Send photo"
        mediaType="photo"
        uploading={uploading}
        onSelect={onPickMedia}
        onClose={() => setPicker(null)}
      />
      <ImagePickerSheet
        visible={picker === 'video'}
        title="Send video"
        mediaType="video"
        uploading={uploading}
        onSelect={onPickMedia}
        onClose={() => setPicker(null)}
      />
    </KeyboardAvoidingView>
  );
}

function VoiceBubble({
  uri,
  durationMs,
  waveform,
  mine,
}: {
  uri: string;
  durationMs: number;
  waveform: number[];
  mine: boolean;
}) {
  const theme = useThemeColors();
  const player = Sound;
  const [playing, setPlaying] = useState(false);

  const toggle = async () => {
    if (!uri) return;
    if (playing) {
      await player.pausePlayer();
      setPlaying(false);
      return;
    }
    await player.startPlayer(uri);
    setPlaying(true);
    player.addPlayBackListener((e: PlayBackType) => {
      if (e.currentPosition >= e.duration) {
        setPlaying(false);
        player.stopPlayer();
        player.removePlayBackListener();
      }
    });
  };

  return (
    <Pressable onPress={toggle} style={styles.voiceRow}>
      <Text style={{color: mine ? theme.bg : theme.text}}>
        {playing ? 'Pause' : 'Play'}
      </Text>
      <View style={styles.wave}>
        {(waveform.length ? waveform : [0.3, 0.6, 0.4, 0.8, 0.5]).map((v, i) => (
          <View
            key={i}
            style={{
              width: 3,
              height: 8 + v * 18,
              marginHorizontal: 1,
              backgroundColor: mine ? theme.bg : theme.text,
              opacity: 0.75,
            }}
          />
        ))}
      </View>
      <Text style={{color: mine ? theme.bgMuted : theme.textMuted}}>
        {Math.max(1, Math.round((durationMs || 0) / 1000))}s
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  headerMeta: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: 2,
  },
  threadTitle: {...typography.title, fontSize: 18},
  metaText: {...typography.caption},
  link: {...typography.label, marginTop: 4},
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    flexGrow: 1,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    maxWidth: '92%',
  },
  bubbleRowMine: {alignSelf: 'flex-end'},
  bubble: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxWidth: '85%',
  },
  sender: {...typography.label, fontSize: 10, marginBottom: 2},
  time: {...typography.caption, fontSize: 10, marginTop: 4},
  image: {width: 220, height: 160, marginTop: spacing.xs},
  video: {width: 240, marginTop: spacing.xs},
  voiceRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  wave: {flexDirection: 'row', alignItems: 'flex-end', height: 28},
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  composer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingBottom: spacing.md,
  },

  tools: {flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.xs},
  inputRow: {flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm},
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  readonly: {
    ...typography.caption,
    textAlign: 'center',
    padding: spacing.md,
  },
});
