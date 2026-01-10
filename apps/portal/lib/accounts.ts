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

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Fetch featured accounts/tenants
 * Uses the public API endpoint (no auth required)
 */
export async function getFeaturedAccounts(limit: number = 4): Promise<FeaturedAccount[]> {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('id, name, domain, avatar_url, plan, created_at, description')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch accounts from Supabase:', error.message);
      return [];
    }

    return (data || []).map((account) => ({
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

