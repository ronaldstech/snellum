import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';

const planFeatures = {
  pro: ['5 Super Likes / day', '1 Free Boost / week', 'See who likes your profile', 'Unlimited Rewinds on left swipes', 'Zero Ads & Faster Matching'],
  premium: ['Unlimited Daily Likes', 'Priority Match Queue Placement', 'Read Receipts on all chats', 'Incognito & Travel Mode', 'Direct VIP Chat before matching'],
  elite: ['VIP Verified Gold Badge', 'Priority Video & Meetup Requests', 'Exclusive VIP Lounge Access', 'Dedicated Matchmaking Concierge', '500 Monthly Sparks allowance'],
};

const usd = (value) => `$${Number(value || 0).toFixed(2)}`;
const makePlan = (id, prices = {}) => ({
  id,
  name: `Snellum ${id[0].toUpperCase()}${id.slice(1)}`,
  weeklyPrice: usd(prices.weekly),
  monthlyPrice: usd(prices.monthly),
  usdWeeklyPrice: usd(prices.weekly),
  usdMonthlyPrice: usd(prices.monthly),
  weeklyCents: Math.round(Number(prices.weekly || 0) * 100),
  monthlyCents: Math.round(Number(prices.monthly || 0) * 100),
  features: planFeatures[id] || [],
  popular: id === 'premium',
});

export const paymentService = {
  // Mobile money operators matching Flutter PayChangu integration + Stripe Web Direct
  getMobileOperators() {
    return [
      { id: 'stripe_direct', name: 'Stripe (Cards & Apple/Google Pay)', country: 'GLOBAL', icon: '💳' },
      { id: 'airtel_mw', name: 'Airtel Money', country: 'MW', icon: '📱' },
      { id: 'tnm_mpamba', name: 'TNM Mpamba', country: 'MW', icon: '🇲🇼' },
    ];
  },

  getSparkPackages(pricing = {}) {
    return (pricing.creditBundles || []).map((bundle) => ({
      id: `sparks_${bundle.amount}`,
      sparks: Number(bundle.amount || 0) + Number(bundle.bonus || 0),
      baseSparks: Number(bundle.amount || 0),
      bonus: Number(bundle.bonus || 0) ? `+${Number(bundle.bonus).toLocaleString()} Bonus Sparks` : '',
      price: usd(bundle.priceUsd),
      amount: Math.round(Number(bundle.priceUsd || 0) * 100),
      usdPrice: usd(bundle.priceUsd),
      cents: Math.round(Number(bundle.priceUsd || 0) * 100),
      popular: Boolean(bundle.popular),
    }));
  },

  getSubscriptionPlans(pricing = {}) {
    return ['pro', 'premium', 'elite'].map((id) => makePlan(id, pricing.plans?.[id]));
  },

  // Process a mock or real payment
  async addSparksToAccount(uid, sparksAmount) {
    if (!uid) return;
    if (db) {
      const userDoc = doc(db, 'users', uid);
      await updateDoc(userDoc, {
        sparks: increment(sparksAmount),
        credits: increment(sparksAmount),
      }).catch(() => {});
    }
  },

  async activateSubscription(uid, planId, billingCycle = 'monthly') {
    if (!uid) return;
    const now = new Date();
    const expiry = new Date();
    if (billingCycle === 'weekly') {
      expiry.setDate(now.getDate() + 7);
    } else {
      expiry.setMonth(now.getMonth() + 1);
    }

    if (db) {
      const userDoc = doc(db, 'users', uid);
      await updateDoc(userDoc, {
        isPremium: true,
        subscriptionPlan: planId,
        isPlanMonthly: billingCycle === 'monthly',
        premiumPurchasedAt: now,
        premiumExpiry: expiry,
      }).catch(() => {});
    }
  },

  // Award Referral Bonus
  async applyReferralBonus(uid, referralCode) {
    if (!uid) return;
    const bonus = 100;
    if (db) {
      const userDoc = doc(db, 'users', uid);
      await updateDoc(userDoc, {
        referredBy: referralCode,
        sparks: increment(bonus),
        credits: increment(bonus),
      }).catch(() => {});
    }
    return bonus;
  },
};
