// Minimal Supabase client for browser uploads
import { createClient } from '@supabase/supabase-js'

// Trim env values to avoid hidden whitespace issues causing DNS errors
const supabaseUrl = (process.env.REACT_APP_SUPABASE_URL || '').trim()
const supabaseAnonKey = (process.env.REACT_APP_SUPABASE_ANON_KEY || '').trim()

if (!supabaseUrl || !supabaseAnonKey) {
  // Non-fatal in build, but useful during dev
  // eslint-disable-next-line no-console
  console.error('❌ Supabase env vars missing. Check REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY')
  console.error('Create a .env file with your Supabase credentials. See SUPABASE_SETUP.md for details.')
}

// Sanity check: URL should look like https://<project-ref>.supabase.co
if (supabaseUrl && !/^https:\/\/[a-z0-9-]+\.supabase\.co/.test(supabaseUrl)) {
  // eslint-disable-next-line no-console
  console.warn(`⚠️ Suspicious REACT_APP_SUPABASE_URL: ${supabaseUrl}. Expected https://<project-ref>.supabase.co`)
}

// Create client with better error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Don't persist session for file uploads
  },
  storage: {
    // Add retry logic for uploads
    retryAttempts: 3,
  }
})

// Add debugging helper
export const debugSupabaseConfig = () => {
  console.log('🔧 Supabase Configuration:')
  console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.log('Anon Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
  console.log('Bucket:', process.env.REACT_APP_SUPABASE_BUCKET || 'assignments-bucket (default)')
}