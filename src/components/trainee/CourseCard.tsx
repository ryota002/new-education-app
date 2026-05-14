import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function extractVideoId(url: string): string | null {
  const match = url.match(/(?:v=|\/embed\/|youtu\.be\/)([^&\n?#]+)/)
  return match?.[1] ?? null
}

interface CourseCardProps {
  course: {
    id: string
    title: string
    description: string | null
    youtube_url: string
    required_level: number
  }
  userLevel: number
  completed: boolean
}

export function CourseCard({ course, userLevel, completed }: CourseCardProps) {
  const isLocked = userLevel < course.required_level
  const videoId = extractVideoId(course.youtube_url)
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null

  return (
    <Card className={isLocked ? 'opacity-60' : ''}>
      {thumbnailUrl && (
        <div className="relative overflow-hidden rounded-t-xl">
          <Image
            src={thumbnailUrl}
            alt={course.title}
            width={320}
            height={180}
            className="h-40 w-full object-cover"
          />
          {isLocked && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-2xl">🔒</span>
            </div>
          )}
          {completed && !isLocked && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-500 hover:bg-green-500">完了済み</Badge>
            </div>
          )}
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{course.title}</CardTitle>
          <Badge variant="outline" className="shrink-0 text-xs">
            Lv.{course.required_level}〜
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {course.description && (
          <p className="text-sm text-slate-500 line-clamp-2">{course.description}</p>
        )}
        {isLocked ? (
          <p className="text-xs text-slate-400">Lv.{course.required_level} でアンロック</p>
        ) : (
          <Link href={`/courses/${course.id}`}>
            <Button size="sm" variant={completed ? 'outline' : 'default'} className="w-full">
              {completed ? 'もう一度見る' : '学習を始める'}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
