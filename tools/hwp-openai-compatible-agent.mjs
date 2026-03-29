import process from 'node:process'

const API_KEY = process.env.HWP_LLM_API_KEY || process.env.OPENAI_API_KEY || ''
const BASE_URL = (process.env.HWP_LLM_BASE_URL || 'https://api.openai.com').replace(/\/$/, '')
const MODEL = process.env.HWP_LLM_MODEL || ''
const PATHNAME = process.env.HWP_LLM_PATH || '/v1/chat/completions'
const TIMEOUT_MS = Number(process.env.HWP_LLM_TIMEOUT_MS || 120000)
const TEMPERATURE = Number(process.env.HWP_LLM_TEMPERATURE || 0.2)
const MAX_TOKENS = Number(process.env.HWP_LLM_MAX_TOKENS || 4000)

async function main() {
  const prompt = process.env.HWP_AGENT_MESSAGE || ''

  if (!prompt.trim()) {
    fail('HWP_AGENT_MESSAGE is required')
  }

  if (!API_KEY) {
    fail('HWP_LLM_API_KEY or OPENAI_API_KEY is required for live mode')
  }

  if (!MODEL) {
    fail('HWP_LLM_MODEL is required for live mode')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(`${BASE_URL}${PATHNAME}`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(buildRequestBody(prompt)),
      signal: controller.signal
    })

    if (!response.ok) {
      const errorText = await response.text()
      fail(`LLM request failed: ${response.status} ${truncate(errorText, 600)}`)
    }

    const data = await response.json()
    const rawText = extractText(data)
    const jsonText = extractJsonObject(rawText)

    process.stdout.write(JSON.stringify({
      payloads: [
        {
          text: jsonText,
          mediaUrl: null
        }
      ]
    }))
  } catch (error) {
    fail(error.name === 'AbortError' ? `LLM request timed out after ${TIMEOUT_MS}ms` : error.message)
  } finally {
    clearTimeout(timeout)
  }
}

function buildHeaders() {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }

  const extraHeaders = process.env.HWP_LLM_EXTRA_HEADERS
  if (extraHeaders) {
    Object.assign(headers, JSON.parse(extraHeaders))
  }

  return headers
}

function buildRequestBody(prompt) {
  const systemPrompt = [
    'You are a live HWP provider.',
    'Return exactly one JSON object and nothing else.',
    'Do not wrap the JSON in markdown fences.',
    'Do not add commentary before or after the JSON.',
    'Preserve the schema requested in the user prompt.'
  ].join(' ')

  if (PATHNAME.includes('/responses')) {
    return {
      model: MODEL,
      input: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: TEMPERATURE,
      max_output_tokens: MAX_TOKENS
    }
  }

  return {
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature: TEMPERATURE,
    max_tokens: MAX_TOKENS
  }
}

function extractText(data) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) {
    return data.output_text
  }

  const firstOutput = data?.output?.[0]?.content
  if (Array.isArray(firstOutput)) {
    const joined = firstOutput
      .map(item => item?.text || item?.output_text || '')
      .join('\n')
      .trim()
    if (joined) return joined
  }

  const messageContent = data?.choices?.[0]?.message?.content
  if (typeof messageContent === 'string' && messageContent.trim()) {
    return messageContent
  }

  if (Array.isArray(messageContent)) {
    const joined = messageContent
      .map(item => item?.text || item?.content || '')
      .join('\n')
      .trim()
    if (joined) return joined
  }

  const text = data?.choices?.[0]?.text
  if (typeof text === 'string' && text.trim()) {
    return text
  }

  fail(`Unsupported LLM response shape: ${truncate(JSON.stringify(data), 600)}`)
}

function extractJsonObject(rawText) {
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()

  try {
    JSON.parse(cleaned)
    return cleaned
  } catch {
    const start = cleaned.indexOf('{')
    if (start === -1) {
      fail(`Model did not return JSON: ${truncate(cleaned, 600)}`)
    }

    let depth = 0
    let inString = false
    let escaped = false

    for (let i = start; i < cleaned.length; i += 1) {
      const ch = cleaned[i]

      if (inString) {
        if (escaped) {
          escaped = false
        } else if (ch === '\\') {
          escaped = true
        } else if (ch === '"') {
          inString = false
        }
        continue
      }

      if (ch === '"') {
        inString = true
        continue
      }

      if (ch === '{') depth += 1
      if (ch === '}') {
        depth -= 1
        if (depth === 0) {
          const candidate = cleaned.slice(start, i + 1)
          try {
            JSON.parse(candidate)
            return candidate
          } catch {
            break
          }
        }
      }
    }

    fail(`Could not extract a valid JSON object from model output: ${truncate(cleaned, 600)}`)
  }
}

function truncate(text, maxLength) {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}

function fail(message) {
  console.error(message)
  process.exit(1)
}

await main()
