import Link from 'next/link'
import { ArrowDownRight, ArrowUpRight, LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  trend?: number
  trendLabel?: string
  icon: LucideIcon
  iconColor: string
  href?: string
}

export default function MetricCard({
  title,
  value,
  trend,
  trendLabel,
  icon: Icon,
  iconColor,
  href
}: MetricCardProps) {
  const trendPositive = trend === undefined ? undefined : trend >= 0
  const cardContent = (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend !== undefined && (
            <div className="mt-2 flex items-center text-sm">
              {trendPositive ? (
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={trendPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                {trendPositive ? '+' : ''}{trend}%
              </span>
              {trendLabel && (
                <span className="text-gray-500 dark:text-gray-400 ml-1">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href} className="block">{cardContent}</Link>
  }

  return cardContent
}
