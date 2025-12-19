# @listing-platform/crm

CRM and lead management SDK for listing platforms. Provides components, hooks, and utilities for managing contacts, companies, deals, and activities.

## Installation

```bash
pnpm add @listing-platform/crm
```

## Features

- **Contact Management** - Create, view, and manage contacts
- **Company Tracking** - Manage companies and link to contacts
- **Deal Pipeline** - Kanban-style deal management
- **Activity Timeline** - Track all interactions
- **Lead Capture** - Embeddable lead capture forms
- **Headless Components** - Full customization with render props

## Usage

### Components

```tsx
import { 
  LeadCapture, 
  LeadPipeline, 
  ContactCard, 
  DealCard, 
  ActivityTimeline 
} from '@listing-platform/crm';

// Lead capture form
<LeadCapture 
  listingId="123"
  source="contact_form"
  onSubmit={(leadId) => console.log('Lead captured:', leadId)}
/>

// Pipeline view
<LeadPipeline 
  filters={{ assignedTo: userId }}
  onDealClick={(deal) => router.push(`/deals/${deal.id}`)}
/>

// Contact card
<ContactCard contact={contact} onEdit={handleEdit} />

// Activity timeline
<ActivityTimeline entityId={contactId} entityType="contact" />
```

### Hooks

```tsx
import { 
  useContacts, 
  useContact,
  useDeals, 
  usePipeline, 
  useTasks,
  useActivities 
} from '@listing-platform/crm/hooks';

// List contacts
const { contacts, isLoading, total } = useContacts({ 
  search: 'john',
  companyId: '123',
});

// Get single contact
const { contact, isLoading } = useContact(contactId);

// Get deals pipeline
const { stages, deals, isLoading } = usePipeline();

// Get activities for an entity
const { activities, isLoading } = useActivities(contactId, 'contact');
```

### Headless Components

```tsx
import { LeadCaptureHeadless, PipelineHeadless } from '@listing-platform/crm/headless';

<LeadCaptureHeadless
  listingId="123"
  source="inquiry"
  renderField={(props) => <YourField {...props} />}
  renderSubmit={(props) => <YourButton {...props} />}
/>

<PipelineHeadless
  filters={filters}
  renderStage={(props) => <YourStage {...props} />}
  renderDeal={(props) => <YourDealCard {...props} />}
/>
```

## Types

```tsx
import type { 
  Contact, 
  Company, 
  Deal, 
  DealStage,
  Task, 
  Activity,
  Pipeline 
} from '@listing-platform/crm/types';
```

## Configuration

Configure CRM settings in `features.config.ts`:

```ts
crm: {
  enabled: true,
  config: {
    leadCapture: true,
    emailNotifications: true,
    smsNotifications: false,
    autoResponder: true,
    leadScoring: false,
    pipelineStages: ['new', 'contacted', 'qualified', 'converted'],
  },
}
```

## License

MIT
