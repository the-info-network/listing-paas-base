"use client";

import { type Listing, formatPrice } from "@/lib/listings";
import { ListingGallery } from "./ListingGallery";
import { ListingMap } from "./ListingMap";

/**
 * ListingDetail - Full listing view component
 *
 * CUSTOMIZE: Update this component to display all relevant fields for your listing type
 * - Real estate: Property details, amenities, HOA, tax info
 * - Services: Pricing tiers, availability calendar, reviews
 * - Directory: Business hours, contact info, services offered
 */

interface ListingDetailProps {
  listing: Listing;
}

export function ListingDetail({ listing }: ListingDetailProps) {
  // Mock rating data
  const rating = 4.7;
  const reviewCount = 48;

  const renderStars = (rate: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rate)
            ? "fill-yellow-400 text-yellow-400"
            : "fill-gray-300 dark:fill-gray-600 text-gray-300 dark:text-gray-600"
        }`}
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ));
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Gallery Section */}
      <ListingGallery images={listing.images} title={listing.title} />

      {/* Main Content Grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Provider Header Card - Service Focus */}
          <div className="bg-gradient-to-r from-orange-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-orange-100 dark:border-orange-900/30">
            <div className="flex items-start gap-4">
              {/* Provider Avatar */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>

              {/* Provider Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {listing.title}
                </h1>

                {/* Rating and Reviews */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1">
                    {renderStars(rating)}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">{rating}</span>
                    <span className="text-gray-500 dark:text-gray-400"> ({reviewCount} reviews)</span>
                  </div>
                </div>

                {/* Location */}
                {listing.location && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p>
                      {[
                        listing.location.address,
                        listing.location.city,
                        listing.location.state,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                )}
              </div>

              {/* Badge */}
              {listing.category && (
                <div className="text-right">
                  <span className="inline-block bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-bold px-3 py-1.5 rounded-full">
                    {listing.category}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Pricing and Service Tiers */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Basic Tier */}
              <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-orange-400 dark:hover:border-orange-600 transition-colors cursor-pointer">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Basic</h3>
                <div className="text-2xl font-bold text-warm-primary mb-3">{formatPrice(listing.price)}</div>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                    Standard service
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                    30-minute session
                  </li>
                </ul>
              </div>

              {/* Professional Tier */}
              <div className="border-2 border-orange-400 dark:border-orange-600 rounded-xl p-4 relative bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-900/10 dark:to-transparent">
                <div className="absolute -top-3 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 mt-2">Professional</h3>
                <div className="text-2xl font-bold text-warm-primary mb-3">{formatPrice(Math.round(listing.price * 1.5))}</div>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                    Enhanced service
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                    60-minute session
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                    Priority support
                  </li>
                </ul>
              </div>

              {/* Premium Tier */}
              <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-cyan-400 dark:hover:border-cyan-600 transition-colors cursor-pointer">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Premium</h3>
                <div className="text-2xl font-bold text-accent-secondary mb-3">{formatPrice(Math.round(listing.price * 2.5))}</div>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                    Full service
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                    120-minute session
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                    24/7 support
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Availability</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, idx) => (
                <div key={day} className={`p-3 rounded-lg text-center font-medium transition-colors ${
                  idx < 5
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-2 border-green-200 dark:border-green-800'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600'
                }`}>
                  {day}
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <strong>Hours:</strong> 9:00 AM - 6:00 PM
            </p>
          </div>

          {/* CUSTOMIZE: Add custom fields section for your vertical */}
          {/* Example for real estate:
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {listing.customFields?.bedrooms || 0}
              </div>
              <div className="text-sm text-gray-500">Bedrooms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {listing.customFields?.bathrooms || 0}
              </div>
              <div className="text-sm text-gray-500">Bathrooms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {listing.customFields?.sqft?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-500">Sq Ft</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {listing.customFields?.yearBuilt || 'N/A'}
              </div>
              <div className="text-sm text-gray-500">Year Built</div>
            </div>
          </div>
          */}

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Description
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          </div>

          {/* CUSTOMIZE: Add additional sections for your vertical */}
          {/* Examples:
            - Amenities list
            - Services offered
            - Business hours
            - Reviews section
            - Availability calendar
          */}

          {/* Map Section */}
          {listing.location?.lat && listing.location?.lng && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Location
              </h2>
              <ListingMap
                lat={listing.location.lat}
                lng={listing.location.lng}
                title={listing.title}
              />
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-4">
            {/* Contact/CTA Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {/* CUSTOMIZE: Update CTA text for your vertical */}
                Interested in this listing?
              </h3>

              {/* CUSTOMIZE: Add appropriate CTAs for your vertical */}
              <button
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors mb-3"
              >
                {/* CUSTOMIZE: "Schedule Tour", "Book Now", "Contact" */}
                Contact Seller
              </button>

              <button
                type="button"
                className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Save to Favorites
              </button>
            </div>

            {/* Listing Meta Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm text-gray-500 dark:text-gray-400">
              <p>Listed: {new Date(listing.createdAt).toLocaleDateString()}</p>
              <p>Updated: {new Date(listing.updatedAt).toLocaleDateString()}</p>
              {listing.category && <p>Category: {listing.category}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListingDetail;
