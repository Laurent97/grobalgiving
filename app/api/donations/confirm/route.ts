import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notifyDonationConfirmation } from '@/lib/email-service'

// POST - Confirm donation with payment proof
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const body = await req.json()
    const {
      donation_reference,
      receipt_url,
      transaction_hash, // For crypto
      confirmed = false
    } = body

    // Validation
    if (!donation_reference) {
      return NextResponse.json({ error: 'Donation reference required' }, { status: 400 })
    }

    if (!receipt_url && !transaction_hash) {
      return NextResponse.json({ error: 'Payment proof required' }, { status: 400 })
    }

    // Fetch donations by reference
    const { data: donations, error: fetchError } = await supabase
      .from('donations')
      .select('*')
      .eq('transaction_reference', donation_reference)

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!donations || donations.length === 0) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 })
    }

    // Update donations with payment proof
    const updateData: any = {
      receipt_url,
      status: confirmed ? 'verified' : 'pending'
    }

    if (transaction_hash) {
      updateData.admin_notes = `Transaction Hash: ${transaction_hash}`
    }

    const { error: updateError } = await supabase
      .from('donations')
      .update(updateData)
      .eq('transaction_reference', donation_reference)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // If confirmed, update project amounts
    if (confirmed) {
      for (const donation of donations) {
        await supabase.rpc('increment_project_amount', {
          project_id: donation.project_id,
          amount: donation.amount
        })
      }
    }

    // Send confirmation email to donor if user is logged in
    if (user?.email) {
      const { data: donor } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      const paymentMethodLabel = donations[0].payment_method_type === 'bank'
        ? 'Bank Transfer'
        : donations[0].payment_method_type === 'mobile_money'
        ? 'Mobile Money'
        : donations[0].payment_method_type === 'crypto'
        ? 'Cryptocurrency'
        : 'Card'

      await notifyDonationConfirmation(
        user.email,
        donor?.full_name || 'Valued Donor',
        {
          projectName: donations[0].project?.title || 'the project',
          amount: donations.reduce((sum, d) => sum + d.amount, 0),
          currency: donations[0].currency,
          donationReference: donation_reference,
          paymentMethod: paymentMethodLabel,
          status: confirmed ? 'Verified' : 'Pending Verification'
        }
      )
    }

    return NextResponse.json({
      success: true,
      donation_reference: donation_reference,
      donation_count: donations.length,
      status: confirmed ? 'verified' : 'pending'
    })
  } catch (error) {
    console.error('Error confirming donation:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
