import { Link, createFileRoute } from '@tanstack/react-router'
import { signIn, signOut, useAuth } from '../shoo'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth()

  return (
    <main className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-background">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full sm:w-md sm:min-w-md sm:max-w-md mx-auto">
        <section className="bg-card border border-border rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Login
            </span>
            <Link
              to="/"
              className="text-xs font-medium text-muted-foreground hover:text-card-foreground transition-colors"
            >
              Home
            </Link>
          </div>

          <h1 className="text-xl font-semibold text-card-foreground mb-6 leading-tight">
            Sign in to Vibe Coding Tutorial
          </h1>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              if (isAuthenticated) {
                signOut()
                return
              }

              void signIn()
            }}
            className="w-full py-4 px-6 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-primary/25 transition-shadow duration-300 disabled:cursor-wait disabled:opacity-70"
          >
            {isAuthenticated ? 'Sign Out' : 'Sign in with Google'}
          </button>
        </section>
      </div>
    </main>
  )
}
