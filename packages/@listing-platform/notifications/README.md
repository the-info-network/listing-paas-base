# @listing-platform/notifications

Notifications SDK for push notifications, email, SMS, and in-app alerts.

## Features

- **In-App Notifications** - Real-time notification center
- **Push Notifications** - Web push support
- **Email Templates** - Pre-built email components
- **Notification Preferences** - User preference management

## Usage

```tsx
import { NotificationCenter, NotificationBell, useNotifications } from '@listing-platform/notifications';

// Notification bell with badge
<NotificationBell onClick={() => setShowCenter(true)} />

// Notification center panel
<NotificationCenter onClose={() => setShowCenter(false)} />

// Hook for notifications
const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
```

## License

MIT
