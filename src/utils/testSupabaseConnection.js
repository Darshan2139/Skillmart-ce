// Utility to test Supabase connection and configuration
import { supabase, debugSupabaseConfig } from '../services/supabaseClient'

export const testSupabaseConnection = async () => {
  console.log('🧪 Testing Supabase Connection...')
  
  // Debug configuration
  debugSupabaseConfig()
  
  try {
    // Test basic connection
    const { data, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.error('❌ Supabase connection failed:', error)
      return {
        success: false,
        error: error.message,
        suggestions: [
          'Check your REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in .env file',
          'Verify your Supabase project is active',
          'Check if your API keys are correct'
        ]
      }
    }
    
    console.log('✅ Supabase connection successful')
    console.log('📦 Available buckets:', data.map(b => b.name))
    
    // Check if assignments-bucket exists
    const assignmentsBucket = data.find(b => b.name === 'assignments-bucket')
    if (!assignmentsBucket) {
      console.warn('⚠️ assignments-bucket not found')
      return {
        success: true,
        warning: 'assignments-bucket not found',
        suggestions: [
          'Create a bucket named "assignments-bucket" in your Supabase dashboard',
          'Or update REACT_APP_SUPABASE_BUCKET to use an existing bucket name'
        ]
      }
    }
    
    console.log('✅ assignments-bucket found')
    
    // Test file upload (small test file)
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const testPath = `test/${Date.now()}.txt`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('assignments-bucket')
      .upload(testPath, testFile)
    
    if (uploadError) {
      console.error('❌ File upload test failed:', uploadError)
      return {
        success: false,
        error: uploadError.message,
        suggestions: [
          'Check RLS policies for storage.objects table',
          'Run the SQL commands in SUPABASE_SETUP.md',
          'Verify bucket permissions'
        ]
      }
    }
    
    console.log('✅ File upload test successful')
    
    // Clean up test file
    await supabase.storage.from('assignments-bucket').remove([testPath])
    console.log('🧹 Test file cleaned up')
    
    return {
      success: true,
      message: 'Supabase connection and file upload working correctly'
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return {
      success: false,
      error: error.message,
      suggestions: [
        'Check your internet connection',
        'Verify Supabase service status',
        'Check browser console for more details'
      ]
    }
  }
}

// Helper to run test from browser console
if (typeof window !== 'undefined') {
  window.testSupabaseConnection = testSupabaseConnection
}

