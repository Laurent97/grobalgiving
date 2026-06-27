import { ThemeProvider } from '@/components/admin/ThemeProvider'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {children}
      </div>
    </ThemeProvider>
  )
}
