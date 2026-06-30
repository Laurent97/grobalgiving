import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function DonateRedirect() {
  // Redirect /donate to the shopping cart where users can complete donation
  redirect('/cart')
}
