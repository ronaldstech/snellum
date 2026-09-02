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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { paymentService } from '../../services/paymentService';
import '../../styles/premium.css';

export default function PremiumStoreModal({ isOpen, onClose }) {
  const { user, userProfile, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('subscriptions'); // 'subscriptions' | 'sparks'
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'weekly' | 'monthly'
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [selectedOperator, setSelectedOperator] = useState('airtel_mw');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const subscriptionPlans = paymentService.getSubscriptionPlans();
  const sparkPackages = paymentService.getSparkPackages();
  const operators = paymentService.getMobileOperators();

  const handlePurchasePlan = async (planId) => {
    setProcessing(true);
    try {
      if (user?.uid) {
        await paymentService.activateSubscription(user.uid, planId);
      }
      showToast('🎉 Subscription activated successfully!', 'success');
      onClose();
    } catch (err) {
      showToast('Payment could not be processed', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleBuySparks = async (pkg) => {
    setProcessing(true);
    try {
      if (user?.uid) {
        await paymentService.addSparksToAccount(user.uid, pkg.sparks);
      }
      showToast(`⚡ Added ${pkg.sparks} Sparks to your account!`, 'success');
      onClose();
    } catch (err) {
      showToast('Payment could not be processed', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="modal-backdrop-fixed animate-fade-in" onClick={onClose}>
      <div className="premium-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="premium-modal-header">
          <div className="premium-title-group">
            <Crown size={24} color="#F59E0B" />
            <div>
              <h3>Snellum VIP & Sparks Store</h3>
              <span>Unlock premium features, secret admirers, and boosts</span>
            </div>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Store Tabs */}
        <div className="store-tabs-nav">
          <button
            type="button"
            className={`store-tab ${activeTab === 'subscriptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscriptions')}
          >
            <Crown size={16} /> VIP Memberships
          </button>
          <button
            type="button"
            className={`store-tab ${activeTab === 'sparks' ? 'active' : ''}`}
            onClick={() => setActiveTab('sparks')}
          >
            <Zap size={16} /> Sparks Credits
          </button>
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
              {subscriptionPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''} ${
                    plan.popular ? 'popular' : ''
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && <span className="popular-badge">Most Popular</span>}
                  <h4>{plan.name}</h4>
                  <div className="plan-price">
                    <strong>
                      {billingCycle === 'monthly' ? plan.monthlyPrice : plan.weeklyPrice}
                    </strong>
                    <span>/{billingCycle === 'monthly' ? 'mo' : 'wk'}</span>
                  </div>

                  <ul className="plan-features-list">
                    {plan.features.map((feat, idx) => (
                      <li key={idx}>
                        <CheckCircle2 size={14} color="#10B981" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    className={`btn-plan-select ${selectedPlan === plan.id ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => handlePurchasePlan(plan.id)}
                    disabled={processing}
                  >
                    {processing ? 'Processing...' : 'Subscribe Now'}
                  </button>
                </div>
              ))}
            </div>
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
                  <span className="spark-cost">{pkg.price}</span>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => handleBuySparks(pkg)}
                    disabled={processing}
                  >
                    Purchase
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Money Operators footer */}
        <div className="payment-operators-footer">
          <span>Supported Mobile Money:</span>
          <div className="operators-chips">
            {operators.map((op) => (
              <span key={op.id} className="operator-chip">
                {op.icon} {op.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
