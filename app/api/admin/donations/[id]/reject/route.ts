import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin'
import { createAdminClient } from '@/lib/supabase/admin-client'
import { notifyDonationRejected } from '@/lib/email-service'

// PUT - Reject a donation (admin only)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAdmin()
    const { id } = await params

    const admin = createAdminClient()
    if (!admin) {
      return NextResponse.json({ error: 'Admin client not configured. Add SUPABASE_SERVICE_ROLE_KEY.' }, { status: 503 })
    }

    const body = await req.json()
    const { reason } = body

    // Get donation details
    const { data: donation } = await admin
      .from('donations')
      .select('*')
      .eq('id', id)
      .single()

    if (!donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 })
    }

    if (donation.status === 'verified' || donation.status === 'completed') {
      return NextResponse.json({ error: 'Cannot reject a verified donation' }, { status: 400 })
    }

    // Update donation status
    const { data: updatedDonation, error: updateError } = await admin
      .from('donations')
      .update({
        status: 'rejected',
        admin_notes: reason || 'No reason provided',
        verified_by: user.id,
        verified_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log audit
    await admin.from('payment_audit_log').insert({
      action: 'rejected',
      entity_type: 'donation',
      entity_id: id,
      changes: { old: { status: donation.status }, new: { status: 'rejected', reason } },
      performed_by: user.id,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown'
    })

    // Send rejection email notification
    if (donation.donor_id) {
      try {
        const { data: donor } = await admin
          .from('profiles')
          .select('full_name')
          .eq('id', donation.donor_id)
          .single()

        const { data: donorUser } = await admin.auth.admin.getUserById(donation.donor_id)

        if (donorUser?.user?.email) {
          const { data: project } = await admin
            .from('projects')
            .select('title')
            .eq('id', donation.project_id)
            .single()

          await notifyDonationRejected(
            donorUser.user.email,
            donor?.full_name || 'Valued Donor',
            {
              projectName: project?.title || 'the project',
              amount: donation.amount,
              currency: donation.currency,
              donationReference: donation.transaction_reference || donation.id,
              reason
            }
          )
        }
      } catch (emailError) {
        console.error('Error sending rejection email:', emailError)
      }
    }

    return NextResponse.json({ donation: updatedDonation })
  } catch (error: any) {
    console.error('Error rejecting donation:', error)
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 })
  }
}
