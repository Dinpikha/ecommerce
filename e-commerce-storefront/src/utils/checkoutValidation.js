const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const trim = (value) => (typeof value === 'string' ? value.trim() : '')

export function validateCheckoutField(name, value) {
  const cleaned = trim(value)

  switch (name) {
    case 'customer_name':
      if (!cleaned) return 'Full name is required.'
      if (cleaned.length < 2) return 'Enter a valid full name.'
      return ''
    case 'email':
      if (!cleaned) return 'Email is required.'
      if (!EMAIL_RE.test(cleaned)) return 'Enter a valid email address.'
      return ''
    case 'phone':
      if (!cleaned) return 'Phone number is required.'
      if (cleaned.length < 7) return 'Enter a valid phone number.'
      return ''
    case 'address_line':
      if (!cleaned) return 'Address is required.'
      return ''
    case 'city':
      if (!cleaned) return 'City is required.'
      return ''
    case 'state':
      if (!cleaned) return 'State is required.'
      return ''
    case 'pincode':
      if (!cleaned) return 'Postal code is required.'
      if (!/^[a-zA-Z0-9\s-]{3,12}$/.test(cleaned)) return 'Enter a valid postal code.'
      return ''
    default:
      return ''
  }
}

export function validateCheckoutForm(form) {
  const fields = ['customer_name', 'email', 'phone', 'address_line', 'city', 'state', 'pincode']
  return fields.reduce((errors, field) => {
    const message = validateCheckoutField(field, form[field])
    if (message) errors[field] = message
    return errors
  }, {})
}

export function isCheckoutFormValid(errors) {
  return Object.keys(errors).length === 0
}

export function trimCheckoutForm(form) {
  return {
    customer_name: trim(form.customer_name),
    email: trim(form.email),
    phone: trim(form.phone),
    address_line: trim(form.address_line),
    city: trim(form.city),
    state: trim(form.state),
    pincode: trim(form.pincode),
    payment_method: form.payment_method,
  }
}
