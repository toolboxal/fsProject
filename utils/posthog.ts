import PostHog from 'posthog-react-native'

const postHogApiKey = process.env.EXPO_PUBLIC_FSPAL_POSTHOG_API_KEY

export const posthog = new PostHog(postHogApiKey ?? '', {
  host: 'https://us.i.posthog.com',
  disabled: !postHogApiKey,
  enableSessionReplay: Boolean(postHogApiKey),
  sessionReplayConfig: {
    maskAllTextInputs: false,
    maskAllSandboxedViews: false,
    maskAllImages: false,
  },
})
