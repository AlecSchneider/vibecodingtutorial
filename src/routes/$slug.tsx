import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { PollResultsCard } from '../components/poll-card'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/$slug')({
  component: PollPage,
})

const USER_ID_STORAGE_KEY = 'poll-user-id'

const getOrCreateUserId = () => {
  const existingUserId = localStorage.getItem(USER_ID_STORAGE_KEY)

  if (existingUserId !== null) {
    return existingUserId
  }

  const newUserId = crypto.randomUUID()
  localStorage.setItem(USER_ID_STORAGE_KEY, newUserId)

  return newUserId
}

function PollPage() {
  const { slug } = Route.useParams()
  const [userId, setUserId] = useState<string | null>(null)
  const vote = useMutation(api.polls.vote)
  const poll = useQuery(api.polls.getBySlug, { slug, userId })

  useEffect(() => {
    setUserId(getOrCreateUserId())
  }, [])

  if (poll === undefined) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8 bg-background">
        <p className="text-muted-foreground">Loading poll...</p>
      </main>
    )
  }

  if (poll === null) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8 bg-background">
        <p className="text-muted-foreground">Poll not found.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-background">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" />
      </div>

      <Link
        to="/new"
        className="absolute top-4 right-4 z-20 rounded-lg bg-muted px-3 py-2 text-xs font-semibold text-card-foreground shadow-lg transition-colors hover:bg-muted/80"
      >
        Create Poll
      </Link>

      <div className="relative z-10 w-full sm:w-md sm:min-w-md sm:max-w-md mx-auto">
        <PollResultsCard
          question={poll.question}
          shareUrl={`www.vibecodingtutorial.de/${slug}`}
          options={poll.options.map((option) => ({
            id: option._id,
            text: option.text,
            votes: option.votes,
          }))}
          totalVotes={poll.totalVotes}
          selectedOptionId={poll.selectedOptionId}
          onVote={(optionId) => {
            if (userId === null) {
              return
            }

            const option = poll.options.find(
              (pollOption) => pollOption._id === optionId,
            )

            if (option === undefined) {
              return
            }

            void vote({
              pollId: poll._id,
              optionId: option._id,
              userId,
            })
          }}
        />
      </div>
    </main>
  )
}
