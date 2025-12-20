/**
 * Types for Chat SDK
 */
export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  attachments?: ChatAttachment[];
  createdAt: string;
  isOwn?: boolean;
}

export interface ChatAttachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  name: string;
  size?: number;
}

export interface ChatRoom {
  id: string;
  name?: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}

export interface ChatParticipant {
  id: string;
  name: string;
  avatarUrl?: string;
  isOnline?: boolean;
}

export interface TypingIndicator {
  roomId: string;
  userId: string;
  userName: string;
}

export interface ChatConfig {
  wsUrl: string;
  enableTypingIndicators?: boolean;
  enableReadReceipts?: boolean;
  enableFileUploads?: boolean;
}
