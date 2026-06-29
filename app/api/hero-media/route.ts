import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600 // cache for 1 hour

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function isValidUrl(url: unknown): url is string {
  if (typeof url !== 'string' || !url.trim()) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch active/visible projects — only the image fields we need
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, title, main_image_url, gallery_images')
      .eq('status', 'active')
      .eq('is_visible', true)
      .not('main_image_url', 'is', null)
      .limit(60)

    if (error) {
      console.error('hero-media fetch error:', error)
      return NextResponse.json({ slides: [] })
    }

    type Slide = { url: string; alt: string; source: string }
    const pool: Slide[] = []

    for (const project of projects ?? []) {
      if (isValidUrl(project.main_image_url)) {
        pool.push({
          url: project.main_image_url,
          alt: project.title ?? 'Project image',
          source: 'project',
        })
      }
      if (Array.isArray(project.gallery_images)) {
        for (const img of project.gallery_images) {
          if (isValidUrl(img)) {
            pool.push({
              url: img,
              alt: `${project.title ?? 'Project'} – gallery`,
              source: 'project_gallery',
            })
          }
        }
      }
    }

    // Shuffle and cap at 40 for performance
    const slides = shuffle(pool).slice(0, 40)

    return NextResponse.json(
      { slides },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    )
  } catch (err: any) {
    console.error('hero-media error:', err)
    return NextResponse.json({ slides: [] })
  }
}
