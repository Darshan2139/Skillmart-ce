// Jest test to validate that we generate a public URL path for a public bucket
import { createClient } from '@supabase/supabase-js'

// Use env from CRA. For tests, ensure these are defined via cross-env or a .env.test
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY
const bucket = process.env.REACT_APP_SUPABASE_BUCKET || 'assignments-bucket'

describe('Supabase public URL generation', () => {
  test('getPublicUrl should contain "/public/" segment for public buckets', () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Missing Supabase env vars; skipping test')
      return
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const path = 'test-bucket-verification/sample.txt'
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    expect(data.publicUrl).toContain('/storage/v1/object/public/')
    expect(data.publicUrl).toContain(bucket)
    expect(data.publicUrl).toContain(path)
  })
})