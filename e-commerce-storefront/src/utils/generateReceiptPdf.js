import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatAddress, formatDate, formatPaymentMethod, money } from './format'

const STORE_NAME = 'northstar'

function paymentStatusLabel(order) {
  if (order.payment_status === 'PAID') return 'Paid'
  if (order.order_status === 'CONFIRMED') return 'Order Placed'
  return order.payment_status || order.order_status || 'Order Placed'
}

export function generateOrderReceiptPdf({ order, email, customerId }) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 18
  let y = 22

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text(STORE_NAME, margin, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(90)
  doc.text('Official Order Receipt', margin, y + 7)

  doc.setTextColor(0)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(`Order ID: #${order.id}`, pageWidth - margin, y, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.text(`Customer ID: ${customerId}`, pageWidth - margin, y + 6, { align: 'right' })
  doc.text(`Date: ${formatDate(order.created_at)}`, pageWidth - margin, y + 12, { align: 'right' })
  doc.text(`Reference: ${order.transaction_ref}`, pageWidth - margin, y + 18, { align: 'right' })

  y += 32
  doc.setDrawColor(220)
  doc.line(margin, y, pageWidth - margin, y)
  y += 12

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Customer Details', margin, y)
  y += 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  const customerLines = [
    order.customer_name,
    email,
    order.phone,
    formatAddress(order),
  ].filter(Boolean)

  customerLines.forEach((line) => {
    doc.text(line, margin, y)
    y += 6
  })

  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Payment', margin, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.text(`Method: ${formatPaymentMethod(order.payment_method)}`, margin, y)
  y += 6
  doc.text(`Status: ${paymentStatusLabel(order)}`, margin, y)
  y += 10

  autoTable(doc, {
    startY: y,
    head: [['Product', 'Qty', 'Unit Price', 'Line Total']],
    body: (order.items || []).map((item) => [
      item.variant_color ? `${item.product_name} (${item.variant_color})` : item.product_name,
      String(item.quantity),
      money(item.unit_price),
      money(item.line_total),
    ]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [30, 30, 40], textColor: 255 },
    theme: 'striped',
    margin: { left: margin, right: margin },
  })

  y = doc.lastAutoTable.finalY + 10
  const totalsX = pageWidth - margin - 55

  doc.setFontSize(10)
  doc.text('Subtotal:', totalsX, y)
  doc.text(money(order.subtotal), pageWidth - margin, y, { align: 'right' })
  y += 6
  doc.text('Tax:', totalsX, y)
  doc.text(money(order.tax), pageWidth - margin, y, { align: 'right' })
  y += 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Total:', totalsX, y)
  doc.text(money(order.total), pageWidth - margin, y, { align: 'right' })

  y += 18
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(90)
  doc.text('Thank you for shopping with northstar.', margin, y)
  doc.text('We appreciate your business.', margin, y + 6)

  doc.save(`northstar-receipt-${order.id}.pdf`)
}
