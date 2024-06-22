import React, { Suspense, useCallback, useEffect } from 'react'
import styled from '@emotion/styled'
import slugify from 'slugify'
import { useParams } from 'react-router-dom'
import { Loader } from '@mantine/core'

import { useAppContext } from '../../core/context'
import { backend } from '../../core/backend'
import { Page } from '../page'
import { useOption } from '../../core/options/use-option'

import { sendMessage as sendAnthropicMessage } from '../../core/anthropic/message';

const Message = React.lazy(async () => await import(/* webpackPreload: true */ '../message'))

const Messages = styled.div`
    @media (min-height: 30em) {
        max-height: 100%;
        flex-grow: 1;
        overflow-y: scroll;
    }
    display: flex;
    flex-direction: column;
`

const EmptyMessage = styled.div`
    flex-grow: 1;
    padding-bottom: 5vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-family: "Work Sans", sans-serif;
    line-height: 1.7;
    gap: 1rem;
    min-height: 10rem;
`

export default function ChatPage (props: any) {
  const { id } = useParams()
  const context = useAppContext()

  const [autoScrollWhenOpeningChat] = useOption('auto-scroll', 'auto-scroll-when-opening-chat')
  const [autoScrollWhileGenerating] = useOption('auto-scroll', 'auto-scroll-while-generating')

  useEffect(() => {
    if (props.share || !context.currentChat.chatLoadedAt) {
      return
    }

    const shouldScroll = autoScrollWhenOpeningChat || (Date.now() - context.currentChat.chatLoadedAt) > 5000

    if (!shouldScroll) {
      return
    }

    const container = document.querySelector('#messages')!
    const messages = document.querySelectorAll('#messages .message')

    if (messages.length) {
      const latest = messages[messages.length - 1] as HTMLElement
      const offset = Math.max(0, latest.offsetTop - 100)
      setTimeout(() => {
        container?.scrollTo({ top: offset, behavior: 'smooth' })
      }, 100)
    }
  }, [context.currentChat?.chatLoadedAt, context.currentChat?.messagesToDisplay.length, props.share, autoScrollWhenOpeningChat])

  const autoScroll = useCallback(() => {
    if (context.generating && autoScrollWhileGenerating) {
      const container = document.querySelector('#messages')!
      container?.scrollTo({ top: 999999, behavior: 'smooth' })
      container?.parentElement?.scrollTo({ top: 999999, behavior: 'smooth' })
    }
  }, [context.generating, autoScrollWhileGenerating])
  useEffect(() => {
    const timer = setInterval(() => { autoScroll() }, 1000)
    return () => {
      clearInterval(timer)
    }
  }, [autoScroll])

  const messagesToDisplay = context.currentChat.messagesToDisplay

  const shouldShowChat = id && context.currentChat.chat && !(messagesToDisplay.length === 0)

  const handleSendMessage = async (message: UserSubmittedMessage) => {
    try {
      let response: string;
      if (message.requestedParameters.provider === 'anthropic') {
        response = await sendAnthropicMessage(context.currentChat.chat!.messages.toArray(), message.requestedParameters);
      } else {
        // Assuming there's an existing function for sending OpenAI messages
        response = await context.sendMessage(message);
      }
  
      // Add the response to the chat
      context.addMessage({
        id: Date.now().toString(),
        chatID: message.chatID,
        parentID: message.parentID,
        timestamp: Date.now(),
        role: 'assistant',
        content: response,
        done: true,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle error (e.g., show error message to user)
      context.setError('Failed to send message. Please try again.');
    }
  }

  return <Page id={id || 'landing'}
        headerProps={{
          share: context.isShare,
          canShare: messagesToDisplay.length > 1,
          title: (id && (messagesToDisplay.length > 0)) ? context.currentChat.chat?.title : null,
          onShare: async () => {
            if (context.currentChat.chat) {
              const id = await backend.current?.shareChat(context.currentChat.chat)
              if (id) {
                const slug = context.currentChat.chat.title
                  ? '/' + slugify(context.currentChat.chat.title.toLocaleLowerCase())
                  : ''
                const url = window.location.origin + '/s/' + id + slug
                navigator.share?.({
                  title: context.currentChat.chat.title || undefined,
                  url
                })
              }
            }
          }
        }}
        onSendMessage={handleSendMessage}
        >
        <Suspense fallback={<Messages id="messages">
            <EmptyMessage>
                <Loader variant="dots" />
            </EmptyMessage>
        </Messages>}>
            <Messages id="messages">
                {shouldShowChat && (
                    <div style={{ paddingBottom: '4.5rem' }}>
                        {messagesToDisplay.map((message) => (
                            <Message key={id + ':' + message.id}
                                message={message}
                                share={props.share}
                                last={context.currentChat.chat!.messages.leafs.some(n => n.id === message.id)} />
                        ))}
                    </div>
                )}
                {!shouldShowChat && <EmptyMessage>
                    <Loader variant="dots" />
                </EmptyMessage>}
            </Messages>
        </Suspense>
    </Page>
}
