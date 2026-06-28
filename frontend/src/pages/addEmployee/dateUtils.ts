import dayjs, { type Dayjs } from 'dayjs'

export function toPickerValue(value: string): Dayjs | null {
  if (!value) {
    return null
  }

  const parsed = dayjs(value)
  return parsed.isValid() ? parsed : null
}
