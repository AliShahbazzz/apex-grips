import { Marquee } from "@/components"
import { ANNOUNCEMENTS } from "@/data/content"

export function AnnouncementBar() {
  return (
    <div className="border-b-2 border-main bg-inverse px-4 py-2 text-xs font-black uppercase tracking-wider text-inverse-foreground">
      <Marquee
        items={ANNOUNCEMENTS.map(({ icon, text }) => (
          <span key={text} className="flex items-center gap-2">
            <span className="text-main">{icon}</span>
            {text}
          </span>
        ))}
      />
    </div>
  )
}
