/**
 * Types for Messaging SDK
 */

export interface Conversation {
  id: string;
  participants: Participant[];
  listingId?: string;
  listing?: ListingSummary;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  isOnline?: boolean;
  lastSeenAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  attachments?: Attachment[];
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface ListingSummary {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string;
}

export interface SendMessageInput {
  content: string;
  attachments?: File[];
}

export interface CreateConversationInput {
  recipientId: string;
  listingId?: string;
  initialMessage: string;
}

export interface ConversationFilters {
  listingId?: string;
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface MessageFilters {
  limit?: number;
  before?: string;
  after?: string;
}
