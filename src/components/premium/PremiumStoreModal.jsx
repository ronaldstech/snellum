import React, { useState } from 'react';
import {
  Crown,
  Zap,
  CheckCircle2,
  X,
  CreditCard,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { paymentService } from '../../services/paymentService';
import StripeCheckoutModal from './StripeCheckoutModal';
import '../../styles/premium.css';

export default function PremiumStoreModal({ isOpen, onClose, onProceedToCart }) {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('memberships'); // 'memberships' | 'sparks'
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'weekly'

  // Fallback Stripe Checkout Modal state if cart handler not provided
  const [stripeModalConfig, setStripeModalConfig] = useState({
    isOpen: false,
    itemType: 'subscription',
    itemData: null,
    billingCycle: 'monthly',
  });

  if (!isOpen) return null;

  const subscriptionPlans = paymentService.getSubscriptionPlans();
  const sparkPackages = paymentService.getSparkPackages();

  const handleProceedSub = (plan) => {
    if (onProceedToCart) {
      onProceedToCart({
        itemType: 'subscription',
        itemData: plan,
        billingCycle,
      });
    } else {
      setStripeModalConfig({
        isOpen: true,
        itemType: 'subscription',
        itemData: plan,
        billingCycle,
      });
    }
  };

  const handleProceedSparks = (pkg) => {
    if (onProceedToCart) {
      onProceedToCart({
        itemType: 'sparks',
        itemData: pkg,
        billingCycle: 'one_time',
      });
    } else {
      setStripeModalConfig({
        isOpen: true,
        itemType: 'sparks',
        itemData: pkg,
        billingCycle: 'one_time',
      });
    }
  };

  return (
    <>
      <div className="drawer-backdrop-fixed animate-fade-in" onClick={onClose}>
        <aside
          className="premium-drawer"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="VIP Memberships & Sparks Store"
        >
          {/* 1. Header */}
          <div className="premium-drawer-header">
            <div className="premium-drawer-title-group">
              <div className="premium-drawer-icon">
                <Crown size={20} />
              </div>
              <div>
                <h3>VIP & Sparks</h3>
                <p>Unlock VIP features & instant matches</p>
              </div>
            </div>
            <button
              type="button"
              className="drawer-close-btn"
              onClick={onClose}
              aria-label="Close Store"
            >
              <X size={18} />
            </button>
          </div>

          {/* 2. Simplified Two Tabs: VIP Memberships & Sparks */}
          <div className="premium-drawer-tabs-wrap">
            <div className="premium-drawer-tabs">
              <button
                type="button"
                className={`premium-drawer-tab ${activeTab === 'memberships' ? 'active' : ''}`}
                onClick={() => setActiveTab('memberships')}
              >
                <Crown size={15} /> VIP Memberships
              </button>
              <button
                type="button"
                className={`premium-drawer-tab ${activeTab === 'sparks' ? 'active' : ''}`}
                onClick={() => setActiveTab('sparks')}
              >
                <Zap size={15} /> Sparks
              </button>
            </div>
          </div>

          {/* 3. Drawer Scrollable Body */}
          <div className="premium-drawer-body">
            {/* VIP Perks Highlight Callout */}
            <div className="web-savings-callout">
              <Sparkles size={14} />
              <span>Get unlimited likes, read receipts, and priority matching.</span>
            </div>

            {/* TAB 1: VIP Memberships */}
            {activeTab === 'memberships' && (
              <>
                {/* Billing Cycle Switcher */}
                <div className="drawer-billing-switch">
                  <button
                    type="button"
                    className={`drawer-billing-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
                    onClick={() => setBillingCycle('monthly')}
                  >
                    Monthly <span className="drawer-save-badge">Popular</span>
                  </button>
                  <button
                    type="button"
                    className={`drawer-billing-btn ${billingCycle === 'weekly' ? 'active' : ''}`}
                    onClick={() => setBillingCycle('weekly')}
                  >
                    Weekly
                  </button>
                </div>

                {/* Plans List */}
                <div className="drawer-plans-list">
                  {subscriptionPlans.map((plan) => {
                    const priceDisplay =
                      billingCycle === 'monthly' ? plan.usdMonthlyPrice : plan.usdWeeklyPrice;
                    const localPriceDisplay =
                      billingCycle === 'monthly' ? plan.monthlyPrice : plan.weeklyPrice;
                    const periodLabel = billingCycle === 'monthly' ? '/mo' : '/wk';

                    return (
                      <div
                        key={plan.id}
                        className={`drawer-plan-card ${plan.popular ? 'popular' : ''}`}
                      >
                        {plan.popular && (
                          <span className="drawer-plan-popular-badge">Most Popular</span>
                        )}

                        <div className="drawer-plan-header">
                          <h4 className="drawer-plan-name">{plan.name}</h4>
                          <div className="drawer-plan-price-wrap">
                            <span className="drawer-plan-price">{priceDisplay}</span>
                            <span className="drawer-plan-period">{periodLabel}</span>
                            <div className="drawer-plan-sub-price">or {localPriceDisplay}</div>
                          </div>
                        </div>

                        <ul className="drawer-plan-features">
                          {plan.features.map((feat, idx) => (
                            <li key={idx}>
                              <CheckCircle2 size={14} color="#10B981" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          type="button"
                          className={`drawer-plan-btn ${plan.popular ? 'btn-vip-highlight' : ''}`}
                          onClick={() => handleProceedSub(plan)}
                        >
                          <CreditCard size={15} /> Upgrade to {plan.name}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* TAB 2: Sparks */}
            {activeTab === 'sparks' && (
              <>
                {/* Current Sparks Balance Hero */}
                <div className="sparks-balance-hero">
                  <div className="sparks-balance-icon-wrap">
                    <Zap size={24} color="#F59E0B" />
                  </div>
                  <div className="sparks-balance-meta">
                    <span>Your Current Balance</span>
                    <h4>{userProfile?.sparks || 100} Sparks</h4>
                  </div>
                </div>

                <p className="sparks-use-tip">
                  Use Sparks for instant profile boosts, sending Super Likes, and sending virtual gifts in chats.
                </p>

                {/* Packages List */}
                <div className="sparks-packages-list">
                  {sparkPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`spark-card ${pkg.popular ? 'popular' : ''}`}
                    >
                      <div className="spark-card-left">
                        <div className="spark-card-icon">⚡</div>
                        <div className="spark-card-info">
                          <h4>
                            {pkg.sparks} Sparks
                            {pkg.bonus && (
                              <span className="spark-bonus-tag">{pkg.bonus}</span>
                            )}
                          </h4>
                          <div className="spark-card-price-sub">
                            {pkg.usdPrice} · ({pkg.price})
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="spark-buy-btn"
                        onClick={() => handleProceedSparks(pkg)}
                      >
                        <CreditCard size={13} /> Buy
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 4. Footer */}
          <div className="premium-drawer-footer">
            <span className="drawer-secure-note">
              <ShieldCheck size={14} color="#10B981" />
              Safe & secure checkout · Instant activation · Cancel anytime
            </span>
          </div>
        </aside>
      </div>

      {/* Stripe Web Checkout Modal */}
      <StripeCheckoutModal
        isOpen={stripeModalConfig.isOpen}
        onClose={() =>
          setStripeModalConfig((prev) => ({ ...prev, isOpen: false }))
        }
        itemType={stripeModalConfig.itemType}
        itemData={stripeModalConfig.itemData}
        billingCycle={stripeModalConfig.billingCycle}
      />
    </>
  );
}
