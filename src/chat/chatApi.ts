import {apiRequest, apiUpload, loadStoredAccessToken} from '../api/client';
import {API_BASE_URL} from '../config/api';
import {ChatAttachment, ChatConversation, ChatInboxItem, ChatMessage} from './types';

export async function fetchChatInbox() {
  return apiRequest<{items: ChatInboxItem[]}>('/chat/inbox');
}

export async function fetchConversation(id: string) {
  return apiRequest<ChatConversation>(`/chat/conversations/${id}`);
}

export async function fetchMessages(
  conversationId: string,
  params: {before?: string; limit?: number} = {},
) {
  const qs = new URLSearchParams();
  if (params.before) qs.set('before', params.before);
  if (params.limit) qs.set('limit', String(params.limit));
  const suffix = qs.toString() ? `?${qs}` : '';
  return apiRequest<{items: ChatMessage[]; nextBefore: string | null}>(
    `/chat/conversations/${conversationId}/messages${suffix}`,
  );
}

export async function openTripGroupChat(tripId: string) {
  return apiRequest<ChatConversation>(`/chat/trips/${tripId}/group`, {
    method: 'POST',
    body: '{}',
  });
}

export async function openTripPrivateChat(tripId: string) {
  return apiRequest<ChatConversation>(`/chat/trips/${tripId}/private`, {
    method: 'POST',
    body: '{}',
  });
}

export async function openPrivateAsMarshall(tripId: string, memberId: string) {
  return apiRequest<ChatConversation>(
    `/chat/trips/${tripId}/private/${memberId}`,
    {method: 'POST', body: '{}'},
  );
}

export async function sendChatMessageRest(
  conversationId: string,
  payload: Record<string, unknown>,
) {
  return apiRequest<ChatMessage>(`/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function uploadChatAttachment(
  conversationId: string,
  file: {uri: string; name: string; type: string},
  fields: Record<string, string>,
) {
  return apiUpload<ChatAttachment>(
    `/chat/conversations/${conversationId}/attachments`,
    file,
    fields,
  );
}

export async function markConversationRead(
  conversationId: string,
  upToMessageId?: string,
) {
  return apiRequest(`/chat/conversations/${conversationId}/read`, {
    method: 'POST',
    body: JSON.stringify({upToMessageId: upToMessageId || null}),
  });
}

export async function markMessagesDelivered(
  conversationId: string,
  messageIds: string[],
) {
  return apiRequest(`/chat/conversations/${conversationId}/delivered`, {
    method: 'POST',
    body: JSON.stringify({messageIds}),
  });
}

export function chatSocketUrl() {
  // API_BASE_URL ends with /api — Socket.IO mounts on the HTTP origin root.
  return API_BASE_URL.replace(/\/api\/?$/, '');
}

export async function getAccessTokenForSocket() {
  return loadStoredAccessToken();
}
