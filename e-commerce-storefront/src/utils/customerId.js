export function getOrCreateCustomerId(orderId) {
  const key = `northstar_customer_ref_${orderId}`
  const existing = sessionStorage.getItem(key)
  if (existing) return existing

  const generated = `CUS-${Math.floor(100000 + Math.random() * 900000)}`
  sessionStorage.setItem(key, generated)
  return generated
}
