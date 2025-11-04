/**
 * DeepLinkHandler
 * Handles deep links from push notifications and external sources
 */

import { useEffect } from 'react'
import { Linking } from 'react-native'
import { useNavigation } from '@react-navigation/native'

interface DeepLinkHandlerProps {
  onCheckInNotification?: (checkInId: string) => void
  onMessageNotification?: (connectionId: string) => void
}

export const DeepLinkHandler: React.FC<DeepLinkHandlerProps> = ({
  onCheckInNotification,
  onMessageNotification,
}) => {
  const navigation = useNavigation()

  useEffect(() => {
    // Handle deep links when app is already open
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url)
    })

    // Handle deep links when app is opened from closed state
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url)
      }
    })

    return () => {
      subscription.remove()
    }
  }, [])

  const handleDeepLink = (url: string) => {
    try {
      const { hostname, pathname, searchParams } = new URL(url)

      // Example URLs:
      // volvoxsober://check-in?id=uuid
      // volvoxsober://message?connectionId=uuid
      // volvoxsober://check-in-response?checkInId=uuid

      switch (pathname) {
        case '/check-in':
        case '/check-in-response': {
          const checkInId = searchParams.get('checkInId') || searchParams.get('id')
          if (checkInId && onCheckInNotification) {
            onCheckInNotification(checkInId)
          }
          break
        }

        case '/message': {
          const connectionId = searchParams.get('connectionId') || searchParams.get('id')
          if (connectionId && onMessageNotification) {
            onMessageNotification(connectionId)
          }
          break
        }

        default:
          console.log('Unhandled deep link:', url)
      }
    } catch (error) {
      console.error('Failed to parse deep link:', url, error)
    }
  }

  return null // This is a logic-only component
}

// ============================================================
// Deep Link URL Builders
// ============================================================

/**
 * Generate deep link URL for check-in notification
 */
export const buildCheckInDeepLink = (checkInId: string): string => {
  return `volvoxsober://check-in-response?checkInId=${checkInId}`
}

/**
 * Generate deep link URL for message notification
 */
export const buildMessageDeepLink = (connectionId: string): string => {
  return `volvoxsober://message?connectionId=${connectionId}`
}

/**
 * Parse deep link URL to extract parameters
 */
export const parseDeepLink = (url: string): {
  type: 'check-in' | 'message' | 'unknown'
  params: Record<string, string>
} => {
  try {
    const { pathname, searchParams } = new URL(url)

    if (pathname === '/check-in' || pathname === '/check-in-response') {
      return {
        type: 'check-in',
        params: {
          checkInId: searchParams.get('checkInId') || searchParams.get('id') || '',
        },
      }
    }

    if (pathname === '/message') {
      return {
        type: 'message',
        params: {
          connectionId: searchParams.get('connectionId') || searchParams.get('id') || '',
        },
      }
    }

    return { type: 'unknown', params: {} }
  } catch (error) {
    console.error('Failed to parse deep link:', error)
    return { type: 'unknown', params: {} }
  }
}
