export type ChatConversationType = 'group' | 'private';

export type ChatMessageType = 'text' | 'image' | 'video' | 'voice' | 'system';

export type ChatAttachment = {
  id: string;
  kind: 'image' | 'video' | 'voice';
  mimeType: string;
  byteSize: number;
  width?: number | null;
  height?: number | null;
  durationMs?: number | null;
  waveform?: number[] | null;
  thumbnailUrl?: string | null;
  url?: string | null;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  clientMessageId?: string | null;
  type: ChatMessageType;
  content?: string | null;
  replyToMessageId?: string | null;
  sender?: {id: string; name: string; avatar?: string | null} | null;
  attachments: ChatAttachment[];
  createdAt: string;
  editedAt?: string | null;
  deletedAt?: string | null;
  receipt?: {delivered: number; read: number; total: number} | null;
  myReceipt?: {delivered_at?: string | null; read_at?: string | null} | null;
  /** Local-only optimistic state */
  localStatus?: 'sending' | 'failed' | 'sent';
};

export type ChatInboxItem = {
  id: string;
  type: ChatConversationType;
  tripId: string;
  privateMemberId?: string | null;
  tripTitle: string;
  tripDate?: string;
  coverImage?: string | null;
  isReadonly: boolean;
  isArchived: boolean;
  lastMessageAt?: string | null;
  lastPreview?: string | null;
  unreadCount: number;
};

export type ChatConversation = {
  id: string;
  type: ChatConversationType;
  tripId: string;
  privateMemberId?: string | null;
  isReadonly: boolean;
  isArchived: boolean;
  unreadCount: number;
  trip?: {
    id: string;
    title: string;
    date?: string;
    coverImage?: string | null;
    organizerId?: string;
    status?: string;
  } | null;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string | null;
    roleInChat: string;
  }>;
};
