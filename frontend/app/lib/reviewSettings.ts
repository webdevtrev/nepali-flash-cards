export const REVIEW_CARD_LIMIT_COOKIE = 'reviewCardLimit'
export const REVIEW_CARD_LIMIT = 10

/** Reads the review card limit setting from the browser's cookies. */
export function getReviewCardLimitFromClient(): number | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${REVIEW_CARD_LIMIT_COOKIE}=([^;]*)`))
  return match?.[1] === '1' ? REVIEW_CARD_LIMIT : null
}

/** Persists the review card limit setting to the browser's cookies. */
export function setReviewCardLimitOnClient(enabled: boolean): void {
  if (typeof document === 'undefined') return
  document.cookie = enabled
    ? `${REVIEW_CARD_LIMIT_COOKIE}=1; path=/; max-age=31536000; SameSite=Lax`
    : `${REVIEW_CARD_LIMIT_COOKIE}=; path=/; max-age=0; SameSite=Lax`
}
