import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  ShieldCheck,
  Lock,
  Zap,
  Crown,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { stripeService } from '../../services/stripeService';
import { paymentService } from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';
import '../../styles/stripeCheckout.css';

export default function StripeCheckoutModal({
  isOpen,
  onClose,
  itemType = 'subscription', // 'subscription' | 'sparks' | 'event'
  itemData,
  billingCycle = 'monthly',
}) {
  const { user, userProfile, showToast } = useAuth();

  // Payment method selection: 'apple_pay' | 'google_pay' | 'card'
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentRequestSupport, setPaymentRequestSupport] = useState(null);

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardholderName, setCardholderName] = useState(
    userProfile?.displayName || userProfile?.firstName || 'Valued Member'
  );
  const [postalCode, setPostalCode] = useState('265');

  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [cardBrand, setCardBrand] = useState('generic'); // 'visa' | 'mastercard' | 'amex' | 'generic'

  // Pricing calculations
  const isSub = itemType === 'subscription';
  const isSparks = itemType === 'sparks';
  const isEvent = itemType === 'event';

  let itemName = 'Snellum Upgrade';
  let priceUSD = '$9.99';
  let appStorePriceUSD = '$14.99';
  let amountCents = 999;
  let mwkPrice = 'MK 15,000';

  if (isSub && itemData) {
    itemName = `${itemData.name} (${billingCycle === 'monthly' ? 'Monthly' : 'Weekly'})`;
    priceUSD = billingCycle === 'monthly' ? itemData.usdMonthlyPrice : itemData.usdWeeklyPrice;
    amountCents = billingCycle === 'monthly' ? itemData.monthlyCents : itemData.weeklyCents;
    appStorePriceUSD = itemData.appStoreMonthlyPrice || '$14.99';
    mwkPrice = billingCycle === 'monthly' ? itemData.monthlyPrice : itemData.weeklyPrice;
  } else if (isSparks && itemData) {
    itemName = `${itemData.sparks} Sparks Credits`;
    priceUSD = itemData.usdPrice;
    amountCents = itemData.cents;
    appStorePriceUSD = itemData.appStoreUsdPrice || '$9.99';
    mwkPrice = itemData.price;
  } else if (isEvent && itemData) {
    itemName = `Ticket: ${itemData.title}`;
    priceUSD = '$9.99';
    amountCents = itemData.cents || 999;
    appStorePriceUSD = '$14.99';
    mwkPrice = itemData.price;
  }

  // Check Payment Request API (Apple Pay / Google Pay)
  useEffect(() => {
    if (!isOpen) {
      setPaymentSuccess(false);
      setProcessing(false);
      return;
    }

    let isMounted = true;
    stripeService
      .checkPaymentRequestSupport({ amountCents, label: itemName })
      .then((support) => {
        if (isMounted && support) {
          setPaymentRequestSupport(support);
          if (support.applePay) {
            setPaymentMethod('apple_pay');
          } else if (support.googlePay) {
            setPaymentMethod('google_pay');
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [isOpen, amountCents, itemName]);

  if (!isOpen) return null;

  // Detect card brand
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
    if (val.startsWith('4')) setCardBrand('visa');
    else if (/^(5[1-5]|2[2-7])/.test(val)) setCardBrand('mastercard');
    else if (/^3[47]/.test(val)) setCardBrand('amex');
    else setCardBrand('generic');

    // Format with spaces
    const parts = val.match(/[\s\S]{1,4}/g) || [];
    setCardNumber(parts.join(' '));
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 3) {
      val = val.substring(0, 2) + '/' + val.substring(2);
    }
    setCardExpiry(val);
  };

  const handleCvcChange = (e) => {
    setCardCvc(e.target.value.replace(/\D/g, '').substring(0, 4));
  };

  const handleExecutePayment = async (methodType = paymentMethod) => {
    setProcessing(true);
    try {
      const result = await stripeService.processDirectWebPayment({
        amountCents,
        currency: 'usd',
        planOrPackageId: itemData?.id,
        description: itemName,
        paymentMethodType: methodType,
      });

      // Update state in Firestore / context
      if (user?.uid) {
        if (isSub && itemData?.id) {
          await paymentService.activateSubscription(user.uid, itemData.id, billingCycle);
        } else if (isSparks && itemData?.sparks) {
          await paymentService.addSparksToAccount(user.uid, itemData.sparks);
        }
      }

      setTransactionDetails(result);
      setPaymentSuccess(true);

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF4D85', '#FF85A1', '#F59E0B', '#10B981'],
        });
      } catch {}

      showToast(`Payment processed successfully via Stripe!`, 'success');
    } catch (err) {
      showToast('Payment processing failed. Please try again.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="modal-backdrop-fixed animate-fade-in" onClick={onClose}>
      <div className="stripe-checkout-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="stripe-header">
          <div className="stripe-brand-badge">
            <span className="stripe-logo-text">stripe</span>
            <span className="direct-web-tag">Direct Web Checkout</span>
          </div>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close Checkout">
            <X size={18} />
          </button>
        </div>

        {paymentSuccess ? (
          /* Success Receipt View */
          <div className="checkout-success-view animate-fade-in">
            <div className="success-icon-wrap">
              <CheckCircle2 size={48} color="#10B981" />
            </div>
            <h3>Payment Confirmed!</h3>
            <p className="success-desc">
              Your direct web payment was securely authorized via Stripe. You saved 30% by paying
              directly on the web!
            </p>

            <div className="receipt-summary-card">
              <div className="receipt-row">
                <span>Item</span>
                <strong>{itemName}</strong>
              </div>
              <div className="receipt-row">
                <span>Amount Paid</span>
                <strong className="receipt-total">{priceUSD} ({mwkPrice})</strong>
              </div>
              <div className="receipt-row">
                <span>App Store Markup Saved</span>
                <span className="savings-green">Bypassed 30% App Store cut</span>
              </div>
              <div className="receipt-row">
                <span>Transaction Ref</span>
                <span className="mono-ref">{transactionDetails?.transactionId}</span>
              </div>
            </div>

            <button
              type="button"
              className="btn-primary w-full"
              onClick={onClose}
            >
              Enjoy Your Sparks & VIP Perks!
            </button>
          </div>
        ) : (
          /* Checkout View */
          <div className="checkout-form-view">
            {/* Direct Web Bypass Banner */}
            <div className="web-bypass-banner">
              <div className="bypass-tag">
                <Sparkles size={14} color="#F59E0B" />
                <span>30% Web Exclusive Savings</span>
              </div>
              <p>
                Bypassing Apple App Store & Google Play in-app fees gives you direct access at lowest prices + instant bonus Sparks!
              </p>
            </div>

            {/* Item Summary Bar */}
            <div className="checkout-item-bar">
              <div className="item-icon-col">
                {isSub ? <Crown size={22} color="#F59E0B" /> : <Zap size={22} color="#F59E0B" />}
              </div>
              <div className="item-details-col">
                <h4>{itemName}</h4>
                <span>Direct Web Price (vs {appStorePriceUSD} in app stores)</span>
              </div>
              <div className="item-price-col">
                <strong>{priceUSD}</strong>
                <small>{mwkPrice}</small>
              </div>
            </div>

            {/* Apple Pay / Google Pay One-Tap Buttons */}
            <div className="quick-pay-section">
              <div className="quick-pay-buttons">
                <button
                  type="button"
                  className="btn-apple-pay"
                  disabled={processing}
                  onClick={() => handleExecutePayment('apple_pay')}
                >
                  <span>Pay with</span>
                  <strong> Pay</strong>
                </button>
                <button
                  type="button"
                  className="btn-google-pay"
                  disabled={processing}
                  onClick={() => handleExecutePayment('google_pay')}
                >
                  <span>Pay with</span>
                  <span className="gpay-text">
                    <span style={{ color: '#4285F4' }}>G</span>
                    <span style={{ color: '#EA4335' }}>o</span>
                    <span style={{ color: '#FBBC05' }}>o</span>
                    <span style={{ color: '#4285F4' }}>g</span>
                    <span style={{ color: '#34A853' }}>l</span>
                    <span style={{ color: '#EA4335' }}>e</span> Pay
                  </span>
                </button>
              </div>
              <div className="or-divider">
                <span>or pay with card</span>
              </div>
            </div>

            {/* Credit / Debit Card Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExecutePayment('card');
              }}
              className="card-input-form"
            >
              <div className="form-group">
                <label>Cardholder Name</label>
                <input
                  type="text"
                  required
                  placeholder="Full name on card"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="checkout-input"
                />
              </div>

              <div className="form-group">
                <label>Card Number</label>
                <div className="card-input-wrap">
                  <input
                    type="text"
                    required
                    placeholder="4242 •••• •••• 4242"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="checkout-input"
                  />
                  <div className="card-brand-indicator">
                    {cardBrand === 'visa' && <span className="brand-chip visa">VISA</span>}
                    {cardBrand === 'mastercard' && <span className="brand-chip mc">MC</span>}
                    {cardBrand === 'amex' && <span className="brand-chip amex">AMEX</span>}
                    {cardBrand === 'generic' && <CreditCard size={18} color="var(--text-muted)" />}
                  </div>
                </div>
              </div>

              <div className="form-row-split">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    required
                    placeholder="MM / YY"
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    className="checkout-input"
                  />
                </div>
                <div className="form-group">
                  <label>CVC / CVV</label>
                  <input
                    type="password"
                    required
                    placeholder="123"
                    value={cardCvc}
                    onChange={handleCvcChange}
                    className="checkout-input"
                  />
                </div>
                <div className="form-group">
                  <label>Postal Code</label>
                  <input
                    type="text"
                    placeholder="ZIP"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="checkout-input"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-stripe-pay"
                disabled={processing}
              >
                {processing ? (
                  <span>Securing Payment with Stripe...</span>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>Pay {priceUSD} ({mwkPrice}) via Stripe</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Trust & Guarantee footer */}
            <div className="stripe-trust-footer">
              <div className="trust-item">
                <ShieldCheck size={14} color="#10B981" />
                <span>256-bit Stripe SSL Encrypted</span>
              </div>
              <div className="trust-item">
                <Zap size={14} color="#F59E0B" />
                <span>Instant Sparks & Access</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
