import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/shoo/callback')({
  component: ShooCallbackPage,
})

function ShooCallbackPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
    </main>
  )
}
