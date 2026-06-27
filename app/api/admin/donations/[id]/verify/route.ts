import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notifyDonationVerified } from '@/lib/email-service'

// PUT - Verify a donation (admin only)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get donation details
    const { data: donation } = await supabase
      .from('donations')
      .select('*')
      .eq('id', id)
      .single()

    if (!donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 })
    }

    if (donation.status === 'verified' || donation.status === 'completed') {
      return NextResponse.json({ error: 'Donation is already verified' }, { status: 400 })
    }

    // Update donation status
    const { data: updatedDonation, error: updateError } = await supabase
      .from('donations')
      .update({
        status: 'verified',
        verified_by: user.id,
        verified_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Update project raised amount
    await supabase.rpc('increment_project_amount', {
      project_id: donation.project_id,
      amount: donation.amount
    })

    // Log audit
    await supabase.from('payment_audit_log').insert({
      action: 'verified',
      entity_type: 'donation',
      entity_id: id,
      changes: { old: { status: donation.status }, new: { status: 'verified' } },
      performed_by: user.id,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown'
    })

    // Send verified email notification
    if (donation.donor_id) {
      try {
        const { data: donor } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', donation.donor_id)
          .single()

        const { data: donorUser } = await supabase.auth.admin.getUserById(donation.donor_id)

        if (donorUser?.user?.email) {
          const { data: project } = await supabase
            .from('projects')
            .select('title, slug')
            .eq('id', donation.project_id)
            .single()

          await notifyDonationVerified(
            donorUser.user.email,
            donor?.full_name || 'Valued Donor',
            {
              projectName: project?.title || 'the project',
              amount: donation.amount,
              currency: donation.currency,
              donationReference: donation.transaction_reference || donation.id,
              projectUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/projects/${project?.slug}`
            }
          )
        }
      } catch (emailError) {
        console.error('Error sending verification email:', emailError)
      }
    }

    return NextResponse.json({ donation: updatedDonation })
  } catch (error) {
    console.error('Error verifying donation:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
