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
  // Skip rendering during build/prerendering to avoid any potential issues
  // The Suspense fallback will show instead
  if (!process.env.NEXT_PUBLIC_GITHUB_STARS_ENABLED) {
    return null
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(
      "https://api.github.com/repos/karthikmudunuri/eldoraui",
      {
        next: { revalidate: 86400 },
        signal: controller.signal,
      }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    const count = data?.stargazers_count

    if (typeof count !== "number" || count < 0 || !Number.isFinite(count)) {
      return null
    }

    // Format with manual string formatting to avoid any locale issues
    const formatted = count >= 1000 
      ? `${(count / 1000).toFixed(1)}k`
      : count.toString()

    return (
      <span className="text-muted-foreground w-8 text-xs tabular-nums">
        {formatted}
      </span>
    )
  } catch (error) {
    return null
  }
}
