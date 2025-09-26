# Supabase Setup Guide for Assignment Submissions

## Issue
You're getting a 400 Bad Request error and "new row violates row-level security policy" when trying to upload assignment submissions to Supabase storage.

## Root Cause
1. Missing environment variables for Supabase configuration
2. Inconsistent bucket names in the codebase
3. Missing RLS (Row Level Security) policies for the storage bucket

## Solution Steps

### 1. Create Environment Variables
Create a `.env` file in your project root with the following variables:

```env
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
REACT_APP_SUPABASE_BUCKET=assignments-bucket
```

Replace `your-project-ref` and `your-anon-key-here` with your actual Supabase project values.

### 2. Create Storage Bucket
In your Supabase dashboard:
1. Go to Storage section
2. Create a new bucket named `assignments-bucket`
3. Make it public if you want public access to uploaded files

### 3. Set Up RLS Policies
Run the following SQL in your Supabase SQL Editor:

```sql
-- Enable RLS on storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'assignments-bucket');

-- Create policy to allow authenticated users to view files
CREATE POLICY "Allow authenticated users to view files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'assignments-bucket');

-- Create policy to allow users to update their own files
CREATE POLICY "Allow users to update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'assignments-bucket')
WITH CHECK (bucket_id = 'assignments-bucket');
```

### 4. Alternative: Disable RLS (Not Recommended for Production)
If you want to disable RLS temporarily for testing:

```sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

**Warning**: This is not recommended for production as it allows anyone to access your storage.

### 5. Test the Configuration
After setting up the environment variables and RLS policies:
1. Restart your development server
2. Try uploading an assignment submission
3. Check the browser console for any remaining errors

## Files Modified
- Fixed bucket name consistency in:
  - `src/components/core/Dashboard/StudentDashboard/AssignmentSubmissionModal.jsx`
  - `src/components/core/Assignments/AssignmentUpload.jsx`

## Additional Notes
- The error occurs because Supabase requires proper authentication and RLS policies
- Make sure your Supabase project is properly configured
- Test with a simple file upload first before implementing the full assignment submission flow

