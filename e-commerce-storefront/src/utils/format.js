export const money = (value) => `$${Number(value || 0).toFixed(2)}`

export const formatDate = (value) => {
  if (!value) return ''
  return new Date(value).toLocaleString()
}

const PAYMENT_LABELS = {
  CARD: 'Card',
  UPI: 'UPI',
  NETBANKING: 'Net Banking',
  WALLET: 'Wallet',
}

export const formatPaymentMethod = (value) => PAYMENT_LABELS[value] || value

export const formatAddress = (order) =>
  [order.address_line, order.city, order.state, order.pincode].filter(Boolean).join(', ')

export const stockStatus = (stock) => {
  if (stock === 0) {
    return { label: 'Out of stock', tone: 'text-destructive' }
  }
  if (stock <= 5) {
    return { label: `Only ${stock} left`, tone: 'text-coral' }
  }
  return { label: 'In stock', tone: 'text-muted-foreground' }
}
