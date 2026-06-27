import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST - Upload a file to Supabase Storage
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse multipart form data
    const formData = await req.formData()
    const file = formData.get('file') as File
    const bucket = formData.get('bucket') as string || 'payment-receipts'
    const path = formData.get('path') as string || ''

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, WebP, and PDF files are allowed' }, { status: 400 })
    }

    // Validate file size — 10MB for project buckets, 5MB for receipts
    const maxSize = (bucket === 'project-images' || bucket === 'project-documents')
      ? 10 * 1024 * 1024
      : 5 * 1024 * 1024
    const maxSizeLabel = maxSize === 10 * 1024 * 1024 ? '10MB' : '5MB'
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File size must be less than ${maxSizeLabel}` }, { status: 400 })
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop()
    const prefix = path ? `${path}/` : ''
    const fileName = `${prefix}${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: publicUrl } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return NextResponse.json({
      url: publicUrl.publicUrl,
      path: fileName
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
