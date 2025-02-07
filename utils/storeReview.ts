import * as StoreReview from 'expo-store-review'
import { storage } from '@/store/storage'

const FIRST_LAUNCH_KEY = 'app_first_launch_time'
const REVIEW_REQUESTED_KEY = 'app_review_requested'
const DAYS_UNTIL_REVIEW = 50

export const checkAndRequestReview = async () => {
  // If we've already requested a review before, don't ask again
  const hasRequestedReview = storage.getBoolean(REVIEW_REQUESTED_KEY)
  if (hasRequestedReview) {
    return
  }

  // Get or set first launch time
  let firstLaunchTime = storage.getNumber(FIRST_LAUNCH_KEY)
  if (!firstLaunchTime) {
    firstLaunchTime = Date.now()
    storage.set(FIRST_LAUNCH_KEY, firstLaunchTime)
    return // Exit early on first launch
  }

  // Check if 30 days have passed
  const daysSinceFirstLaunch =
    (Date.now() - firstLaunchTime) / (1000 * 60 * 60 * 24)
  if (daysSinceFirstLaunch >= DAYS_UNTIL_REVIEW) {
    // Check if the device supports store review
    const isAvailable = await StoreReview.isAvailableAsync()
    if (isAvailable) {
      // Request review
      await StoreReview.requestReview()
    }

    // Mark as requested regardless of the outcome
    storage.set(REVIEW_REQUESTED_KEY, true)
  }
}
