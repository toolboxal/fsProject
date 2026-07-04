import { useEffect } from 'react'
import { useGlobalSearchParams, usePathname } from 'expo-router'
import { usePostHog } from 'posthog-react-native'

const PostHogScreenTracker = () => {
  const pathname = usePathname()
  const params = useGlobalSearchParams()
  const posthog = usePostHog()

  useEffect(() => {
    posthog.screen(pathname, params)
  }, [pathname, params, posthog])

  return null
}

export default PostHogScreenTracker
