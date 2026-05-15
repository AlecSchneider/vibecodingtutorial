import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { FormEvent } from 'react'

export const Route = createFileRoute('/new')({
  component: NewPoll,
})

const initialAnswers = [
  { id: crypto.randomUUID(), value: '' },
  { id: crypto.randomUUID(), value: '' },
]

function NewPoll() {
  const createPoll = useMutation(api.polls.create)
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')
  const [answers, setAnswers] = useState(initialAnswers)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filledAnswerCount = answers.filter(
    (answer) => answer.value.trim().length > 0,
  ).length
  const showQuestionError = attemptedSubmit && question.trim().length === 0
  const showAnswerErrors = attemptedSubmit && filledAnswerCount < 2

  const addAnswer = () => {
    setAnswers((current) => [
      ...current,
      { id: crypto.randomUUID(), value: '' },
    ])
  }

  const updateAnswer = (id: string, value: string) => {
    setAnswers((current) =>
      current.map((answer) =>
        answer.id === id ? { ...answer, value } : answer,
      ),
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAttemptedSubmit(true)

    if (question.trim().length === 0 || filledAnswerCount < 2) {
      return
    }

    setIsSubmitting(true)
    const poll = await createPoll({
      question,
      answers: answers.map((answer) => answer.value),
    })

    await navigate({ to: '/$slug', params: { slug: poll.slug } })
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-background">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full sm:w-md sm:min-w-md sm:max-w-md mx-auto">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card border border-border rounded-2xl p-6 shadow-2xl"
          onSubmit={handleSubmit}
        >
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              New Poll
            </span>
            <span className="text-xs text-muted-foreground">
              {answers.length} answers
            </span>
          </div>

          <label className="block mb-6">
            <span className="sr-only">Question</span>
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask a question"
              aria-invalid={showQuestionError}
              className={`w-full rounded-lg bg-transparent px-2 py-1 text-xl font-semibold text-card-foreground placeholder:text-muted-foreground leading-tight outline-none transition-colors ${
                showQuestionError
                  ? 'ring-2 ring-red-500 placeholder:text-red-300'
                  : ''
              }`}
            />
            {showQuestionError && (
              <span className="mt-2 block text-xs font-medium text-red-400">
                Add a poll question.
              </span>
            )}
          </label>

          <div className="flex flex-col gap-3 mb-6">
            {answers.map((answer, index) => {
              const showAnswerError =
                showAnswerErrors && answer.value.trim().length === 0

              return (
              <label
                key={answer.id}
                className={`relative w-full rounded-xl overflow-hidden bg-muted/50 backdrop-blur-sm px-4 py-3.5 transition-all duration-200 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-card ${
                  showAnswerError
                    ? 'ring-2 ring-red-500 focus-within:ring-red-500'
                    : 'focus-within:ring-primary'
                }`}
              >
                <span className="sr-only">Answer {index + 1}</span>
                <div className="flex items-center gap-3">
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex-none ${
                      showAnswerError
                        ? 'border-red-400'
                        : 'border-muted-foreground'
                    }`}
                  />
                  <input
                    value={answer.value}
                    onChange={(event) =>
                      updateAnswer(answer.id, event.target.value)
                    }
                    placeholder={`Answer ${index + 1}`}
                    aria-invalid={showAnswerError}
                    className={`min-w-0 flex-1 bg-transparent font-medium text-card-foreground outline-none ${
                      showAnswerError
                        ? 'placeholder:text-red-300'
                        : 'placeholder:text-muted-foreground'
                    }`}
                  />
                </div>
                {showAnswerError && (
                  <span className="mt-2 block text-xs font-medium text-red-400">
                    Add at least 2 answers.
                  </span>
                )}
              </label>
              )
            })}
          </div>

          <button
            type="button"
            onClick={addAnswer}
            aria-label="Add answer"
            className="w-full py-3 px-4 mb-3 bg-muted text-card-foreground font-semibold rounded-xl hover:bg-muted/80 transition-colors duration-200"
          >
            +
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-primary/25 transition-shadow duration-300"
          >
            {isSubmitting ? 'Creating...' : 'Create Poll'}
          </button>
        </motion.form>
      </div>
    </main>
  )
}
