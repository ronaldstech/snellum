import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';

export const paymentService = {
  // Mobile money operators matching Flutter PayChangu integration + Stripe Web Direct
  getMobileOperators() {
    return [
      { id: 'stripe_direct', name: 'Stripe (Cards & Apple/Google Pay)', country: 'GLOBAL', icon: '💳' },
      { id: 'airtel_mw', name: 'Airtel Money', country: 'MW', icon: '📱' },
      { id: 'tnm_mpamba', name: 'TNM Mpamba', country: 'MW', icon: '🇲🇼' },
    ];
  },

  // Credit pricing tiers with MWK & USD (for Stripe web direct)
  getSparkPackages() {
    return [
      {
        id: 'sparks_100',
        sparks: 100,
        price: 'MK 2,500',
        amount: 2500,
        usdPrice: '$1.99',
        cents: 199,
        appStoreUsdPrice: '$2.99',
        popular: false,
      },
      {
        id: 'sparks_500',
        sparks: 550,
        bonus: '+50 Bonus Sparks',
        price: 'MK 10,000',
        amount: 10000,
        usdPrice: '$6.99',
        cents: 699,
        appStoreUsdPrice: '$9.99',
        popular: true,
      },
      {
        id: 'sparks_1200',
        sparks: 1400,
        bonus: '+200 Bonus Sparks',
        price: 'MK 25,000',
        amount: 25000,
        usdPrice: '$14.99',
        cents: 1499,
        appStoreUsdPrice: '$21.99',
        popular: false,
      },
    ];
  },

  // Premium membership tiers
  getSubscriptionPlans() {
    return [
      {
        id: 'pro',
        name: 'Snellum Pro',
        weeklyPrice: 'MK 5,000',
        monthlyPrice: 'MK 10,000',
        usdWeeklyPrice: '$3.49',
        usdMonthlyPrice: '$6.99',
        weeklyCents: 349,
        monthlyCents: 699,
        appStoreMonthlyPrice: '$9.99',
        features: [
          '5 Super Likes / day',
          '1 Free Boost / week',
          'See who likes your profile',
          'Unlimited Rewinds on left swipes',
          'Zero Ads & Faster Matching',
        ],
      },
      {
        id: 'premium',
        name: 'Snellum Premium',
        weeklyPrice: 'MK 7,000',
        monthlyPrice: 'MK 15,000',
        usdWeeklyPrice: '$4.99',
        usdMonthlyPrice: '$9.99',
        weeklyCents: 499,
        monthlyCents: 999,
        appStoreMonthlyPrice: '$14.99',
        popular: true,
        features: [
          'Unlimited Daily Likes',
          'Priority Match Queue Placement',
          'Read Receipts on all chats',
          'Incognito & Travel Mode',
          'Direct VIP Chat before matching',
        ],
      },
      {
        id: 'elite',
        name: 'Snellum Elite',
        weeklyPrice: 'MK 10,000',
        monthlyPrice: 'MK 30,000',
        usdWeeklyPrice: '$7.49',
        usdMonthlyPrice: '$19.99',
        weeklyCents: 749,
        monthlyCents: 1999,
        appStoreMonthlyPrice: '$28.99',
        features: [
          'VIP Verified Gold Badge',
          'Priority Video & Meetup Requests',
          'Exclusive VIP Lounge Access',
          'Dedicated Matchmaking Concierge',
          '500 Monthly Sparks allowance',
        ],
      },
    ];
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
