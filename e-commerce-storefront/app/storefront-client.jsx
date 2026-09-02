'use client'

import dynamic from 'next/dynamic'
import { BrowserRouter } from 'react-router-dom'

const Storefront = dynamic(() => import('../src/App'), { ssr: false })

export default function StorefrontClient() {
  return (
    <BrowserRouter>
      <Storefront />
    </BrowserRouter>
  )
}