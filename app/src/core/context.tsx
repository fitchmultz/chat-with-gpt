import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { type IntlShape, useIntl } from 'react-intl'
import { Backend, type User } from './backend'
import { ChatManager } from './'
import { useAppDispatch } from '../store'
import { openOpenAIApiKeyPanel, openAnthropicApiKeyPanel } from '../store/settings-ui'
import { type Message, type Parameters } from './chat/types'
import { useChat, type UseChatResult } from './chat/use-chat'
import { TTSContextProvider } from './tts/use-tts'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { isProxySupported as isOpenAIProxySupported } from './chat/openai'
import { isProxySupported as isAnthropicProxySupported, isAnthropicModel } from './chat/anthropic'
import { audioContext, resetAudioContext } from './tts/audio-file-player'

export interface Context {
  authenticated: boolean
  sessionExpired: boolean
  chat: ChatManager
  user: User | null
  intl: IntlShape
  id: string | undefined | null
  currentChat: UseChatResult
  isHome: boolean
  isShare: boolean
  generating: boolean
  onNewMessage: (message?: string) => Promise<string | false>
  regenerateMessage: (message: Message) => Promise<boolean>
  editMessage: (message: Message, content: string) => Promise<boolean>
}

const AppContext = React.createContext<Context>({} as any)

const chatManager = new ChatManager()
const backend = new Backend(chatManager)

let intl: IntlShape

export function useCreateAppContext (): Context {
  const { id: _id } = useParams()
  const [nextID, setNextID] = useState(uuidv4())
  const id = _id ?? nextID

  const dispatch = useAppDispatch()

  intl = useIntl()

  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const isShare = pathname.startsWith('/s/')

  const currentChat = useChat(chatManager, id, isShare)
  const [authenticated, setAuthenticated] = useState(backend?.isAuthenticated || false)
  const [wasAuthenticated, setWasAuthenticated] = useState(backend?.isAuthenticated || false)

  useEffect(() => {
    chatManager.on('y-update', update => { backend?.receiveYUpdate(update) })
  }, [])

  const updateAuth = useCallback((authenticated: boolean) => {
    setAuthenticated(authenticated)
    if (authenticated && backend.user) {
      chatManager.login(backend.user.email || backend.user.id)
    }
    if (authenticated) {
      setWasAuthenticated(true)
      localStorage.setItem('registered', 'true')
    }
  }, [])

  useEffect(() => {
    updateAuth(backend?.isAuthenticated || false)
    backend?.on('authenticated', updateAuth)
    return () => {
      backend?.off('authenticated', updateAuth)
    }
  }, [updateAuth])

  const onNewMessage = useCallback(async (message?: string, imageUrl?: string) => {
    resetAudioContext()

    if (isShare) {
      return false
    }

    if (!message?.trim().length) {
      return false
    }

    const openaiApiKey = chatManager.options.getOption<string>('openai', 'apiKey')
    const anthropicApiKey = chatManager.options.getOption<string>('anthropic', 'apiKey')
    const model = chatManager.options.getOption<string>('parameters', 'model', id)

    if (isAnthropicModel(model)) {
      if (!anthropicApiKey && !isAnthropicProxySupported()) {
        dispatch(openAnthropicApiKeyPanel())
        return false
      }
    } else {
      if (!openaiApiKey && !isOpenAIProxySupported()) {
        dispatch(openOpenAIApiKeyPanel())
        return false
      }
    }

    const parameters: Parameters = {
      model,
      temperature: chatManager.options.getOption<number>('parameters', 'temperature', id),
      max_tokens: chatManager.options.getOption<number>('parameters', 'max_tokens', id),
      apiKey: openaiApiKey,
      anthropicApiKey: anthropicApiKey
    }

    if (id === nextID) {
      setNextID(uuidv4())

      const autoPlay = chatManager.options.getOption<boolean>('tts', 'autoplay')

      if (autoPlay) {
        const ttsService = chatManager.options.getOption<string>('tts', 'service')
        if (ttsService === 'web-speech') {
          const utterance = new SpeechSynthesisUtterance('Generating')
          utterance.volume = 0
          speechSynthesis.speak(utterance)
        }
      }
    }

    chatManager.sendMessage({
      chatID: id,
      content: message.trim(),
      image_url: imageUrl,
      requestedParameters: parameters,
      parentID: currentChat.leaf?.id
    })

    return id
  }, [dispatch, id, currentChat.leaf, isShare])

  const regenerateMessage = useCallback(async (message: Message) => {
    resetAudioContext()

    if (isShare) {
      return false
    }

    const openaiApiKey = chatManager.options.getOption<string>('openai', 'apiKey')
    const anthropicApiKey = chatManager.options.getOption<string>('anthropic', 'apiKey')
    const model = chatManager.options.getOption<string>('parameters', 'model', id)

    if (isAnthropicModel(model)) {
      if (!anthropicApiKey && !isAnthropicProxySupported()) {
        dispatch(openAnthropicApiKeyPanel())
        return false
      }
    } else {
      if (!openaiApiKey && !isOpenAIProxySupported()) {
        dispatch(openOpenAIApiKeyPanel())
        return false
      }
    }

    const parameters: Parameters = {
      model,
      temperature: chatManager.options.getOption<number>('parameters', 'temperature', id),
      max_tokens: chatManager.options.getOption<number>('parameters', 'max_tokens', id),
      apiKey: openaiApiKey,
      anthropicApiKey: anthropicApiKey
    }

    await chatManager.regenerate(message, parameters)

    return true
  }, [dispatch, id, isShare])

  const editMessage = useCallback(async (message: Message, content: string) => {
    resetAudioContext()

    if (isShare) {
      return false
    }

    if (!content?.trim().length) {
      return false
    }

    const openaiApiKey = chatManager.options.getOption<string>('openai', 'apiKey')
    const anthropicApiKey = chatManager.options.getOption<string>('anthropic', 'apiKey')
    const model = chatManager.options.getOption<string>('parameters', 'model', id)

    if (isAnthropicModel(model)) {
      if (!anthropicApiKey && !isAnthropicProxySupported()) {
        dispatch(openAnthropicApiKeyPanel())
        return false
      }
    } else {
      if (!openaiApiKey && !isOpenAIProxySupported()) {
        dispatch(openOpenAIApiKeyPanel())
        return false
      }
    }

    const parameters: Parameters = {
      model,
      temperature: chatManager.options.getOption<number>('parameters', 'temperature', id),
      max_tokens: chatManager.options.getOption<number>('parameters', 'max_tokens', id),
      apiKey: openaiApiKey,
      anthropicApiKey: anthropicApiKey
    }

    if (id && chatManager.has(id)) {
      await chatManager.sendMessage({
        chatID: id,
        content: content.trim(),
        image_url: message.image_url,
        requestedParameters: parameters,
        parentID: message.parentID
      })
    } else {
      const id = await chatManager.createChat()
      await chatManager.sendMessage({
        chatID: id,
        content: content.trim(),
        image_url: message.image_url,
        requestedParameters: parameters,
        parentID: message.parentID
      })
    }

    return true
  }, [dispatch, id, isShare])

  const generating = currentChat?.messagesToDisplay?.length > 0
    ? !currentChat.messagesToDisplay[currentChat.messagesToDisplay.length - 1].done
    : false

  const context = useMemo<Context>(() => ({
    authenticated,
    sessionExpired: !authenticated && wasAuthenticated,
    id,
    user: backend.user,
    intl,
    chat: chatManager,
    currentChat,
    isHome,
    isShare,
    generating,
    onNewMessage,
    regenerateMessage,
    editMessage
  }), [authenticated, wasAuthenticated, generating, onNewMessage, regenerateMessage, editMessage, currentChat, id, isHome, isShare, intl])

  return context
}

export function useAppContext () {
  return React.useContext(AppContext)
}

export function AppContextProvider (props: { children: React.ReactNode }) {
  const context = useCreateAppContext()
  return <AppContext.Provider value={context}>
        <TTSContextProvider>
            {props.children}
        </TTSContextProvider>
    </AppContext.Provider>
}
