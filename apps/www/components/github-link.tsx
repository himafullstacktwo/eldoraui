import * as React from "react"
import Link from "next/link"

import { siteConfig } from "@/config/site"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Icons } from "@/components/icons"

export function GitHubLink({ className }: { className?: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button asChild size="lg" variant="ghost" className="h-8 shadow-none">
            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className={className}
            >
              <Icons.gitHub />
              <React.Suspense fallback={<Skeleton className="h-4 w-8" />}>
                <StarsCount />
              </React.Suspense>
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>View on GitHub</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export async function StarsCount() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    const data = await fetch(
      "https://api.github.com/repos/karthikmudunuri/eldoraui",
      {
        next: { revalidate: 86400 }, // Cache for 1 day (86400 seconds)
        signal: controller.signal,
      }
    )

    clearTimeout(timeoutId)

    if (!data.ok) {
      return null
    }

    const json = await data.json()

    if (!json || typeof json.stargazers_count !== "number" || json.stargazers_count < 0) {
      return null
    }

    const count = Number(json.stargazers_count)

    if (!Number.isFinite(count)) {
      return null
    }

    // Safe formatting - use Intl instead of toLocaleString to be more explicit
    const formatter = new Intl.NumberFormat("en-US", {
      useGrouping: true,
      maximumFractionDigits: 0,
    })
    
    const formattedCount = formatter.format(count)

    return (
      <span className="text-muted-foreground w-8 text-xs tabular-nums">
        <span className="hidden sm:inline">
          {formattedCount}
        </span>
        <span className="sm:hidden">
          {count >= 1000
            ? `${(count / 1000).toFixed(1)}k`
            : formattedCount}
        </span>
      </span>
    )
  } catch (error) {
    console.error("[v0] StarsCount fetch failed:", error)
    return null
  }
}
