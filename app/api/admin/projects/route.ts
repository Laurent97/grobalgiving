import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/permissions'

async function getAdminUser(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', status: 401 }

  const { data: profile } = await supabase.from('profiles').select('role, nonprofit_id').eq('id', user.id).single()
  if (!profile || (profile.role !== 'admin' && profile.role !== 'nonprofit_admin')) {
    return { error: 'Forbidden', status: 403 }
  }

  return { user, profile: profile as { role: UserRole; nonprofit_id?: string | null } }
}

// GET - List all projects with filters
export async function GET(req: Request) {
  try {
    const auth = await getAdminUser(req)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { profile } = auth

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const nonprofitId = searchParams.get('nonprofit_id')
    const page = Number(searchParams.get('page')) || 1
    const pageSize = Number(searchParams.get('pageSize')) || 20

    const supabase = await createClient()

    let query = supabase
      .from('projects')
      .select('*, nonprofits(name)', { count: 'exact' })
      .range((page - 1) * pageSize, page * pageSize - 1)
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (featured === 'true') query = query.eq('featured', true)
    if (search) query = query.ilike('title', `%${search}%`)
    if (profile.role === 'nonprofit_admin' && profile.nonprofit_id) {
      query = query.eq('nonprofit_id', profile.nonprofit_id)
    } else if (nonprofitId) {
      query = query.eq('nonprofit_id', nonprofitId)
    }

    const { data: projects, count, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ 
      projects, 
      pagination: { 
        page, 
        pageSize, 
        total: count || 0, 
        totalPages: Math.ceil((count || 0) / pageSize) 
      } 
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

// POST - Create new project
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      title, 
      slug, 
      description, 
      subtitle,
      project_summary,
      challenge,
      solution,
      activities,
      donation_usage,
      goal_amount, 
      minimum_donation,
      currency,
      language,
      location,
      location_country,
      location_city,
      location_region,
      nonprofit_id,
      new_nonprofit_name,
      main_image_url,
      gallery_images,
      video_url,
      start_date,
      end_date,
      category,
      sub_category,
      tags,
      featured,
      is_urgent,
      is_visible,
      is_ongoing,
      terms_accepted,
      visibility,
      project_leader,
      team_members,
      budget,
      timeline,
      impact_metrics,
      documents,
      seo,
      notifications,
      organization,
      project_details
    } = body

    const effectiveDescription = description || project_summary || ''

    if (!title || !slug || !effectiveDescription || !goal_amount || !nonprofit_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!main_image_url) {
      return NextResponse.json({ error: 'At least one project image is required' }, { status: 400 })
    }

    if (visibility === 'published' && !terms_accepted) {
      return NextResponse.json({ error: 'You must accept the terms and conditions to publish' }, { status: 400 })
    }

    const auth = await getAdminUser(req)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { user, profile } = auth

    if (profile.role === 'nonprofit_admin' && nonprofit_id !== profile.nonprofit_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = await createClient()

    let effectiveNonprofitId = nonprofit_id
    if (nonprofit_id === 'other') {
      if (profile.role !== 'admin') {
        return NextResponse.json({ error: 'Only admins can create new nonprofits' }, { status: 403 })
      }
      if (!new_nonprofit_name || typeof new_nonprofit_name !== 'string') {
        return NextResponse.json({ error: 'New nonprofit name is required' }, { status: 400 })
      }
      const generatedSlug = new_nonprofit_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now()
      const { data: newNonprofit, error: createNpError } = await supabase.from('nonprofits').insert({
        name: new_nonprofit_name.trim(),
        slug: generatedSlug,
        description: '',
        verified: true
      }).select().single()
      if (createNpError) {
        console.error('Error creating nonprofit:', createNpError)
        return NextResponse.json({ error: createNpError.message }, { status: 500 })
      }
      effectiveNonprofitId = newNonprofit.id
    } else if (profile.role === 'nonprofit_admin' && profile.nonprofit_id) {
      effectiveNonprofitId = profile.nonprofit_id
    }

    // Validate goal amount (max 10,000,000)
    if (Number(goal_amount) > 10_000_000) {
      return NextResponse.json({ error: 'Goal amount exceeds maximum limit of $10,000,000' }, { status: 400 })
    }

    const isNonprofitAdmin = profile.role === 'nonprofit_admin'
    let status = 'draft'
    if (visibility === 'published') {
      status = isNonprofitAdmin ? 'pending' : 'active'
    } else if (visibility === 'pending') {
      status = 'pending'
    } else if (visibility === 'archived') {
      status = 'archived'
    }
    const publishedAt = visibility === 'published' && !isNonprofitAdmin ? new Date().toISOString() : null

    const details = {
      ...(project_details || {}),
      ...(organization ? { organization } : {}),
      ...(sub_category ? { sub_category } : {}),
      ...(project_leader ? { project_leader } : {}),
      ...(team_members ? { team_members } : {}),
      ...(budget ? { budget } : {}),
      ...(timeline ? { timeline } : {}),
      ...(impact_metrics ? { impact_metrics } : {}),
      ...(documents ? { documents } : {}),
      ...(seo ? { seo } : {}),
      ...(notifications ? { notifications } : {})
    }

    const insert = {
      nonprofit_id: effectiveNonprofitId,
      title,
      slug,
      description: effectiveDescription,
      subtitle: subtitle || null,
      project_summary: project_summary || null,
      challenge: challenge || null,
      solution: solution || null,
      activities: activities || null,
      donation_usage: donation_usage || null,
      goal_amount: Number(goal_amount),
      minimum_donation: Number(minimum_donation) || 1,
      currency: currency || 'USD',
      language: language || 'en',
      location: location || null,
      location_country: location_country || null,
      location_city: location_city || null,
      location_region: location_region || null,
      main_image_url: main_image_url || null,
      gallery_images: gallery_images || [],
      video_url: video_url || null,
      start_date: start_date || null,
      end_date: is_ongoing ? null : (end_date || null),
      category: category || null,
      tags: tags || [],
      featured: isNonprofitAdmin ? false : (featured || false),
      is_visible: is_visible !== false,
      amount_received: 0,
      status,
      published_at: publishedAt,
      terms_accepted: terms_accepted || false,
      project_details: details
    }

    const { data: project, error } = await supabase.from('projects').insert(insert).select().single()

    if (error) {
      console.error('Project create error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log admin action
    try {
      await supabase.from('admin_audit_log').insert({
        admin_id: user.id,
        action: 'create_project',
        target_id: project.id,
        new_value: project
      })
    } catch (logError) {
      console.error('Audit log error:', logError)
    }

    return NextResponse.json({ project })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

// PUT - Update project
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing project id' }, { status: 400 })
    }

    const auth = await getAdminUser(req)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { user, profile } = auth
    const isNonprofitAdmin = profile.role === 'nonprofit_admin'

    const supabase = await createClient()

    // Get current project for audit log
    const { data: currentProject } = await supabase.from('projects').select('*').eq('id', id).single()
    if (!currentProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (isNonprofitAdmin && currentProject.nonprofit_id !== profile.nonprofit_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Validate goal amount if being updated (max 10,000,000)
    if (updateData.goal_amount && Number(updateData.goal_amount) > 10_000_000) {
      return NextResponse.json({ error: 'Goal amount exceeds maximum limit of $10,000,000' }, { status: 400 })
    }

    // Prepare update data
    const update: any = {}
    if (updateData.title !== undefined) update.title = updateData.title
    if (updateData.slug !== undefined) update.slug = updateData.slug
    if (updateData.description !== undefined) update.description = updateData.description
    if (updateData.subtitle !== undefined) update.subtitle = updateData.subtitle
    if (updateData.project_summary !== undefined) update.project_summary = updateData.project_summary
    if (updateData.challenge !== undefined) update.challenge = updateData.challenge
    if (updateData.solution !== undefined) update.solution = updateData.solution
    if (updateData.activities !== undefined) update.activities = updateData.activities
    if (updateData.donation_usage !== undefined) update.donation_usage = updateData.donation_usage
    if (updateData.goal_amount !== undefined) update.goal_amount = Number(updateData.goal_amount)
    if (updateData.minimum_donation !== undefined) update.minimum_donation = Number(updateData.minimum_donation)
    if (updateData.currency !== undefined) update.currency = updateData.currency
    if (updateData.language !== undefined) update.language = updateData.language
    if (updateData.location !== undefined) update.location = updateData.location
    if (updateData.location_country !== undefined) update.location_country = updateData.location_country
    if (updateData.location_city !== undefined) update.location_city = updateData.location_city
    if (updateData.location_region !== undefined) update.location_region = updateData.location_region
    if (updateData.main_image_url !== undefined) update.main_image_url = updateData.main_image_url
    if (updateData.gallery_images !== undefined) update.gallery_images = updateData.gallery_images
    if (updateData.video_url !== undefined) update.video_url = updateData.video_url
    if (updateData.start_date !== undefined) update.start_date = updateData.start_date
    if (updateData.end_date !== undefined) update.end_date = updateData.end_date
    if (updateData.category !== undefined) update.category = updateData.category
    if (updateData.tags !== undefined) update.tags = updateData.tags
    if (updateData.terms_accepted !== undefined) update.terms_accepted = updateData.terms_accepted
    if (updateData.is_ongoing !== undefined) update.end_date = updateData.is_ongoing ? null : updateData.end_date

    if (updateData.project_details || updateData.organization || updateData.sub_category || updateData.project_leader || updateData.team_members || updateData.budget || updateData.timeline || updateData.impact_metrics || updateData.documents || updateData.seo || updateData.notifications) {
      update.project_details = {
        ...(currentProject.project_details || {}),
        ...(updateData.project_details || {}),
        ...(updateData.organization ? { organization: updateData.organization } : {}),
        ...(updateData.sub_category ? { sub_category: updateData.sub_category } : {}),
        ...(updateData.project_leader ? { project_leader: updateData.project_leader } : {}),
        ...(updateData.team_members ? { team_members: updateData.team_members } : {}),
        ...(updateData.budget ? { budget: updateData.budget } : {}),
        ...(updateData.timeline ? { timeline: updateData.timeline } : {}),
        ...(updateData.impact_metrics ? { impact_metrics: updateData.impact_metrics } : {}),
        ...(updateData.documents ? { documents: updateData.documents } : {}),
        ...(updateData.seo ? { seo: updateData.seo } : {}),
        ...(updateData.notifications ? { notifications: updateData.notifications } : {})
      }
    }

    if (updateData.visibility !== undefined) {
      if (updateData.visibility === 'published') {
        update.status = isNonprofitAdmin ? 'pending' : 'active'
        if (!isNonprofitAdmin) update.published_at = new Date().toISOString()
      } else if (updateData.visibility === 'draft') {
        update.status = 'draft'
      } else if (updateData.visibility === 'pending') {
        update.status = 'pending'
      } else if (updateData.visibility === 'archived') {
        update.status = 'archived'
      }
    }

    if (!isNonprofitAdmin) {
      if (updateData.featured !== undefined) update.featured = updateData.featured
      if (updateData.is_visible !== undefined) update.is_visible = updateData.is_visible
      if (updateData.status !== undefined) update.status = updateData.status
      if (updateData.amount_received !== undefined) update.amount_received = Number(updateData.amount_received)
      if (updateData.nonprofit_id) update.nonprofit_id = updateData.nonprofit_id
    }

    const { data: project, error } = await supabase
      .from('projects')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Project update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log admin action
    try {
      await supabase.from('admin_audit_log').insert({
        admin_id: user.id,
        action: 'update_project',
        target_id: id,
        old_value: currentProject,
        new_value: project
      })
    } catch (logError) {
      console.error('Audit log error:', logError)
    }

    return NextResponse.json({ project })
  } catch (err: any) {
    console.error('Project PUT error:', err)
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

// DELETE - Delete project
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing project id' }, { status: 400 })
    }

    const auth = await getAdminUser(req)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { user, profile } = auth
    const isNonprofitAdmin = profile.role === 'nonprofit_admin'

    const supabase = await createClient()

    // Get project for audit log before deletion
    const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (isNonprofitAdmin && project.nonprofit_id !== profile.nonprofit_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase.from('projects').delete().eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Log admin action
    await supabase.from('admin_audit_log').insert({
      admin_id: user.id,
      action: 'delete_project',
      target_id: id,
      old_value: project
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
