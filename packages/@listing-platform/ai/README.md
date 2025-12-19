# @listing-platform/ai

AI SDK for recommendations, auto-categorization, and content generation.

## Features

- **Recommendations** - Personalized listing suggestions
- **Auto-categorization** - Automatic category detection
- **Content Generation** - AI-powered descriptions
- **Image Tagging** - Automatic image labels
- **Similarity Search** - Find similar listings

## Usage

```tsx
import { RecommendedListings, useAIRecommendations, useContentGenerator } from '@listing-platform/ai';

// Display AI recommendations
<RecommendedListings userId={userId} limit={6} />

// Generate content
const { generate, isGenerating } = useContentGenerator();
const description = await generate('description', { title, category });
```

## License

MIT
