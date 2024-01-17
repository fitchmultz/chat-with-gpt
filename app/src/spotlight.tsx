import { useCallback, useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from './core/context'

// Define a type for the search result
interface SearchResult {
  chatID: string
  messageID?: string
  // Add other properties as needed
  onTrigger?: () => void
}

export function useChatSpotlightProps(): {
  shortcut: string[]
  overlayColor: string
  searchPlaceholder: string
  searchIcon: JSX.Element
  actions: (query: string) => SearchResult[]
  filter: (query: string, items: SearchResult[]) => SearchResult[]
} {
  const navigate = useNavigate()
  const { chat } = useAppContext()
  const intl = useIntl()

  const [version, setVersion] = useState(0)

  useEffect(() => {
    const handleUpdate = () => { setVersion(v => v + 1) };
    chat.on('update', handleUpdate)
    return () => {
      chat.off('update', handleUpdate)
    };
  }, [chat])

  const search = useCallback((query: string): SearchResult[] => {
    return (chat.searchChats(query) as SearchResult[])
      .map((result) => ({
        ...result,
        onTrigger: () => { navigate(`/chat/${result.chatID}${result.messageID ? `#msg-${result.messageID}` : ''}`) }
      }))
  }, [chat, navigate, version]);
  

  const props = useMemo(() => ({
    shortcut: ['/'],
    overlayColor: '#000000',
    searchPlaceholder: intl.formatMessage({ defaultMessage: 'Search your chats' }),
    searchIcon: <i className="fa fa-search" aria-label="Search" />,
    actions: search,
    filter: (query: string, items: SearchResult[]) => items
  }), [search])

  return props
}
