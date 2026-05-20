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
    title: 'Vibe Coded Polls',
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Vibe Coded Polls',
      },
      {
        name: 'description',
        content:
          'Vibe Coded Polls is a sample poll website built in vibe coding tutorials, featuring shareable polls, AI answer generation, Google login, Stripe payments, and live Convex results.',
      },
      {
        name: 'keywords',
        content:
          'vibe coding tutorials, vibe coded polls, poll website tutorial, Convex tutorial, TanStack Start poll app, AI poll generator',
      },
      {
        property: 'og:title',
        content: 'Vibe Coded Polls',
      },
      {
        property: 'og:description',
        content:
          'A sample poll website built during vibe coding tutorials with shareable polls, AI features, auth, payments, and live results.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:url',
        content: 'https://www.vibecodingtutorial.de',
      },
      {
        name: 'twitter:card',
        content: 'summary',
      },
      {
        name: 'twitter:title',
        content: 'Vibe Coded Polls',
      },
      {
        name: 'twitter:description',
        content:
          'A vibe coding tutorial project for building a modern poll website.',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon.svg?v=2',
      },
      {
        rel: 'shortcut icon',
        href: '/favicon.svg?v=2',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
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
        <footer className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-1 text-center text-xs font-medium text-muted-foreground">
          <a
            href="https://www.youtube.com/watch?v=Y_NrWcWSqGQ"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-card-foreground"
          >
            Watch how this was built on Youtube
          </a>
          <a
            href="https://github.com/AlecSchneider/vibecodingtutorial"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-card-foreground"
          >
            Check out the Code on Github
          </a>
        </footer>
        <Analytics />
        <Scripts />
      </body>
    </html>
  )
}
