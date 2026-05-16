import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { Analytics } from '@vercel/analytics/react'
import * as React from 'react'
import { motion } from 'framer-motion'
import { useQuery } from 'convex/react'
import { useShooIdentityName } from '../shoo'
import { api } from '../../convex/_generated/api'
import type { QueryClient } from '@tanstack/react-query'
import appCss from '~/styles/app.css?url'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon.svg',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  notFoundComponent: () => <div>Route not found</div>,
  component: RootComponent,
})

function RootComponent() {
  const viewerName = useShooIdentityName()
  const hasAiAccess = useQuery(api.billing.hasAiAccess)

  return (
    <RootDocument>
      <Link
        to="/login"
        className="fixed top-4 right-4 z-50 flex max-w-52 items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs font-semibold text-card-foreground shadow-lg transition-colors hover:bg-muted/80"
      >
        <span className="truncate">{viewerName ?? 'Log in'}</span>
        {hasAiAccess === true && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: [0.55, 1, 0.55], scale: 1 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-md bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary"
          >
            PRO
          </motion.span>
        )}
      </Link>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html className="bg-background">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Analytics />
        <Scripts />
      </body>
    </html>
  )
}
