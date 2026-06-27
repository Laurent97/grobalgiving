'use client'

import { useState, useCallback } from 'react'
import { Upload, File, X, Loader2 } from 'lucide-react'
import { useToast } from './Toast'

interface FileUploaderProps {
  onUpload: (url: string) => void
  accept?: string
  maxSize?: number // in MB
  label?: string
  description?: string
  value?: string
}

export default function FileUploader({
  onUpload,
  accept = "image/*,.pdf",
  maxSize = 5,
  label = "Upload Payment Proof",
  description = "Drag & drop or click to upload. JPG, PNG, PDF (Max 5MB)",
  value
}: FileUploaderProps) {
  const { showToast } = useToast()
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null)

  const handleUpload = async (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      showToast('error', 'Only JPG, PNG, and PDF files are allowed')
      return
    }

    // Validate file size
    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      showToast('error', `File size must be less than ${maxSize}MB`)
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'payment-receipts')
      formData.append('path', 'receipts')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setPreviewUrl(data.url)
        onUpload(data.url)
        showToast('success', 'File uploaded successfully')
      } else {
        showToast('error', data.error || 'Failed to upload file')
      }
    } catch (err) {
      console.error('Error uploading file:', err)
      showToast('error', 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleUpload(files[0])
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleUpload(files[0])
    }
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    onUpload('')
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      {!previewUrl ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-gg-primary bg-orange-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            {uploading ? (
              <Loader2 className="w-10 h-10 text-gg-primary animate-spin mb-3" />
            ) : (
              <Upload className="w-10 h-10 text-gray-400 mb-3" />
            )}
            <span className="text-sm font-medium text-gray-900">
              {uploading ? 'Uploading...' : 'Drag & drop or click to upload'}
            </span>
            <span className="text-xs text-gray-500 mt-1">{description}</span>
          </label>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <File className="w-8 h-8 text-gg-primary" />
              <div className="text-sm">
                <p className="font-medium text-gray-900">Payment proof uploaded</p>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gg-primary hover:underline text-xs"
                >
                  View file
                </a>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {previewUrl.match(/\.(jpg|jpeg|png)$/i) && (
            <img
              src={previewUrl}
              alt="Payment proof preview"
              className="mt-3 max-w-full h-32 object-cover rounded-lg"
            />
          )}
        </div>
      )}
    </div>
  )
}
