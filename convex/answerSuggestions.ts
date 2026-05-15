import { v } from 'convex/values'
import { action } from './_generated/server'

declare const process: {
  env: {
    OPENROUTER_API_KEY?: string
  }
}

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

const parseSuggestions = (content: string) => {
  const parsed: unknown = JSON.parse(content)

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('answers' in parsed) ||
    !Array.isArray(parsed.answers)
  ) {
    throw new Error('OpenRouter returned an invalid response.')
  }

  return parsed.answers
    .filter((answer): answer is string => typeof answer === 'string')
    .map((answer) => answer.trim())
    .filter((answer) => answer.length > 0)
    .slice(0, 5)
}

export const generate = action({
  args: {
    question: v.string(),
    existingAnswers: v.array(v.string()),
  },
  handler: async (_ctx, args) => {
    const question = args.question.trim()
    const existingAnswers = args.existingAnswers
      .map((answer) => answer.trim())
      .filter((answer) => answer.length > 0)
    const apiKey = process.env.OPENROUTER_API_KEY

    if (question.length === 0) {
      throw new Error('Question is required.')
    }

    if (apiKey === undefined) {
      throw new Error('OPENROUTER_API_KEY is not configured.')
    }

    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://www.vibecodingtutorial.de',
          'X-Title': 'Vibe Coding Tutorial Polls',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'Generate concise poll answer options. Avoid duplicating any existing answers. Return only JSON with an "answers" array containing 3 to 5 strings.',
            },
            {
              role: 'user',
              content: JSON.stringify({
                question,
                existingAnswers,
              }),
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.8,
        }),
      },
    )

    if (!response.ok) {
      throw new Error('OpenRouter request failed.')
    }

    const body = (await response.json()) as OpenRouterResponse
    const content = body.choices?.[0]?.message?.content

    if (content === undefined) {
      throw new Error('OpenRouter returned no content.')
    }

    const suggestions = parseSuggestions(content)

    if (suggestions.length < 3) {
      throw new Error('OpenRouter returned too few answers.')
    }

    return suggestions
  },
})
