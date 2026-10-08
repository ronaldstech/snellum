import { loadStripe } from '@stripe/stripe-js';

// Default to test publishable key if not provided in environment
const STRIPE_PK =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51PTestKeySnellumDemoPublishableKey0019283838X';

let stripePromise = null;

export const stripeService = {
  /**
   * Lazily loads and returns the Stripe instance
   */
  async getStripe() {
    if (!stripePromise) {
      try {
        stripePromise = loadStripe(STRIPE_PK);
      } catch (err) {
        console.warn('Stripe initialization note:', err);
      }
    }
    return stripePromise;
  },

  /**
   * Check if Payment Request API (Apple Pay / Google Pay) is available
   */
  async checkPaymentRequestSupport({ amountCents, label, currency = 'usd' }) {
    try {
      const stripe = await this.getStripe();
      if (!stripe) return null;

      const paymentRequest = stripe.paymentRequest({
        country: 'US',
        currency: currency.toLowerCase(),
        total: {
          label: label || 'Snellum VIP Web Purchase',
          amount: amountCents,
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      const result = await paymentRequest.canMakePayment();
      if (result) {
        return {
          paymentRequest,
          applePay: result.applePay || false,
          googlePay: result.googlePay || false,
        };
      }
      return null;
    } catch (err) {
      console.warn('Payment Request check error:', err);
      return null;
    }
  },

  /**
   * Format currency values
   */
  formatUSD(cents) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  },

  /**
   * Get direct web discount information
   */
  getWebDiscountDetails(itemType, itemPriceUSD) {
    const appStoreFeeCut = 0.30; // 30% App store cut
    const appStorePrice = itemPriceUSD / (1 - appStoreFeeCut);
    const savings = appStorePrice - itemPriceUSD;

    return {
      webPrice: itemPriceUSD,
      appStorePrice: Math.round(appStorePrice * 100) / 100,
      savingsAmount: Math.round(savings * 100) / 100,
      savingsPercent: '30%',
    };
  },

  /**
   * Process a card or web checkout payment
   */
  async processDirectWebPayment({
    amountCents,
    currency = 'usd',
    planOrPackageId,
    description,
    paymentMethodType = 'card', // 'card' | 'apple_pay' | 'google_pay'
    cardDetails = null,
  }) {
    // Artificial latency for realistic transaction UX
    await new Promise((resolve) => setTimeout(resolve, 1400));

    // Simulated Stripe Tokenization / Payment Intent confirmation
    const transactionId = `ch_snellum_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return {
      success: true,
      transactionId,
      amount: amountCents,
      currency,
      timestamp: new Date().toISOString(),
      receiptUrl: `https://snellum.web.app/receipts/${transactionId}`,
      directWebBypass: true,
      storeFeeSaved: Math.round(amountCents * 0.30),
    };
  },
};
