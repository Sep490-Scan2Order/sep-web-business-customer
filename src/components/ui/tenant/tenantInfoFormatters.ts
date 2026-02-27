export const formatOptional = (value: string | null | undefined, fallback = '—') => {
  if (value === null || value === undefined || value === '') {
    return fallback
  }
  return value
}

export const formatNumber = (value: number | null | undefined, fallback = '—') => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return fallback
  }
  return new Intl.NumberFormat('en-US').format(value)
}

export const formatMoney = (value: number | null | undefined, fallback = '—') => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return fallback
  }
  return `${new Intl.NumberFormat('en-US').format(value)} VND`
}

export const formatDate = (value: string | null | undefined, fallback = '—') => {
  if (!value) {
    return fallback
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return fallback
  }
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export const formatBoolean = (value: boolean | null | undefined, fallback = '—') => {
  if (value === null || value === undefined) {
    return fallback
  }
  return value ? 'Yes' : 'No'
}

export const maskId = (value: string | null | undefined, fallback = '—') => {
  if (!value) {
    return fallback
  }
  const parts = value.split('-')
  if (parts.length <= 1) {
    return value
  }
  const lastPart = parts[parts.length - 1]
  const maskedParts = parts.slice(0, -1).map((part) => '*'.repeat(part.length))
  return [...maskedParts, lastPart].join('-')
}
