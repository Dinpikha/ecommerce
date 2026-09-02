export function formatApiError(error, fallback = 'Something went wrong. Please try again.') {
  const status = error?.response?.status
  const detail = error?.response?.data?.detail

  if (typeof detail === 'string' && detail.trim()) {
    return detail
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === 'string') return item
        if (item?.msg) return item.msg
        return null
      })
      .filter(Boolean)
    if (messages.length) return messages.join(' ')
  }

  if (status === 400) return 'Please review your cart and checkout details, then try again.'
  if (status === 401) return 'Please sign in to complete your order.'
  if (status === 404) return 'We could not find the requested resource.'
  if (status >= 500) return 'Our server had trouble processing your request. Please try again shortly.'

  if (error?.message && !error.message.includes('Network Error')) {
    return error.message
  }

  return fallback
}
