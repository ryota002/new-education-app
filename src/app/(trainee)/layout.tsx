import { TraineeSidebar } from '@/components/layout/TraineeSidebar'

export default function TraineeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <TraineeSidebar />
      <main className="flex-1 bg-slate-50 p-8 overflow-auto">{children}</main>
    </div>
  )
}
