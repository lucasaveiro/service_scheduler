import { loadStripe } from '@stripe/stripe-js'

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY

if (!stripePublicKey) {
  throw new Error('Missing Stripe public key')
}

export const stripe = await loadStripe(stripePublicKey)

export const createPaymentIntent = async (amount, currency = 'usd') => {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to cents
        currency
      })
    })

    const { client_secret } = await response.json()
    return client_secret
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error
  }
}

export const confirmPayment = async (clientSecret, paymentMethod) => {
  const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
    payment_method: paymentMethod
  })

  if (error) {
    throw error
  }

  return paymentIntent
}