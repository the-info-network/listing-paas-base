/**
 * Builder.io Utilities
 * 
 * Helper functions for working with Builder.io content
 */

import { builder } from '@builder.io/react';
import { builderConfig } from '@/builder.config';

/**
 * Fetch Builder.io content for a given path
 */
export async function getBuilderContent(
  path: string,
  options: {
    preview?: boolean;
    model?: string;
    [key: string]: any;
  } = {}
): Promise<any> {
  if (!builderConfig.apiKey) {
    throw new Error('Builder.io API key is not configured');
  }

  const model = options.model || builderConfig.model;
  const preview = options.preview ?? builderConfig.preview;

  try {
    const content = await builder
      .get(model, {
        ...options,
        url: path,
        preview,
      })
      .promise();

    return content;
  } catch (error) {
    console.error('Error fetching Builder.io content:', error);
    return null;
  }
}

/**
 * Check if a path is a Builder.io page
 */
export async function isBuilderPage(path: string): Promise<boolean> {
  if (!builderConfig.apiKey) {
    return false;
  }

  try {
    const content = await getBuilderContent(path);
    return !!content;
  } catch {
    return false;
  }
}

/**
 * Get Builder.io model configuration
 */
export function getBuilderModel(modelName: string = builderConfig.model) {
  return {
    name: modelName,
    apiKey: builderConfig.apiKey,
    preview: builderConfig.preview,
  };
}

/**
 * Get Builder.io content by entry ID
 */
export async function getBuilderContentById(
  entryId: string,
  options: {
    preview?: boolean;
    model?: string;
    [key: string]: any;
  } = {}
): Promise<any> {
  if (!builderConfig.apiKey) {
    throw new Error('Builder.io API key is not configured');
  }

  const model = options.model || builderConfig.model;
  const preview = options.preview ?? builderConfig.preview;

  try {
    const content = await builder
      .get(model, {
        ...options,
        entry: entryId,
        preview,
      })
      .promise();

    return content;
  } catch (error) {
    console.error('Error fetching Builder.io content by ID:', error);
    return null;
  }
}

