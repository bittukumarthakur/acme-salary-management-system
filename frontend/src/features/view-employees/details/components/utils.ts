import dayjs from 'dayjs'

export function getDisplayValue(value: string | null | undefined): string {
  if (!value || value.trim().length === 0) {
    return 'Not available'
  }

  return value
}

export function getInitials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((namePart) => namePart[0]?.toUpperCase() ?? '')
    .join('')
}

/**
 * Formats an ISO date string to "DD MMM YYYY" format.
 * Example: "2024-01-01" becomes "01 Jan 2024"
 */
export function formatHistoryDate(dateString: string): string {
  if (!dateString) {
    return dateString
  }
  try {
    const formatted = dayjs(dateString).format('DD MMM YYYY')
    // Check if dayjs returned "Invalid Date" (which happens with invalid input)
    if (formatted === 'Invalid Date') {
      return dateString
    }
    return formatted
  } catch {
    return dateString
  }
}
