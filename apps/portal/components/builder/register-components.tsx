/**
 * Builder.io Component Registration
 * 
 * Register existing portal components with Builder.io so they can be used
 * in the visual editor. Uncomment and configure components as needed.
 */

import { builder } from '@builder.io/react';
import { builderConfig } from '@/builder.config';

// Import existing components
// import { ListingCard } from '@/components/listings/ListingCard';
// import { SearchBar } from '@/components/search/SearchBar';
// import { AccountCard } from '@/components/accounts/AccountCard';
// import { Header } from '@/components/layout/Header';
// import { Footer } from '@/components/layout/Footer';

/**
 * Register all custom components with Builder.io
 * 
 * This allows Builder.io visual editor to use your existing React components.
 * Components registered here can be dragged and dropped in Builder.io.
 */
export function registerBuilderComponents() {
  if (!builderConfig.apiKey) {
    console.warn('Builder.io API key not configured, skipping component registration');
    return;
  }

  // Example: Register ListingCard component
  // builder.registerComponent(ListingCard, {
  //   name: 'ListingCard',
  //   description: 'Display a listing card with image, title, and details',
  //   inputs: [
  //     {
  //       name: 'listing',
  //       type: 'object',
  //       required: true,
  //       defaultValue: {},
  //     },
  //   ],
  // });

  // Example: Register SearchBar component
  // builder.registerComponent(SearchBar, {
  //   name: 'SearchBar',
  //   description: 'Search bar for finding listings',
  //   inputs: [
  //     {
  //       name: 'placeholder',
  //       type: 'string',
  //       defaultValue: 'Search listings...',
  //     },
  //     {
  //       name: 'showFiltersButton',
  //       type: 'boolean',
  //       defaultValue: true,
  //     },
  //   ],
  // });

  // Example: Register AccountCard component
  // builder.registerComponent(AccountCard, {
  //   name: 'AccountCard',
  //   description: 'Display an account card',
  //   inputs: [
  //     {
  //       name: 'account',
  //       type: 'object',
  //       required: true,
  //     },
  //   ],
  // });

  // Add more component registrations as needed
  // See Builder.io docs: https://www.builder.io/c/docs/custom-react-components
}

// Auto-register components on client side
if (typeof window !== 'undefined') {
  registerBuilderComponents();
}

