'use client'

interface YouTubeEmbedProps {
  url: string
  title: string
}

function extractVideoId(url: string): string | null {
  const match = url.match(/(?:v=|\/embed\/|youtu\.be\/)([^&\n?#]+)/)
  return match?.[1] ?? null
}

export function YouTubeEmbed({ url, title }: YouTubeEmbedProps) {
  const videoId = extractVideoId(url)

  if (!videoId) {
    return (
      <div className="aspect-video bg-slate-200 flex items-center justify-center rounded-xl">
        <p className="text-slate-400">動画URLが無効です</p>
      </div>
    )
  }

  return (
    <div className="aspect-video rounded-xl overflow-hidden">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  )
}
