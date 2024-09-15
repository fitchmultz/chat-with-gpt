// @ts-expect-error
import { EventSource } from 'launchdarkly-eventsource'
import type express from 'express'
import { apiKey } from '.'
import { countTokensForMessages } from './tokenizer'

export async function streamingHandler (req: express.Request, res: express.Response) {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  })

  const messages = req.body.messages
  const promptTokens = countTokensForMessages(messages)

  let completion = ''

  const eventSource = new EventSource('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...req.body,
      stream: true
    })
  })

  let buffer = ''
  eventSource.addEventListener('message', async (event: any) => {
    buffer += event.data
  
    // Check if the buffer contains a complete LaTeX expression
    if (buffer.includes('$$') || buffer.includes('$')) {
      try {
        const chunk = parseResponseChunk(buffer)
        if (chunk.choices && chunk.choices.length > 0) {
          completion += chunk.choices[0]?.delta?.content || ''
          buffer = '' // Clear the buffer after processing
        }
      } catch (e) {
        console.error(e)
      }
    }
  
    res.write(`data: ${event.data}\n\n`)
    res.flush()
  
    if (event.data === '[DONE]') {
      res.end()
      eventSource.close()
  
      const totalTokens = countTokensForMessages([
        ...messages,
        {
          role: 'assistant',
          content: completion
        }
      ])
      const completionTokens = totalTokens - promptTokens
      return
    }
  })

  eventSource.addEventListener('abort', (event: any) => {
    res.end()
  })

  req.on('close', () => {
    eventSource.close()
  })

  res.on('error', e => {
    eventSource.close()
  })
}

function parseResponseChunk(buffer: any) {
  const chunk = buffer.toString().replace('data: ', '').trim()

  // Check if the chunk contains incomplete LaTeX expressions
  if (chunk.includes('$') && !chunk.includes('$$')) {
    return {
      done: false,
      incomplete: true, // Mark as incomplete
      choices: []
    }
  }

  if (chunk === '[DONE]') {
    return {
      done: true
    }
  }

  const parsed = JSON.parse(chunk)

  return {
    id: parsed.id,
    done: false,
    choices: parsed.choices,
    model: parsed.model
  }
}
