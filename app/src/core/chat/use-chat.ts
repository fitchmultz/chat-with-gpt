import { useCallback, useEffect, useState } from 'react'
import { backend } from '../backend'
import { type ChatManager } from '..'
import { type Chat, type Message, type Parameters, AnthropicMessage, getAnthropicMessageFromMessage } from './types'
import { createChatCompletion as createOpenAIChatCompletion, createStreamingChatCompletion as createOpenAIStreamingChatCompletion } from './openai'
import { createChatCompletion as createAnthropicChatCompletion, createStreamingChatCompletion as createAnthropicStreamingChatCompletion, anthropicModels } from './anthropic'

export interface UseChatResult {
  chat: Chat | null | undefined
  chatLoadedAt: number
  messages: Message[]
  messagesToDisplay: Message[]
  leaf: Message | null | undefined
}

function isAnthropicModel(model: string): boolean {
  return anthropicModels.includes(model)
}

async function createChatCompletion(messages: Message[], parameters: Parameters): Promise<string> {
  if (isAnthropicModel(parameters.model)) {
    const anthropicMessages = messages.map(getAnthropicMessageFromMessage)
    return createAnthropicChatCompletion(anthropicMessages, parameters)
  } else {
    return createOpenAIChatCompletion(messages, parameters)
  }
}

async function createStreamingChatCompletion(messages: Message[], parameters: Parameters) {
  if (isAnthropicModel(parameters.model)) {
    const anthropicMessages = messages.map(getAnthropicMessageFromMessage)
    return createAnthropicStreamingChatCompletion(anthropicMessages, parameters)
  } else {
    return createOpenAIStreamingChatCompletion(messages, parameters)
  }
}

export function useChat(chatManager: ChatManager, id: string | undefined | null, share = false): UseChatResult {
  const [chat, setChat] = useState<Chat | null | undefined>(null)
  const [_, setVersion] = useState(0) // eslint-disable-line @typescript-eslint/no-unused-vars

  // used to prevent auto-scroll when chat is first opened
  const [chatLoadedAt, setLoadedAt] = useState(0)

  const update = useCallback(async () => {
    if (id) {
      if (!share) {
        const c = chatManager.get(id)
        if (c) {
          setChat(c)
          setVersion(v => v + 1)
          return
        }
      } else {
        const c = await backend.current?.getSharedChat(id)
        if (c) {
          setChat(c)
          setVersion(v => v + 1)
          return
        }
      }
    }
    setChat(null)
  }, [id, share, chatManager])

  useEffect(() => {
    if (id) {
      update()
      chatManager.on(id, update)
      setChat(chatManager.get(id))
      setLoadedAt(Date.now())
    } else {
      setChat(null)
      setLoadedAt(0)
    }
    return () => {
      if (id) {
        chatManager.off(id, update)
      }
    }
  }, [id, update, chatManager])

  const leaf = chat?.messages.mostRecentLeaf()

  let messages: Message[] = []
  let messagesToDisplay: Message[] = []

  if (leaf) {
    messages = (chat?.messages.getMessageChainTo(leaf?.id) || [])
    messagesToDisplay = messages.filter(m => ['user', 'assistant'].includes(m.role)) || []
  }

  return {
    chat,
    chatLoadedAt,
    messages,
    messagesToDisplay,
    leaf
  }
}