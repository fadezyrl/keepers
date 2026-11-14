import {io, Socket} from 'socket.io-client';
import {chatSocketUrl, getAccessTokenForSocket} from './chatApi';
import {ChatMessage} from './types';

type Handlers = {
  onMessageNew?: (message: ChatMessage) => void;
  onMessageDeleted?: (payload: {messageId: string; conversationId: string}) => void;
  onTyping?: (payload: {
    conversationId: string;
    userId: string;
    isTyping: boolean;
  }) => void;
  onReceipt?: (payload: {
    conversationId?: string;
    messageId?: string;
    messageIds?: string[];
    userId?: string;
    status?: string;
    deliveredAt?: string;
    readAt?: string;
  }) => void;
  onAccessRevoked?: (payload: {conversationId: string}) => void;
  onReady?: () => void;
  onDisconnect?: () => void;
};

let socket: Socket | null = null;
let deviceId = `rn-${Date.now()}`;

export function getChatDeviceId() {
  return deviceId;
}

export function setChatDeviceId(id: string) {
  deviceId = id || deviceId;
}

export async function connectChatSocket(handlers: Handlers = {}) {
  const token = await getAccessTokenForSocket();
  if (!token) throw new Error('Not authenticated');

  if (socket?.connected) {
    bindHandlers(socket, handlers);
    return socket;
  }

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  socket = io(chatSocketUrl(), {
    path: '/socket.io',
    transports: ['websocket'],
    auth: {token, deviceId},
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 800,
  });

  bindHandlers(socket, handlers);
  return socket;
}

function bindHandlers(s: Socket, handlers: Handlers) {
  s.off('chat:ready');
  s.off('chat:message.new');
  s.off('chat:message.deleted');
  s.off('chat:typing');
  s.off('chat:receipt.update');
  s.off('chat:access.revoked');
  s.off('disconnect');

  s.on('chat:ready', () => handlers.onReady?.());
  s.on('chat:message.new', (payload: {message: ChatMessage}) => {
    if (payload?.message) handlers.onMessageNew?.(payload.message);
  });
  s.on('chat:message.deleted', payload => handlers.onMessageDeleted?.(payload));
  s.on('chat:typing', payload => handlers.onTyping?.(payload));
  s.on('chat:receipt.update', payload => handlers.onReceipt?.(payload));
  s.on('chat:access.revoked', payload => handlers.onAccessRevoked?.(payload));
  s.on('disconnect', () => handlers.onDisconnect?.());
}

export function getChatSocket() {
  return socket;
}

export function disconnectChatSocket() {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}

export function joinConversation(conversationId: string) {
  return new Promise<{ok: boolean; error?: {message: string}}>(resolve => {
    if (!socket?.connected) {
      resolve({ok: false, error: {message: 'Socket not connected'}});
      return;
    }
    socket.emit('chat:join', {conversationId}, (ack: any) => resolve(ack || {ok: false}));
  });
}

export function leaveConversation(conversationId: string) {
  socket?.emit('chat:leave', {conversationId});
}

export function setViewing(conversationId: string, viewing: boolean) {
  socket?.emit('chat:presence.viewing', {conversationId, viewing});
}

export function emitTyping(conversationId: string, isTyping: boolean) {
  socket?.emit('chat:typing', {conversationId, isTyping});
}

export function socketSendMessage(
  conversationId: string,
  payload: Record<string, unknown>,
) {
  return new Promise<{ok: boolean; message?: ChatMessage; error?: {code?: string; message: string}}>(
    resolve => {
      if (!socket?.connected) {
        resolve({ok: false, error: {message: 'Socket not connected'}});
        return;
      }
      socket.emit(
        'chat:message.send',
        {conversationId, ...payload},
        (ack: any) => resolve(ack || {ok: false}),
      );
    },
  );
}

export function socketAckDelivered(conversationId: string, messageIds: string[]) {
  socket?.emit('chat:receipt.delivered', {conversationId, messageIds});
}

export function socketAckRead(conversationId: string, upToMessageId?: string) {
  socket?.emit('chat:receipt.read', {conversationId, upToMessageId});
}
