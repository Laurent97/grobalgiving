import { createClient } from './supabase/server'

interface EmailData {
  to: string
  subject: string
  html: string
}

// This is a placeholder email service that can be connected to:
// - SendGrid
// - Resend
// - AWS SES
// - SMTP
// - Supabase Edge Functions
// 
// For production, replace this with your actual email provider.

export async function sendEmail(data: EmailData): Promise<{ success: boolean; error?: string }> {
  try {
    // Try to use Supabase Edge Function if available
    const supabase = await createClient()
    
    // For now, log the email and return success
    // In production, integrate with your email provider here
    console.log('Email would be sent:', {
      to: data.to,
      subject: data.subject,
      htmlLength: data.html.length
    })

    // Example: Call a Supabase Edge Function
    // const { data: result, error } = await supabase.functions.invoke('send-email', {
    //   body: data
    // })
    // if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

export function generateDonationConfirmationEmail({
  donorName,
  projectName,
  amount,
  currency,
  donationReference,
  paymentMethod,
  status
}: {
  donorName: string
  projectName: string
  amount: number
  currency: string
  donationReference: string
  paymentMethod: string
  status: string
}) {
  return {
    subject: `❤️ Thank You for Your Donation to ${projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #F08B1D 0%, #D97A16 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Thank You for Your Donation!</h1>
        </div>
        <div style="padding: 30px; background: #ffffff;">
          <p style="font-size: 16px; color: #333;">Dear ${donorName},</p>
          <p style="font-size: 16px; color: #333;">
            Your generosity is truly inspiring! Thank you for donating <strong>${amount} ${currency}</strong> to support <strong>${projectName}</strong>.
          </p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Donation Details</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Donation ID:</strong> ${donationReference}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Amount:</strong> ${amount} ${currency}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Status:</strong> ${status}</p>
          </div>
          <p style="font-size: 16px; color: #333;">
            Your donation is currently being verified. We'll notify you once it's confirmed.
          </p>
          <p style="font-size: 16px; color: #333;">
            Stay tuned for project updates and the impact you're making!
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 14px;">
            <p>With gratitude,<br/>The AcaciaGiving Team</p>
          </div>
        </div>
      </div>
    `
  }
}

export function generateDonationVerifiedEmail({
  donorName,
  projectName,
  amount,
  currency,
  donationReference,
  projectUrl
}: {
  donorName: string
  projectName: string
  amount: number
  currency: string
  donationReference: string
  projectUrl: string
}) {
  return {
    subject: `✅ Your Donation to ${projectName} is Confirmed!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Your Donation is Confirmed!</h1>
        </div>
        <div style="padding: 30px; background: #ffffff;">
          <p style="font-size: 16px; color: #333;">Dear ${donorName},</p>
          <p style="font-size: 16px; color: #333;">
            Great news! Your donation of <strong>${amount} ${currency}</strong> to <strong>${projectName}</strong> has been verified and confirmed.
          </p>
          <p style="font-size: 16px; color: #333;">
            You're now a part of this incredible journey. Your contribution is already making a difference.
          </p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #666;"><strong>Donation ID:</strong> ${donationReference}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Verified Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <p style="font-size: 16px; color: #333;">
            <a href="${projectUrl}" style="color: #F08B1D; text-decoration: none; font-weight: bold;">Track the project's progress →</a>
          </p>
          <p style="font-size: 16px; color: #333;">
            Thank you for being a changemaker!
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 14px;">
            <p>With gratitude,<br/>The AcaciaGiving Team</p>
          </div>
        </div>
      </div>
    `
  }
}

export function generateDonationRejectedEmail({
  donorName,
  projectName,
  amount,
  currency,
  donationReference,
  reason
}: {
  donorName: string
  projectName: string
  amount: number
  currency: string
  donationReference: string
  reason?: string
}) {
  return {
    subject: `Donation Update: ${projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #fee2e2; padding: 30px; text-align: center; color: #991b1b;">
          <h1 style="margin: 0; font-size: 24px;">Donation Could Not Be Verified</h1>
        </div>
        <div style="padding: 30px; background: #ffffff;">
          <p style="font-size: 16px; color: #333;">Dear ${donorName},</p>
          <p style="font-size: 16px; color: #333;">
            We were unable to verify your donation of <strong>${amount} ${currency}</strong> to <strong>${projectName}</strong>.
          </p>
          ${reason ? `<p style="font-size: 16px; color: #333;"><strong>Reason:</strong> ${reason}</p>` : ''}
          <p style="font-size: 16px; color: #333;">
            Donation ID: ${donationReference}
          </p>
          <p style="font-size: 16px; color: #333;">
            If you believe this is an error, please contact our support team with your donation reference.
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 14px;">
            <p>With gratitude,<br/>The AcaciaGiving Team</p>
          </div>
        </div>
      </div>
    `
  }
}

export async function notifyDonationConfirmation(
  donorEmail: string,
  donorName: string,
  donationDetails: {
    projectName: string
    amount: number
    currency: string
    donationReference: string
    paymentMethod: string
    status: string
  }
) {
  const { subject, html } = generateDonationConfirmationEmail({
    donorName,
    ...donationDetails
  })

  return await sendEmail({
    to: donorEmail,
    subject,
    html
  })
}

export async function notifyDonationVerified(
  donorEmail: string,
  donorName: string,
  donationDetails: {
    projectName: string
    amount: number
    currency: string
    donationReference: string
    projectUrl: string
  }
) {
  const { subject, html } = generateDonationVerifiedEmail({
    donorName,
    ...donationDetails
  })

  return await sendEmail({
    to: donorEmail,
    subject,
    html
  })
}

export async function notifyDonationRejected(
  donorEmail: string,
  donorName: string,
  donationDetails: {
    projectName: string
    amount: number
    currency: string
    donationReference: string
    reason?: string
  }
) {
  const { subject, html } = generateDonationRejectedEmail({
    donorName,
    ...donationDetails
  })

  return await sendEmail({
    to: donorEmail,
    subject,
    html
  })
}
