# @listing-platform/messaging

Messaging SDK for user-to-user communication on listing platforms. Enables inquiries, conversations, and real-time messaging.

## Installation

```bash
pnpm add @listing-platform/messaging
```

## Features

- **Conversations** - Threaded messaging between users
- **Inquiry Forms** - Contact listing owners
- **Real-time Updates** - Live message delivery
- **Unread Counts** - Track unread messages
- **Attachments** - Send images and files

## Usage

### Components

```tsx
import { 
  ConversationList, 
  MessageThread, 
  MessageInput,
  InquiryForm 
} from '@listing-platform/messaging';

// List all conversations
<ConversationList 
  onConversationClick={(conv) => setActiveConversation(conv.id)}
/>

// Show message thread
<MessageThread conversationId={conversationId} />

// Message input
<MessageInput 
  conversationId={conversationId}
  onSend={(message) => console.log('Sent:', message)}
/>

// Inquiry form for listings
<InquiryForm 
  listingId="123"
  recipientId={listingOwnerId}
  onSend={(conversationId) => router.push(`/messages/${conversationId}`)}
/>
```

### Hooks

```tsx
import { 
  useConversations, 
  useMessages, 
  useSendMessage,
  useUnreadCount 
} from '@listing-platform/messaging/hooks';

// Get conversations
const { conversations, isLoading, unreadTotal } = useConversations();

// Get messages
const { messages, isLoading, hasMore, loadMore } = useMessages(conversationId);

// Send message
const { send, isSending } = useSendMessage();
await send(conversationId, { content: 'Hello!' });

// Unread count
const { count, isLoading } = useUnreadCount();
```

## Types

```tsx
import type { 
  Conversation, 
  Message, 
  MessageThread 
} from '@listing-platform/messaging/types';
```

## License

MIT
