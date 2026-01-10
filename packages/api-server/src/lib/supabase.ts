import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// #region agent log
console.log('[DEBUG] Env vars check:', {hasSupabaseUrl:!!supabaseUrl,hasServiceKey:!!supabaseServiceKey,hasAnonKey:!!supabaseAnonKey,serviceKeyLength:supabaseServiceKey?.length||0,urlPrefix:supabaseUrl?.substring(0,20)||'missing'});
fetch('http://127.0.0.1:7248/ingest/eed908bc-e684-48e5-ad88-bbd7eba2f91e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase.ts:7',message:'Env vars check',data:{hasSupabaseUrl:!!supabaseUrl,hasServiceKey:!!supabaseServiceKey,hasAnonKey:!!supabaseAnonKey,serviceKeyLength:supabaseServiceKey?.length||0,urlPrefix:supabaseUrl?.substring(0,20)||'missing'},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'A,B,C,D'})}).catch(()=>{});
// #endregion

if (!supabaseUrl) {
  // #region agent log
  fetch('http://127.0.0.1:7248/ingest/eed908bc-e684-48e5-ad88-bbd7eba2f91e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase.ts:15',message:'Missing SUPABASE_URL',data:{error:'SUPABASE_URL is required'},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  throw new Error('SUPABASE_URL is required');
}

// Non-null assertion after validation
const SUPABASE_URL = supabaseUrl;

/**
 * Create a Supabase client with service role (admin) privileges
 * Use this for server-side operations that bypass RLS
 */
export function createAdminClient(): SupabaseClient {
  // #region agent log
  fetch('http://127.0.0.1:7248/ingest/eed908bc-e684-48e5-ad88-bbd7eba2f91e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase.ts:22',message:'createAdminClient called',data:{hasServiceKey:!!supabaseServiceKey,urlPrefix:SUPABASE_URL.substring(0,30)},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'B,D'})}).catch(()=>{});
  // #endregion
  
  if (!supabaseServiceKey) {
  // #region agent log
  console.error('[DEBUG] Missing SUPABASE_SERVICE_KEY');
  fetch('http://127.0.0.1:7248/ingest/eed908bc-e684-48e5-ad88-bbd7eba2f91e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase.ts:25',message:'Missing SUPABASE_SERVICE_KEY',data:{error:'SUPABASE_SERVICE_KEY is required for admin client'},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'B,D'})}).catch(()=>{});
  // #endregion
    throw new Error('SUPABASE_SERVICE_KEY is required for admin client');
  }
  
  try {
    const client = createClient(SUPABASE_URL, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    // #region agent log
    fetch('http://127.0.0.1:7248/ingest/eed908bc-e684-48e5-ad88-bbd7eba2f91e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase.ts:35',message:'Admin client created successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'B,D'})}).catch(()=>{});
    // #endregion
    return client;
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7248/ingest/eed908bc-e684-48e5-ad88-bbd7eba2f91e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase.ts:40',message:'Failed to create admin client',data:{error:err instanceof Error?err.message:String(err)},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    throw err;
  }
}

/**
 * Create a Supabase client with anon key
 * Use this for public operations or when you want RLS to apply
 */
export function createAnonClient() {
  if (!supabaseAnonKey) {
    throw new Error('SUPABASE_ANON_KEY is required for anon client');
  }
  
  return createClient(SUPABASE_URL, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Create a Supabase client with a user's JWT token
 * This applies RLS policies based on the authenticated user
 */
export function createUserClient(accessToken: string): SupabaseClient {
  if (!supabaseAnonKey) {
    throw new Error('SUPABASE_ANON_KEY is required for user client');
  }
  
  return createClient(SUPABASE_URL, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

// Singleton admin client for reuse
let adminClientInstance: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  // #region agent log
  fetch('http://127.0.0.1:7248/ingest/eed908bc-e684-48e5-ad88-bbd7eba2f91e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase.ts:78',message:'getAdminClient called',data:{hasInstance:!!adminClientInstance},timestamp:Date.now(),sessionId:'debug-session',runId:'runtime',hypothesisId:'B,D'})}).catch(()=>{});
  // #endregion
  
  if (!adminClientInstance) {
    try {
      adminClientInstance = createAdminClient();
      // #region agent log
      fetch('http://127.0.0.1:7248/ingest/eed908bc-e684-48e5-ad88-bbd7eba2f91e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase.ts:82',message:'Admin client instance created',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'runtime',hypothesisId:'B,D'})}).catch(()=>{});
      // #endregion
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7248/ingest/eed908bc-e684-48e5-ad88-bbd7eba2f91e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase.ts:86',message:'Failed to create admin client instance',data:{error:err instanceof Error?err.message:String(err)},timestamp:Date.now(),sessionId:'debug-session',runId:'runtime',hypothesisId:'B,D,E'})}).catch(()=>{});
      // #endregion
      throw err;
    }
  }
  return adminClientInstance;
}


