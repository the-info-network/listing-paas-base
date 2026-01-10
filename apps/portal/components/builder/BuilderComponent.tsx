'use client';

import { builder, BuilderComponent as BuilderComponentRenderer } from '@builder.io/react';
import { useEffect, useState } from 'react';
import { builderConfig } from '@/builder.config';
// Import component registration
import '@/components/builder/register-components';

// Initialize Builder.io SDK
if (builderConfig.apiKey) {
  builder.init(builderConfig.apiKey);
}

/**
 * Builder.io Component Wrapper
 * 
 * Renders Builder.io content with error handling and SSR support.
 * Supports both published and draft (preview) content.
 */
interface BuilderComponentProps {
  model?: string;
  content?: any;
  options?: {
    preview?: boolean;
    entry?: string;
    [key: string]: any;
  };
  children?: React.ReactNode;
}

export function BuilderComponent({
  model = builderConfig.model,
  content,
  options = {},
}: BuilderComponentProps) {
  const [builderContent, setBuilderContent] = useState<any>(content);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If content is provided, use it directly
    if (content) {
      setBuilderContent(content);
      return;
    }

    // Otherwise, fetch content from Builder.io
    if (!builderConfig.apiKey) {
      setError('Builder.io API key is not configured');
      return;
    }

    const fetchContent = async () => {
      try {
        const fetchedContent = await builder
          .get(model, {
            ...options,
            preview: builderConfig.preview || options.preview,
          })
          .promise();

        setBuilderContent(fetchedContent);
      } catch (err) {
        console.error('Error fetching Builder.io content:', err);
        setError('Failed to load Builder.io content');
      }
    };

    fetchContent();
  }, [model, content, options]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (!builderContent) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600">Loading Builder.io content...</p>
      </div>
    );
  }

  return (
    <BuilderComponentRenderer
      model={model}
      content={builderContent}
      options={{
        ...options,
        // Enable visual editing when in preview mode or when builder.io editing is active
        noTrack: false,
        // Enable visual editing overlay
        ...(builderConfig.preview && {
          builderOptions: {
            enableVisualEditing: true,
          },
        }),
      }}
    />
  );
}

