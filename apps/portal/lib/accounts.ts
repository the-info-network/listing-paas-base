/**
 * Account/User Data Fetching Helpers
 * 
 * Functions to fetch account/tenant information for showcasing on the portal
 */

export interface FeaturedAccount {
  id: string;
  name: string;
  domain: string;
  description?: string;
  plan: string;
  avatar_url?: string;
  created_at: string;
}

// CUSTOMIZE: Update API_URL to match your deployment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Fetch featured accounts/tenants
 * Uses the public API endpoint (no auth required)
 */
export async function getFeaturedAccounts(limit: number = 4): Promise<FeaturedAccount[]> {
  try {
    const response = await fetch(`${API_URL}/api/public/accounts/featured?limit=${limit}`, {
      next: { revalidate: 300 }, // ISR: Revalidate every 5 minutes
    });

    if (!response.ok) {
      if (response.status === 404) return [];
      console.error(`Failed to fetch accounts: ${response.statusText}`);
      return [];
    }

    const result = await response.json();

    // Handle both { success: true, data: [...] } and direct array responses
    const raw = Array.isArray(result?.data)
      ? result.data
      : Array.isArray(result)
        ? result
        : [];

    // Map to FeaturedAccount format
    return raw.map((account: FeaturedAccount) => ({
      id: account.id,
      name: account.name,
      domain: account.domain,
      description: account.description || `${account.name} - Quality services you can trust`,
      plan: account.plan || 'starter',
      avatar_url: account.avatar_url,
      created_at: account.created_at || new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching featured accounts:', error);
    return [];
  }
}

