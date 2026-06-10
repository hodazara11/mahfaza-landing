// ============================================================================
// Mahfaza — Supabase Client Initialization
// Shared across all auth pages
// ============================================================================

const SUPABASE_URL = 'https://thmlnvzygfgcmcjrrihc.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_FrBjzzdxuvfNQzEYGeHJkA_NIZbeT2O';

// Wait for supabase-js to load, then initialize
window.supabaseClient = null;

function initSupabase() {
  if (typeof window.supabase === 'undefined') {
    console.error('Supabase JS not loaded. Make sure to include the CDN script.');
    return null;
  }
  if (!window.supabaseClient) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
  }
  return window.supabaseClient;
}

// Auto-initialize on script load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSupabase);
} else {
  initSupabase();
}
