'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: '管理ダッシュボード', icon: '📊', exact: true },
  { href: '/admin/courses', label: 'コース管理', icon: '📚' },
]

export function ManagerSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-lg font-bold leading-tight">新人教育<br />管理システム</h1>
        <span className="text-xs text-slate-400 mt-1 block">管理者</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <form action={logout}>
          <Button variant="ghost" type="submit" className="w-full text-slate-400 hover:text-white justify-start">
            ログアウト
          </Button>
        </form>
      </div>
    </aside>
  )
}
