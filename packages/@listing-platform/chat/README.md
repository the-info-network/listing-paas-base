# @listing-platform/chat

Real-time chat widget SDK with WebSocket support.

## Features

- **Chat Widget** - Embeddable chat widget
- **Real-time** - WebSocket-based messaging
- **Typing Indicators** - Show when users are typing
- **Message History** - Load previous messages
- **File Attachments** - Send images and files

## Usage

```tsx
import { ChatWidget, ChatProvider, useChat } from '@listing-platform/chat';

<ChatProvider wsUrl={process.env.NEXT_PUBLIC_WS_URL}>
  <ChatWidget roomId={listingId} />
</ChatProvider>
```

## License

MIT
