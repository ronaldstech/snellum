import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Crown,
  ShieldCheck,
  X,
  CreditCard,
  Smartphone,
  ChevronRight,
  ArrowRight,
  Gift,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { paymentService } from '../../services/paymentService';
import StripeCheckoutModal from './StripeCheckoutModal';
import ShareModal from '../common/ShareModal';
import { shareService } from '../../services/shareService';
import '../../styles/premium.css';

export default function PremiumStoreModal({ isOpen, onClose }) {
  const { user, userProfile, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('subscriptions'); // 'subscriptions' | 'sparks' | 'referrals'
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'weekly' | 'monthly'
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [paymentMode, setPaymentMode] = useState('stripe'); // 'stripe' | 'mobile_money'
  const [selectedOperator, setSelectedOperator] = useState('airtel_mw');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);

  // Stripe Checkout Modal state
  const [stripeModalConfig, setStripeModalConfig] = useState({
    isOpen: false,
    itemType: 'subscription',
    itemData: null,
    billingCycle: 'monthly',
  });

  // Share / Referral Modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);

  if (!isOpen) return null;

  const subscriptionPlans = paymentService.getSubscriptionPlans();
  const sparkPackages = paymentService.getSparkPackages();
  const operators = paymentService.getMobileOperators();
  const userReferralCode = shareService.getUserReferralCode(user);
  const referralLink = shareService.getReferralLink(user);

  const handleOpenStripeSub = (plan) => {
    setStripeModalConfig({
      isOpen: true,
      itemType: 'subscription',
      itemData: plan,
      billingCycle,
    });
  };

  const handleOpenStripeSparks = (pkg) => {
    setStripeModalConfig({
      isOpen: true,
      itemType: 'sparks',
      itemData: pkg,
      billingCycle: 'one_time',
    });
  };

  const handleMobileMoneyPurchase = async () => {
    if (!phoneNumber) {
      showToast('Please enter your mobile phone number', 'error');
      return;
    }
    setProcessing(true);
    try {
      await new Promise((res) => setTimeout(res, 1200));
      if (activeTab === 'subscriptions') {
        if (user?.uid) {
          await paymentService.activateSubscription(user.uid, selectedPlan, billingCycle);
        }
        showToast('🎉 Mobile money prompt sent! Subscription activated.', 'success');
      } else {
        const pkg = sparkPackages[1];
        if (user?.uid) {
          await paymentService.addSparksToAccount(user.uid, pkg.sparks);
        }
        showToast(`⚡ Added ${pkg.sparks} Sparks to your account!`, 'success');
      }
      onClose();
    } catch (err) {
      showToast('Mobile money processing error', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop-fixed animate-fade-in" onClick={onClose}>
        <div className="premium-modal-card" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="premium-modal-header">
            <div className="premium-title-group">
              <Crown size={24} color="#F59E0B" />
              <div>
                <h3>Snellum VIP & Sparks Store</h3>
                <span>Direct Web Rates: Save 30% vs App Store & Google Play</span>
              </div>
            </div>
            <button type="button" className="btn-icon" onClick={onClose} aria-label="Close Store">
              <X size={20} />
            </button>
          </div>

          {/* Web Direct Rate Promotion Badge */}
          <div className="web-rate-guarantee-pill">
            <Sparkles size={14} color="#10B981" />
            <span>0% App Store markup applied on web checkout. Direct Stripe & Card savings.</span>
          </div>

          {/* Store Tabs */}
          <div className="store-tabs-nav">
            <button
              type="button"
              className={`store-tab ${activeTab === 'subscriptions' ? 'active' : ''}`}
              onClick={() => setActiveTab('subscriptions')}
            >
              <Crown size={15} /> VIP Memberships
            </button>
            <button
              type="button"
              className={`store-tab ${activeTab === 'sparks' ? 'active' : ''}`}
              onClick={() => setActiveTab('sparks')}
            >
              <Zap size={15} /> Sparks Credits
            </button>
            <button
              type="button"
              className={`store-tab ${activeTab === 'referrals' ? 'active' : ''}`}
              onClick={() => setActiveTab('referrals')}
            >
              <Gift size={15} /> Earn Free Sparks
            </button>
          </div>

          {/* Payment Method Switcher (Stripe Direct vs Mobile Money) */}
          <div className="payment-gateway-toggle">
            <span className="gateway-label">Payment Method:</span>
            <div className="gateway-options">
              <button
                type="button"
                className={`gateway-btn ${paymentMode === 'stripe' ? 'active' : ''}`}
                onClick={() => setPaymentMode('stripe')}
              >
                <CreditCard size={14} /> Stripe (Cards & Apple/Google Pay)
              </button>
              <button
                type="button"
                className={`gateway-btn ${paymentMode === 'mobile_money' ? 'active' : ''}`}
                onClick={() => setPaymentMode('mobile_money')}
              >
                <Smartphone size={14} /> Mobile Money (Airtel / TNM)
              </button>
            </div>
          </div>

          {/* VIP Plans View */}
          {activeTab === 'subscriptions' && (
            <div className="subscriptions-view">
              {/* Billing Toggle */}
              <div className="billing-toggle-container">
                <button
                  type="button"
                  className={`billing-btn ${billingCycle === 'weekly' ? 'active' : ''}`}
                  onClick={() => setBillingCycle('weekly')}
                >
                  Weekly
                </button>
                <button
                  type="button"
                  className={`billing-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
                  onClick={() => setBillingCycle('monthly')}
                >
                  Monthly <span className="save-tag">Save 30%</span>
                </button>
              </div>

              {/* Plans Grid */}
              <div className="plans-grid">
                {subscriptionPlans.map((plan) => {
                  const isPlanSelected = selectedPlan === plan.id;
                  const priceStr =
                    paymentMode === 'stripe'
                      ? (billingCycle === 'monthly' ? plan.usdMonthlyPrice : plan.usdWeeklyPrice)
                      : (billingCycle === 'monthly' ? plan.monthlyPrice : plan.weeklyPrice);
                  const subPeriod = billingCycle === 'monthly' ? 'mo' : 'wk';

                  return (
                    <div
                      key={plan.id}
                      className={`plan-card ${isPlanSelected ? 'selected' : ''} ${
                        plan.popular ? 'popular' : ''
                      }`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {plan.popular && <span className="popular-badge">Most Popular</span>}
                      <h4>{plan.name}</h4>
                      <div className="plan-price">
                        <strong>{priceStr}</strong>
                        <span>/{subPeriod}</span>
                      </div>

                      {paymentMode === 'stripe' && plan.appStoreMonthlyPrice && (
                        <div className="web-discount-note">
                          <span>App Store: <s>{plan.appStoreMonthlyPrice}</s></span>
                          <span className="green-save">Save 30%</span>
                        </div>
                      )}

                      <ul className="plan-features-list">
                        {plan.features.map((feat, idx) => (
                          <li key={idx}>
                            <CheckCircle2 size={13} color="#10B981" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>

                      {paymentMode === 'stripe' ? (
                        <button
                          type="button"
                          className={`btn-plan-select ${isPlanSelected ? 'btn-primary' : 'btn-ghost'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenStripeSub(plan);
                          }}
                        >
                          <CreditCard size={14} /> Pay via Stripe
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={`btn-plan-select ${isPlanSelected ? 'btn-primary' : 'btn-ghost'}`}
                          onClick={() => setSelectedPlan(plan.id)}
                        >
                          {isPlanSelected ? 'Selected' : 'Select'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {paymentMode === 'mobile_money' && (
                <div className="mobile-money-checkout-box">
                  <div className="mm-inputs">
                    <select
                      value={selectedOperator}
                      onChange={(e) => setSelectedOperator(e.target.value)}
                      className="mm-select"
                    >
                      <option value="airtel_mw">📱 Airtel Money (MW)</option>
                      <option value="tnm_mpamba">🇲🇼 TNM Mpamba (MW)</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="e.g. 0991234567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="mm-phone-input"
                    />
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleMobileMoneyPurchase}
                      disabled={processing}
                    >
                      {processing ? 'Processing...' : 'Pay with Mobile Money'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sparks / Credits View */}
          {activeTab === 'sparks' && (
            <div className="sparks-view">
              <div className="sparks-balance-card">
                <Zap size={24} color="#F59E0B" />
                <div>
                  <span>Current Balance</span>
                  <h4>{userProfile?.sparks || 100} Sparks</h4>
                </div>
              </div>

              <div className="sparks-grid">
                {sparkPackages.map((pkg) => (
                  <div key={pkg.id} className="spark-package-card">
                    <div className="spark-icon-circle">⚡</div>
                    <h4>{pkg.sparks} Sparks</h4>
                    {pkg.bonus && <span className="bonus-pill">{pkg.bonus}</span>}
                    <span className="spark-cost">
                      {paymentMode === 'stripe' ? `${pkg.usdPrice} (${pkg.price})` : pkg.price}
                    </span>

                    {paymentMode === 'stripe' ? (
                      <button
                        type="button"
                        className="btn-primary w-full"
                        onClick={() => handleOpenStripeSparks(pkg)}
                      >
                        <CreditCard size={14} /> Buy with Stripe
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-primary w-full"
                        onClick={() => {
                          setSelectedOperator('airtel_mw');
                          handleMobileMoneyPurchase();
                        }}
                        disabled={processing}
                      >
                        Purchase
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Free Sparks / Referral Tab */}
          {activeTab === 'referrals' && (
            <div className="referrals-store-view">
              <div className="referral-banner-hero">
                <div className="referral-icon-badge">
                  <Gift size={32} color="#F59E0B" />
                </div>
                <h3>Give 100 Sparks, Get 100 Sparks</h3>
                <p>
                  Invite single friends to Snellum web. When they create their verified profile using
                  your referral link, you both receive 100 sparks instantly!
                </p>
                <div className="referral-code-display">
                  <span>Your Code:</span>
                  <strong>{userReferralCode}</strong>
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setShareModalOpen(true)}
                >
                  <Sparkles size={16} /> Share My Referral Link
                </button>
              </div>
            </div>
          )}

          {/* Operators footer */}
          <div className="payment-operators-footer">
            <span>Direct Web Checkout Supported:</span>
            <div className="operators-chips">
              <span className="operator-chip">💳 Stripe Cards (Visa/Mastercard)</span>
              <span className="operator-chip"> Apple Pay</span>
              <span className="operator-chip">GPay Google Pay</span>
              <span className="operator-chip">📱 Airtel Money</span>
              <span className="operator-chip">🇲🇼 TNM Mpamba</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stripe Checkout Modal */}
      <StripeCheckoutModal
        isOpen={stripeModalConfig.isOpen}
        onClose={() =>
          setStripeModalConfig((prev) => ({ ...prev, isOpen: false }))
        }
        itemType={stripeModalConfig.itemType}
        itemData={stripeModalConfig.itemData}
        billingCycle={stripeModalConfig.billingCycle}
      />

      {/* Share / Referral Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Invite Friends to Snellum"
        text="Join me on Snellum - The modern dating platform for meaningful connections. Use my invite link to get 100 Free Sparks!"
        url={referralLink}
        isReferral={true}
        referralCode={userReferralCode}
      />
    </>
  );
}
