import PostHog from 'posthog-react-native'

const postHogApiKey = process.env.EXPO_PUBLIC_FSPAL_POSTHOG_API_KEY

export const posthog = new PostHog(postHogApiKey!, {
  // usually 'https://us.i.posthog.com' or 'https://eu.i.posthog.com'
  host: 'https://us.i.posthog.com', // host is optional if you use https://us.i.posthog.com
  enableSessionReplay: true,
  sessionReplayConfig: {
    maskAllTextInputs: false,
    maskAllSandboxedViews: false,
    maskAllImages: false,
  },
})
