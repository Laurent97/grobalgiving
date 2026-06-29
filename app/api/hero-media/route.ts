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

/**
 * For YouTube/Vimeo URLs: return the maxres thumbnail URL so we can show
 * the video as an image slide (browsers can't embed YT via <video src>).
 * For direct MP4 URLs: return null (handled as a native video slide).
 */
function getVideoThumbnail(url: string): string | null {
  try {
    const u = new URL(url)
    // youtube.com/watch?v=ID or youtu.be/ID
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      const id = u.searchParams.get('v') || u.pathname.replace(/^\/?/, '')
      if (id) return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
    }
    // vimeo.com/ID
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.replace(/^\/?/, '')
      if (id) return `https://vumbnail.com/${id}.jpg`
    }
  } catch {
    // ignore
  }
  return null
}

export async function GET() {
  try {
    const supabase = await createClient()

    type Slide = { url: string; alt: string; source: string; type: 'image' | 'video' }
    const pool: Slide[] = []

    // 1. Active custom slides from slideshow_slides table
    const { data: customSlides } = await supabase
      .from('slideshow_slides')
      .select('title, media_url, media_type, alt_text, source')
      .eq('status', 'active')
      .order('display_order', { ascending: true })

    for (const s of customSlides ?? []) {
      if (!isValidUrl(s.media_url)) continue
      if (s.media_type === 'video') {
        const thumb = getVideoThumbnail(s.media_url)
        if (thumb) {
          // YouTube/Vimeo: use thumbnail as an image slide
          pool.push({ url: thumb, alt: s.alt_text || s.title, source: s.source || 'custom', type: 'image' })
        } else {
          // Direct MP4: serve as native video slide
          pool.push({ url: s.media_url, alt: s.alt_text || s.title, source: s.source || 'custom', type: 'video' })
        }
      } else {
        pool.push({ url: s.media_url, alt: s.alt_text || s.title, source: s.source || 'custom', type: 'image' })
      }
    }

    // 2. Active/visible project images
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, title, main_image_url, gallery_images')
      .eq('status', 'active')
      .eq('is_visible', true)
      .not('main_image_url', 'is', null)
      .limit(60)

    if (error) console.error('hero-media project fetch error:', error)

    for (const project of projects ?? []) {
      if (isValidUrl(project.main_image_url)) {
        pool.push({ url: project.main_image_url, alt: project.title ?? 'Project image', source: 'project', type: 'image' })
      }
      if (Array.isArray(project.gallery_images)) {
        for (const img of project.gallery_images) {
          if (isValidUrl(img)) {
            pool.push({ url: img, alt: `${project.title ?? 'Project'} – gallery`, source: 'project_gallery', type: 'image' })
          }
        }
      }
    }

    // Shuffle and cap at 50 for performance
    const slides = shuffle(pool).slice(0, 50)

    return NextResponse.json(
      { slides },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
    )
  } catch (err: any) {
    console.error('hero-media error:', err)
    return NextResponse.json({ slides: [] })
  }
}
