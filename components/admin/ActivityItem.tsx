import { LucideIcon } from 'lucide-react'

interface ActivityItemProps {
  icon: LucideIcon
  iconColor: string
  title: string
  description: string
  time: string
}

export default function ActivityItem({ icon: Icon, iconColor, title, description, time }: ActivityItemProps) {
  return (
    <div className="flex gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  )
}
