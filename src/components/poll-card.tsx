"use client"

import { Link } from "@tanstack/react-router"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"

const MOCK_POLL = {
  id: "1",
  question: "Are you subscribed yet?",
  options: [
    { id: "yes", text: "Yes", votes: 245 },
    { id: "maybe", text: "Maybe", votes: 189 },
    { id: "no", text: "No", votes: 134 },
    { id: "why-not-yet", text: "Why not yet", votes: 87 },
  ],
  totalVotes: 655,
}

const SUBSCRIBE_URL = "https://a3.lol/youtube"

type ViewMode = "bar" | "pie"

interface PollOptionData {
  id: string
  text: string
  votes: number
}

interface PollResultsCardProps {
  question: string
  options: Array<PollOptionData>
  totalVotes: number
  selectedOptionId: string | null
  shareUrl?: string
  onVote: (optionId: string) => void
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

export function PollCard() {
  const [hasVoted, setHasVoted] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [poll, setPoll] = useState(MOCK_POLL)

  const handleVote = (optionId: string) => {
    if (hasVoted) return

    if (optionId !== "yes") {
      window.location.href = SUBSCRIBE_URL
      return
    }

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

  return (
    <div className="w-full sm:w-md sm:min-w-md sm:max-w-md mx-auto">
      <PollResultsCard
        question={poll.question}
        options={poll.options}
        totalVotes={poll.totalVotes}
        selectedOptionId={selectedOption}
        onVote={handleVote}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link
          to="/new"
          className="block w-full mt-6 py-4 px-6 text-center bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-primary/25 transition-shadow duration-300"
        >
          Create Poll
        </Link>
      </motion.div>
    </div>
  )
}

export function PollResultsCard({
  question,
  options,
  totalVotes,
  selectedOptionId,
  shareUrl,
  onVote,
}: PollResultsCardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("bar")
  const [showCopiedMessage, setShowCopiedMessage] = useState(false)
  const hasVoted = selectedOptionId !== null
  const getPercentage = (votes: number) => {
    return totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100)
  }
  const copyShareUrl = () => {
    if (shareUrl === undefined) {
      return
    }

    void navigator.clipboard.writeText(`https://${shareUrl}`)
    setShowCopiedMessage(true)
    window.setTimeout(() => setShowCopiedMessage(false), 1800)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative bg-card border border-border rounded-2xl p-6 shadow-2xl"
    >
      <div className="flex items-center justify-between mb-6">
        {shareUrl === undefined ? (
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Community Poll
          </span>
        ) : (
          <button
            type="button"
            onClick={copyShareUrl}
            className="min-w-0 flex items-center gap-1.5 text-left text-xs font-medium text-muted-foreground hover:text-card-foreground transition-colors"
          >
            <span className="truncate">{shareUrl}</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5 flex-none"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        )}
        <span className="text-xs text-muted-foreground">
          {totalVotes.toLocaleString()} votes
        </span>
      </div>

      <AnimatePresence>
        {showCopiedMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-3rem)] max-w-sm -translate-x-1/2 rounded-xl border border-border bg-card px-4 py-3 text-center text-sm font-medium text-card-foreground shadow-2xl"
          >
            Copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>

      <h2 className="text-xl font-semibold text-card-foreground mb-6 leading-tight">
        {question}
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
            <PieChart data={options} pieSliceColors={pieColors} />
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
            {options.map((option, index) => (
              <PollOption
                key={option.id}
                option={option}
                percentage={getPercentage(option.votes)}
                color={colors[index % colors.length]}
                hasVoted={hasVoted}
                isSelected={selectedOptionId === option.id}
                onVote={() => onVote(option.id)}
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
  )
}

interface PollOptionProps {
  option: PollOptionData
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
            {option.votes.toLocaleString()} ({percentage}%)
          </motion.span>
        )}
      </div>

      {hasVoted && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className={`absolute inset-y-0 left-0 ${color} opacity-60`}
        />
      )}
    </motion.button>
  )
}

interface PieChartProps {
  data: Array<PollOptionData>
  pieSliceColors: Array<string>
}

function PieChart({ data, pieSliceColors }: PieChartProps) {
  const total = data.reduce((acc, item) => acc + item.votes, 0)
  let currentAngle = 0

  const paths = data.map((item, index) => {
    const percentage = total === 0 ? 0 : item.votes / total
    const angle = percentage * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    const midAngle = startAngle + angle / 2
    currentAngle = endAngle

    const startRad = (startAngle - 90) * (Math.PI / 180)
    const endRad = (endAngle - 90) * (Math.PI / 180)
    const midRad = (midAngle - 90) * (Math.PI / 180)

    const x1 = 50 + 40 * Math.cos(startRad)
    const y1 = 50 + 40 * Math.sin(startRad)
    const x2 = 50 + 40 * Math.cos(endRad)
    const y2 = 50 + 40 * Math.sin(endRad)
    const lineX = 50 + 45 * Math.cos(midRad)
    const lineY = 50 + 45 * Math.sin(midRad)
    const labelX = 50 + 56 * Math.cos(midRad)
    const labelY = 50 + 56 * Math.sin(midRad)

    const largeArc = angle > 180 ? 1 : 0

    const d =
      percentage === 1
        ? "M 50 10 A 40 40 0 1 1 49.99 10 A 40 40 0 1 1 50 10 Z"
        : `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`

    const textAnchor: "start" | "end" = labelX >= 50 ? "start" : "end"

    return {
      d,
      color: pieSliceColors[index % pieSliceColors.length],
      index,
      label: item.text,
      labelX,
      labelY,
      lineX,
      lineY,
      isFullCircle: percentage === 1,
      percentageValue: percentage,
      percentage: Math.round(percentage * 100),
      votes: item.votes,
      textAnchor,
    }
  })

  return (
    <motion.svg
      viewBox="-20 -12 140 124"
      className="w-full h-64 overflow-visible"
      initial={{ rotate: -90, opacity: 0 }}
      animate={{ rotate: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {paths.map((path) =>
        path.isFullCircle ? (
          <motion.circle
            key={path.index}
            cx="50"
            cy="50"
            r="40"
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
        ) : (
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
        ),
      )}
      {paths
        .filter((path) => path.percentageValue > 0)
        .map((path) => (
        <motion.g
          key={`label-${path.index}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 + path.index * 0.1, duration: 0.3 }}
        >
          <line
            x1="50"
            y1="50"
            x2={path.lineX}
            y2={path.lineY}
            stroke={path.color}
            strokeWidth="0.75"
            strokeLinecap="round"
            opacity="0.65"
          />
          <text
            x={path.labelX}
            y={path.labelY}
            textAnchor={path.textAnchor}
            dominantBaseline="middle"
            className="fill-card-foreground text-[4px] font-medium"
          >
            <tspan x={path.labelX} dy="-2">
              {path.label}
            </tspan>
            <tspan
              x={path.labelX}
              dy="5"
              className="fill-muted-foreground text-[3.5px]"
            >
              {path.votes.toLocaleString()} ({path.percentage}%)
            </tspan>
          </text>
        </motion.g>
        ))}
      <circle cx="50" cy="50" r="20" fill="var(--color-card)" />
    </motion.svg>
  )
}
