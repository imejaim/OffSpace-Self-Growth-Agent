'use client'

import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import type { ReactNode } from 'react'

interface PayPalProviderProps {
  children: ReactNode
}

export default function PayPalProvider({ children }: PayPalProviderProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

  if (!clientId) {
    console.error('NEXT_PUBLIC_PAYPAL_CLIENT_ID is not set')
    return <>{children}</>
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: 'USD',
        intent: 'subscription',
        vault: true,
      }}
    >
      {children}
    </PayPalScriptProvider>
  )
}
