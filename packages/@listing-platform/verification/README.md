# @listing-platform/verification

Verification SDK for ID verification, business verification, and trust badges.

## Features

- **ID Verification** - Identity document verification
- **Business Verification** - Business license validation
- **Trust Badges** - Display verification status
- **Background Checks** - Optional background verification
- **Social Verification** - Social media account linking

## Usage

```tsx
import { VerificationBadge, VerificationFlow, useVerificationStatus } from '@listing-platform/verification';

// Display verification badge
<VerificationBadge userId={userId} />

// Start verification flow
<VerificationFlow type="identity" onComplete={(result) => console.log(result)} />

// Check verification status
const { isVerified, verifications } = useVerificationStatus(userId);
```

## License

MIT
