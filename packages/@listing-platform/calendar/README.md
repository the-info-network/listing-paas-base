# @listing-platform/calendar

Calendar and event scheduling SDK for availability and appointments.

## Features

- **Calendar View** - Month, week, day views
- **Event Management** - Create, edit, delete events
- **Availability** - Set recurring availability
- **Time Slots** - Booking time slots

## Usage

```tsx
import { Calendar, EventList, TimeSlotPicker } from '@listing-platform/calendar';

<Calendar events={events} onDateClick={(date) => setSelected(date)} />
<TimeSlotPicker date={selectedDate} slots={slots} onSelect={(slot) => book(slot)} />
```

## License

MIT
