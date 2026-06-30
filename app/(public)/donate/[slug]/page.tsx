import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DonateSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  redirect(`/projects/${slug}`)
}
