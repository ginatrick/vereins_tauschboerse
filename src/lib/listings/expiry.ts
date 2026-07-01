export const LISTING_LIFETIME_DAYS = 90

export function daysRemaining(createdAt: string): number {
  const ageMs = Date.now() - new Date(createdAt).getTime()
  const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000))
  return Math.max(0, LISTING_LIFETIME_DAYS - ageDays)
}

export function daysRemainingLabel(createdAt: string): string {
  const remaining = daysRemaining(createdAt)
  if (remaining <= 0) {
    return 'Läuft heute ab'
  }
  if (remaining === 1) {
    return 'Noch 1 Tag sichtbar'
  }
  return `Noch ${remaining} Tage sichtbar`
}
