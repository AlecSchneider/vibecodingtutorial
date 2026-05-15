"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const MOCK_POLL = {
  id: "1",
  question: "What is your favorite programming language?",
  options: [
    { id: "1", text: "TypeScript", votes: 245 },
    { id: "2", text: "Python", votes: 189 },
    { id: "3", text: "Rust", votes: 134 },
    { id: "4", text: "Go", votes: 87 },
  ],
  totalVotes: 655,
}

type ViewMode = "bar" | "pie"

export function PollCard() {
  const [hasVoted, setHasVoted] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("bar")
  const [poll, setPoll] = useState(MOCK_POLL)

  const handleVote = (optionId: string) => {
    if (hasVoted) return

    setSelectedOption(optionId)
    setPoll((prev) => ({
      ...prev,
      options: prev.options.map((opt) =>
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      ),
      totalVotes: prev.totalVotes + 1,
    }))
    setHasVoted(true)
  }

  const getPercentage = (votes: number) => {
    return Math.round((votes / poll.totalVotes) * 100)
  }

  const colors = [
    "bg-primary",
    "bg-secondary",
    "bg-accent",
    "bg-indigo-400",
  ]

  const pieColors = [
    "#6366f1",
    "#ec4899",
    "#22d3ee",
    "#818cf8",
  ]

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card border border-border rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Community Poll
          </span>
          <span className="text-xs text-muted-foreground">
            {poll.totalVotes.toLocaleString()} votes
          </span>
        </div>

        <h2 className="text-xl font-semibold text-card-foreground mb-6 leading-tight">
          {poll.question}
        </h2>

        <AnimatePresence mode="wait">
          {hasVoted && viewMode === "pie" ? (
            <motion.div
              key="pie"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-4 mb-6"
            >
              <PieChart data={poll.options} colors={pieColors} />
              <div className="flex flex-wrap justify-center gap-3">
                {poll.options.map((option, index) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: pieColors[index] }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {option.text} ({getPercentage(option.votes)}%)
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="bar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-3 mb-6"
            >
              {poll.options.map((option, index) => (
                <PollOption
                  key={option.id}
                  option={option}
                  percentage={getPercentage(option.votes)}
                  color={colors[index]}
                  hasVoted={hasVoted}
                  isSelected={selectedOption === option.id}
                  onVote={() => handleVote(option.id)}
                  index={index}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {hasVoted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="flex items-center justify-center gap-2 mb-2"
          >
            <button
              onClick={() => setViewMode("bar")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                viewMode === "bar"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-card-foreground"
              }`}
            >
              Bar Chart
            </button>
            <button
              onClick={() => setViewMode("pie")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                viewMode === "pie"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-card-foreground"
              }`}
            >
              Pie Chart
            </button>
          </motion.div>
        )}
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-6 py-4 px-6 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-primary/25 transition-shadow duration-300"
      >
        Create your own Poll
      </motion.button>
    </div>
  )
}

interface PollOptionProps {
  option: { id: string; text: string; votes: number }
  percentage: number
  color: string
  hasVoted: boolean
  isSelected: boolean
  onVote: () => void
  index: number
}

function PollOption({
  option,
  percentage,
  color,
  hasVoted,
  isSelected,
  onVote,
  index,
}: PollOptionProps) {
  return (
    <motion.button
      onClick={onVote}
      disabled={hasVoted}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className={`relative w-full text-left rounded-xl overflow-hidden transition-all duration-200 ${
        hasVoted
          ? "cursor-default"
          : "hover:scale-[1.02] hover:shadow-lg cursor-pointer"
      } ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}`}
    >
      <div className="relative z-10 flex items-center justify-between px-4 py-3.5 bg-muted/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              isSelected
                ? "border-primary bg-primary"
                : "border-muted-foreground"
            }`}
          >
            {isSelected && (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-3 h-3 text-primary-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            )}
          </div>
          <span className="font-medium text-card-foreground">{option.text}</span>
        </div>
        {hasVoted && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm font-semibold text-card-foreground"
          >
            {percentage}%
          </motion.span>
        )}
      </div>

      {hasVoted && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className={`absolute inset-y-0 left-0 ${color} opacity-30`}
        />
      )}
    </motion.button>
  )
}

interface PieChartProps {
  data: { id: string; text: string; votes: number }[]
  colors: string[]
}

function PieChart({ data, colors }: PieChartProps) {
  const total = data.reduce((acc, item) => acc + item.votes, 0)
  let currentAngle = 0

  const paths = data.map((item, index) => {
    const percentage = item.votes / total
    const angle = percentage * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle

    const startRad = (startAngle - 90) * (Math.PI / 180)
    const endRad = (endAngle - 90) * (Math.PI / 180)

    const x1 = 50 + 40 * Math.cos(startRad)
    const y1 = 50 + 40 * Math.sin(startRad)
    const x2 = 50 + 40 * Math.cos(endRad)
    const y2 = 50 + 40 * Math.sin(endRad)

    const largeArc = angle > 180 ? 1 : 0

    const d = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`

    return { d, color: colors[index], index }
  })

  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="w-48 h-48"
      initial={{ rotate: -90, opacity: 0 }}
      animate={{ rotate: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {paths.map((path) => (
        <motion.path
          key={path.index}
          d={path.d}
          fill={path.color}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: path.index * 0.1,
            duration: 0.5,
            ease: "easeOut",
          }}
          style={{ transformOrigin: "center" }}
          className="transition-all duration-200 hover:brightness-110"
        />
      ))}
      <circle cx="50" cy="50" r="20" fill="var(--color-card)" />
    </motion.svg>
  )
}
