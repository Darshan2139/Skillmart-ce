import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../../../services/supabaseClient'
import { submitAssignment } from '../../../services/operations/assignmentAPI'
import toast from 'react-hot-toast'

// Props: assignmentId (string), courseId (optional), onSuccess (callback)
const AssignmentUpload = ({ assignmentId, onSuccess }) => {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const bucket = process.env.REACT_APP_SUPABASE_BUCKET || 'assignments-bucket'

  const accept = useMemo(() => ({
    'application/pdf': ['.pdf'],
    'text/plain': ['.txt']
  }), [])

  const validateFile = (f) => {
    if (!f) return 'Please select a file.'
    const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    const isTxt = f.type === 'text/plain' || f.name.toLowerCase().endsWith('.txt')
    if (!isPdf && !isTxt) return 'Only PDF or TXT files are allowed.'
    const sizeMB = f.size / (1024 * 1024)
    if (sizeMB > 25) return 'File size must be <= 25 MB.'
    return null
  }

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    const err = validateFile(f)
    if (err) {
      toast.error(err)
      e.target.value = ''
      setFile(null)
      return
    }
    setFile(f)
  }

  const uploadToSupabase = async (f) => {
    const ext = f.name.split('.').pop()
    const studentId = user?._id || user?.id || 'anonymous'
    const timestamp = Date.now()
    const path = `${assignmentId}/${studentId}/${timestamp}.${ext}`

    // Build an upload with progress using the fetch-based upload protocol
    // supabase-js v2 storage.from(bucket).upload() does not expose progress, so we use signed upload via REST.
    // Simpler approach: streamless upload, then simulate progress.
    setProgress(10)
    const { data, error } = await supabase.storage.from(bucket).upload(path, f, {
      cacheControl: '3600',
      upsert: false,
      contentType: f.type || (ext === 'pdf' ? 'application/pdf' : 'text/plain'),
    })
    if (error) throw error
    setProgress(70)

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
    console.log('Supabase public URL (post-upload):', { bucket, path: data.path, publicUrl: publicUrlData?.publicUrl })
    setProgress(90)

    return publicUrlData.publicUrl
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      toast.error('Please select a file to upload')
      return
    }
    const err = validateFile(file)
    if (err) {
      toast.error(err)
      return
    }

    if (!token) {
      toast.error('You must be logged in to submit an assignment')
      return
    }

    setIsUploading(true)
    setProgress(5)
    const toastId = toast.loading('Uploading...')
    try {
      const fileUrl = await uploadToSupabase(file)
      setProgress(95)

      // Send to backend to persist metadata
      const payload = {
        submissionText: '',
        attachments: [
          { fileName: file.name, fileUrl },
        ],
      }

      const res = await submitAssignment(assignmentId, payload, token)
      setProgress(100)
      toast.success('Submitted successfully')
      if (onSuccess) onSuccess(res?.data)
      setFile(null)
    } catch (err2) {
      console.error(err2)
      toast.error(err2?.message || 'Upload failed')
    } finally {
      toast.dismiss(toastId)
      setIsUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="p-4 border rounded-md bg-richblack-800 border-richblack-700">
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm text-richblack-200 mb-1">Select PDF or TXT</label>
          <input
            type="file"
            accept={Object.values(accept).flat().join(',')}
            onChange={handleFileChange}
            disabled={isUploading}
            className="block w-full text-sm text-richblack-5 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-richblack-900 hover:file:bg-yellow-100"
          />
        </div>

        {file && (
          <div className="text-xs text-richblack-200">
            Selected: {file.name} ({(file.size / (1024*1024)).toFixed(2)} MB)
          </div>
        )}

        {isUploading && (
          <div className="w-full bg-richblack-700 rounded h-2 overflow-hidden">
            <div
              className="bg-yellow-200 h-2 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isUploading || !file}
          className="px-4 py-2 rounded bg-yellow-50 text-richblack-900 hover:bg-yellow-100 disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : 'Upload & Submit'}
        </button>
      </form>
    </div>
  )
}

export default AssignmentUpload