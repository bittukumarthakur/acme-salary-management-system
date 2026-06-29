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
