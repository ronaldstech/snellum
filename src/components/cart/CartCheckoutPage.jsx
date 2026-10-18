import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Lock,
  CheckCircle2,
  Crown,
  Zap,
  Sparkles,
  ShoppingBag,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { paymentService } from '../../services/paymentService';
import '../../styles/cart.css';

export default function CartCheckoutPage({ item, onBack, onSuccess }) {
  const { user, userProfile, showToast, setUserProfile } = useAuth();

  // If no item is passed (e.g. direct nav), fallback to default popular plan
  const activeItem = useMemo(() => {
    if (item?.itemData) return item;
    const defaultPlan = paymentService.getSubscriptionPlans().find((p) => p.popular) || paymentService.getSubscriptionPlans()[1];
    return {
      itemType: 'subscription',
      itemData: defaultPlan,
      billingCycle: 'monthly',
    };
  }, [item]);

  const isSubscription = activeItem.itemType === 'subscription';
  const planOrPkg = activeItem.itemData;
  const billingCycle = activeItem.billingCycle || 'monthly';

  // 1. Billing Address State
  const [billingAddress, setBillingAddress] = useState({
    fullName: userProfile?.displayName || userProfile?.firstName || user?.displayName || '',
    email: user?.email || userProfile?.email || '',
    streetAddress: '',
    city: 'Blantyre',
    country: 'Malawi',
    postalCode: '',
    phone: userProfile?.phoneNumber || '',
  });

  // 2. Payment Method State: 'card' | 'mobile_money' | 'apple_pay'
  const [paymentMethod, setPaymentMethod] = useState('card');

  // 3. Card Details
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: userProfile?.displayName || user?.displayName || '',
    expiry: '',
    cvc: '',
  });

  // 4. Mobile Money Details
  const [mobileMoneyDetails, setMobileMoneyDetails] = useState({
    operator: 'airtel_mw',
    phone: userProfile?.phoneNumber || '',
  });

  // 5. Checkout Status State
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState(null);

  // Price calculations
  const priceDisplay = useMemo(() => {
    if (isSubscription) {
      return billingCycle === 'monthly' ? planOrPkg.usdMonthlyPrice : planOrPkg.usdWeeklyPrice;
    }
    return planOrPkg.usdPrice;
  }, [isSubscription, planOrPkg, billingCycle]);

  const localPriceDisplay = useMemo(() => {
    if (isSubscription) {
      return billingCycle === 'monthly' ? planOrPkg.monthlyPrice : planOrPkg.weeklyPrice;
    }
    return planOrPkg.price;
  }, [isSubscription, planOrPkg, billingCycle]);

  const itemName = useMemo(() => {
    if (isSubscription) {
      return `${planOrPkg.name} (${billingCycle === 'monthly' ? 'Monthly' : 'Weekly'})`;
    }
    return `${planOrPkg.sparks} Sparks Credits`;
  }, [isSubscription, planOrPkg, billingCycle]);

  // Handle Form Inputs
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setBillingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardDetails((prev) => ({ ...prev, cardNumber: formatted }));
  };

  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setCardDetails((prev) => ({ ...prev, expiry: raw }));
  };

  const handleCvcChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardDetails((prev) => ({ ...prev, cvc: raw }));
  };

  // Execute Payment
  const handleCompletePayment = async (e) => {
    if (e) e.preventDefault();

    // Basic validation
    if (!billingAddress.fullName.trim()) {
      showToast('Please enter your full billing name', 'error');
      return;
    }
    if (!billingAddress.email.trim() || !billingAddress.email.includes('@')) {
      showToast('Please enter a valid email address for your receipt', 'error');
      return;
    }

    if (paymentMethod === 'card') {
      const cleanCard = cardDetails.cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 15) {
        showToast('Please enter a valid card number', 'error');
        return;
      }
      if (!cardDetails.expiry || cardDetails.expiry.length < 5) {
        showToast('Please enter card expiry (MM/YY)', 'error');
        return;
      }
      if (!cardDetails.cvc || cardDetails.cvc.length < 3) {
        showToast('Please enter card CVC code', 'error');
        return;
      }
    } else if (paymentMethod === 'mobile_money') {
      if (!mobileMoneyDetails.phone || mobileMoneyDetails.phone.length < 8) {
        showToast('Please enter your mobile money phone number', 'error');
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing latency
      await new Promise((res) => setTimeout(res, 1400));

      const uid = user?.uid;
      if (uid) {
        if (isSubscription) {
          await paymentService.activateSubscription(uid, planOrPkg.id, billingCycle);
          if (setUserProfile) {
            setUserProfile((prev) => (prev ? { ...prev, isPremium: true, subscriptionPlan: planOrPkg.id } : prev));
          }
        } else {
          await paymentService.addSparksToAccount(uid, planOrPkg.sparks);
          if (setUserProfile) {
            setUserProfile((prev) => {
              if (!prev) return prev;
              const current = Number(prev.sparks || 0);
              return { ...prev, sparks: current + planOrPkg.sparks, credits: current + planOrPkg.sparks };
            });
          }
        }
      }

      // Generate order receipt
      const receipt = {
        orderId: `SN-${Date.now().toString().slice(-7)}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        itemName,
        amount: priceDisplay,
        localAmount: localPriceDisplay,
        paymentMethod: paymentMethod === 'card' ? 'Credit / Debit Card' : paymentMethod === 'mobile_money' ? 'Mobile Money (Malawi)' : 'Apple / Google Pay',
        customerName: billingAddress.fullName,
      };

      setOrderReceipt(receipt);
      showToast('🎉 Payment authorized successfully! Welcome to Snellum VIP.', 'success');

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // ignore confetti errors
      }

      if (onSuccess) onSuccess(receipt);
    } catch (err) {
      console.error('Payment failure:', err);
      showToast('Could not authorize payment. Please check details and try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Render Order Confirmation View
  if (orderReceipt) {
    return (
      <div className="cart-page-container animate-fade-in">
        <div className="cart-success-view">
          <div className="cart-success-icon-wrap">
            <CheckCircle2 size={42} />
          </div>
          <h2>Payment Confirmed!</h2>
          <p>
            Your order has been completed and your VIP perks or Sparks have been credited to your account.
          </p>

          <div className="cart-receipt-card">
            <div className="cart-receipt-row">
              <span>Order Number:</span>
              <span className="mono-id">{orderReceipt.orderId}</span>
            </div>
            <div className="cart-receipt-row">
              <span>Item:</span>
              <strong>{orderReceipt.itemName}</strong>
            </div>
            <div className="cart-receipt-row">
              <span>Total Paid:</span>
              <strong>{orderReceipt.amount} ({orderReceipt.localAmount})</strong>
            </div>
            <div className="cart-receipt-row">
              <span>Payment Method:</span>
              <span>{orderReceipt.paymentMethod}</span>
            </div>
            <div className="cart-receipt-row">
              <span>Billed to:</span>
              <span>{orderReceipt.customerName}</span>
            </div>
          </div>

          <button
            type="button"
            className="btn-complete-payment"
            style={{ maxWidth: 360 }}
            onClick={onBack}
          >
            Return to Dashboard & Discover Matches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-container animate-fade-in">
      {/* Top Header & Navigation */}
      <div className="cart-top-nav">
        <button type="button" className="btn-cart-back" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>

        <div className="cart-security-badge">
          <ShieldCheck size={14} />
          <span>256-Bit SSL Encrypted Checkout</span>
        </div>
      </div>

      {/* Main Two-Column Checkout Grid */}
      <form onSubmit={handleCompletePayment} className="cart-grid-layout">
        {/* Left Column: Multi-Step Forms */}
        <div className="cart-forms-col">
          {/* STEP 1: Billing Address */}
          <div className="cart-section-card">
            <div className="cart-section-header">
              <span className="cart-section-step-num">1</span>
              <div>
                <h3>Billing Address</h3>
                <p>Provide your billing and contact details for the invoice receipt</p>
              </div>
            </div>

            <div className="cart-form-grid">
              <div className="cart-field-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="e.g. Kondwani Phiri"
                  value={billingAddress.fullName}
                  onChange={handleAddressChange}
                  className="cart-input"
                />
              </div>

              <div className="cart-field-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={billingAddress.email}
                  onChange={handleAddressChange}
                  className="cart-input"
                />
              </div>

              <div className="cart-field-group full-width">
                <label htmlFor="streetAddress">Street Address</label>
                <input
                  id="streetAddress"
                  name="streetAddress"
                  type="text"
                  placeholder="e.g. Victoria Avenue, Plot 14"
                  value={billingAddress.streetAddress}
                  onChange={handleAddressChange}
                  className="cart-input"
                />
              </div>

              <div className="cart-field-group">
                <label htmlFor="city">City / District</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  placeholder="Blantyre, Lilongwe, etc."
                  value={billingAddress.city}
                  onChange={handleAddressChange}
                  className="cart-input"
                />
              </div>

              <div className="cart-field-group">
                <label htmlFor="country">Country</label>
                <select
                  id="country"
                  name="country"
                  value={billingAddress.country}
                  onChange={handleAddressChange}
                  className="cart-select"
                >
                  <option value="Malawi">🇲🇼 Malawi</option>
                  <option value="Zambia">🇿🇲 Zambia</option>
                  <option value="South Africa">🇿🇦 South Africa</option>
                  <option value="Kenya">🇰🇪 Kenya</option>
                  <option value="United States">🇺🇸 United States</option>
                  <option value="United Kingdom">🇬🇧 United Kingdom</option>
                  <option value="Other">🌍 Other / International</option>
                </select>
              </div>

              <div className="cart-field-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="e.g. +265 99 123 4567"
                  value={billingAddress.phone}
                  onChange={handleAddressChange}
                  className="cart-input"
                />
              </div>

              <div className="cart-field-group">
                <label htmlFor="postalCode">Postal Code (Optional)</label>
                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  placeholder="Optional"
                  value={billingAddress.postalCode}
                  onChange={handleAddressChange}
                  className="cart-input"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: Choose Payment Method */}
          <div className="cart-section-card">
            <div className="cart-section-header">
              <span className="cart-section-step-num">2</span>
              <div>
                <h3>Payment Method</h3>
                <p>Select your preferred secure payment gateway</p>
              </div>
            </div>

            <div className="payment-methods-grid">
              <div
                className={`payment-method-card ${paymentMethod === 'card' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="payment-method-icon">
                  <CreditCard size={18} />
                </div>
                <span className="payment-method-name">Card Payment</span>
                <span className="payment-method-sub">Visa · Mastercard</span>
              </div>

              <div
                className={`payment-method-card ${paymentMethod === 'mobile_money' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('mobile_money')}
              >
                <div className="payment-method-icon">
                  <Smartphone size={18} />
                </div>
                <span className="payment-method-name">Mobile Money</span>
                <span className="payment-method-sub">Airtel · TNM Mpamba</span>
              </div>

              <div
                className={`payment-method-card ${paymentMethod === 'apple_pay' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('apple_pay')}
              >
                <div className="payment-method-icon">
                  <Lock size={18} />
                </div>
                <span className="payment-method-name">Digital Wallet</span>
                <span className="payment-method-sub">Apple & Google Pay</span>
              </div>
            </div>

            {/* STEP 3: Fill Payment Details Where Applicable */}
            {paymentMethod === 'card' && (
              <div className="card-details-box animate-fade-in">
                <div className="cart-field-group full-width">
                  <label htmlFor="cardNumber">Card Number</label>
                  <div className="cart-input-wrap">
                    <CreditCard size={18} className="cart-input-icon" />
                    <input
                      id="cardNumber"
                      type="text"
                      placeholder="4000 1234 5678 9010"
                      value={cardDetails.cardNumber}
                      onChange={handleCardNumberChange}
                      className="cart-input with-icon"
                      required
                    />
                  </div>
                </div>

                <div className="cart-form-grid">
                  <div className="cart-field-group">
                    <label htmlFor="cardHolder">Cardholder Name</label>
                    <input
                      id="cardHolder"
                      type="text"
                      placeholder="Name on card"
                      value={cardDetails.cardHolder}
                      onChange={(e) => setCardDetails((prev) => ({ ...prev, cardHolder: e.target.value }))}
                      className="cart-input"
                      required
                    />
                  </div>

                  <div className="cart-field-group">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <label htmlFor="expiry">Expiry</label>
                        <input
                          id="expiry"
                          type="text"
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={handleExpiryChange}
                          className="cart-input"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="cvc">CVC</label>
                        <input
                          id="cvc"
                          type="password"
                          placeholder="123"
                          value={cardDetails.cvc}
                          onChange={handleCvcChange}
                          className="cart-input"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'mobile_money' && (
              <div className="mm-details-box animate-fade-in">
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' }}>
                  Select Mobile Operator (Malawi)
                </label>
                <div className="operator-toggle-row">
                  <button
                    type="button"
                    className={`operator-radio-btn ${mobileMoneyDetails.operator === 'airtel_mw' ? 'active' : ''}`}
                    onClick={() => setMobileMoneyDetails((prev) => ({ ...prev, operator: 'airtel_mw' }))}
                  >
                    📱 Airtel Money
                  </button>
                  <button
                    type="button"
                    className={`operator-radio-btn ${mobileMoneyDetails.operator === 'tnm_mpamba' ? 'active' : ''}`}
                    onClick={() => setMobileMoneyDetails((prev) => ({ ...prev, operator: 'tnm_mpamba' }))}
                  >
                    🇲🇼 TNM Mpamba
                  </button>
                </div>

                <div className="cart-field-group">
                  <label htmlFor="mmPhone">Mobile Money Phone Number</label>
                  <input
                    id="mmPhone"
                    type="tel"
                    placeholder="e.g. 0991234567 or 0881234567"
                    value={mobileMoneyDetails.phone}
                    onChange={(e) => setMobileMoneyDetails((prev) => ({ ...prev, phone: e.target.value }))}
                    className="cart-input"
                    required
                  />
                </div>

                <div className="mm-instruction-text">
                  <Info size={16} color="#F59E0B" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>
                    When you click Pay Now, you will receive an automatic PIN prompt on your phone to authorize this payment.
                  </span>
                </div>
              </div>
            )}

            {paymentMethod === 'apple_pay' && (
              <div className="wallet-details-box animate-fade-in">
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                  Pay in a single tap with your device's Touch ID / Face ID.
                </p>
                <button
                  type="button"
                  className="btn-wallet-express"
                  disabled={isProcessing}
                  onClick={handleCompletePayment}
                >
                  <Lock size={16} /> Pay with Apple Pay / GPay ({priceDisplay})
                </button>
              </div>
            )}

            {/* Complete Payment Button */}
            {paymentMethod !== 'apple_pay' && (
              <button
                type="submit"
                className="btn-complete-payment"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span>Authorizing Payment…</span>
                ) : (
                  <>
                    <Lock size={16} /> Pay Now {priceDisplay} ({localPriceDisplay})
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Order Summary */}
        <aside className="cart-summary-col">
          <div className="cart-summary-card">
            <h3 className="cart-summary-title">
              <ShoppingBag size={18} color="var(--primary)" />
              Order Summary
            </h3>

            {/* Item Hero */}
            <div className="cart-item-hero">
              <div className={`cart-item-icon-box ${isSubscription ? 'vip' : 'sparks'}`}>
                {isSubscription ? <Crown size={22} /> : <Zap size={22} />}
              </div>
              <div className="cart-item-meta">
                <h4>{itemName}</h4>
                <span>{isSubscription ? 'VIP Membership Tier' : 'Sparks Boost Pack'}</span>
              </div>
              <div className="cart-item-price-tag">{priceDisplay}</div>
            </div>

            {/* Features List */}
            {isSubscription && planOrPkg.features && (
              <ul className="cart-perks-list">
                {planOrPkg.features.map((feat, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={14} color="#10B981" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Price Calculations */}
            <div className="cart-calc-table">
              <div className="cart-calc-row">
                <span>Subtotal</span>
                <span>{priceDisplay}</span>
              </div>
              <div className="cart-calc-row">
                <span>Local Equivalent</span>
                <span>{localPriceDisplay}</span>
              </div>
              <div className="cart-calc-row">
                <span>Tax / VAT</span>
                <span>Included ($0.00)</span>
              </div>
              <div className="cart-calc-row total-row">
                <span>Total Due</span>
                <span className="total-amount">{priceDisplay}</span>
              </div>
            </div>

            {/* Trust Points */}
            <div className="cart-trust-points">
              <div className="cart-trust-point">
                <CheckCircle2 size={13} color="#10B981" />
                <span>Instant account activation upon payment</span>
              </div>
              <div className="cart-trust-point">
                <CheckCircle2 size={13} color="#10B981" />
                <span>Encrypted 256-bit bank-grade authorization</span>
              </div>
              {isSubscription && (
                <div className="cart-trust-point">
                  <CheckCircle2 size={13} color="#10B981" />
                  <span>Cancel subscription anytime with one click</span>
                </div>
              )}
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
