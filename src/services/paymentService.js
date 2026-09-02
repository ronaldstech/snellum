import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';

export const paymentService = {
  // Mobile money operators matching Flutter PayChangu integration
  getMobileOperators() {
    return [
      { id: 'airtel_mw', name: 'Airtel Money', country: 'MW', icon: '📱' },
      { id: 'tnm_mpamba', name: 'TNM Mpamba', country: 'MW', icon: '💳' },
      { id: 'card_payment', name: 'Debit / Credit Card', country: 'GLOBAL', icon: '🌐' },
    ];
  },

  // Credit pricing tiers
  getSparkPackages() {
    return [
      { id: 'sparks_100', sparks: 100, price: 'MK 2,500', amount: 2500, popular: false },
      { id: 'sparks_500', sparks: 550, bonus: '+50 Bonus', price: 'MK 10,000', amount: 10000, popular: true },
      { id: 'sparks_1200', sparks: 1400, bonus: '+200 Bonus', price: 'MK 25,000', amount: 25000, popular: false },
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
        features: ['5 Super Likes/day', '1 Free Boost/week', 'See who likes you', 'Unlimited Rewinds'],
      },
      {
        id: 'premium',
        name: 'Snellum Premium',
        weeklyPrice: 'MK 7,000',
        monthlyPrice: 'MK 15,000',
        popular: true,
        features: ['Unlimited Likes', 'Unlimited Video Matchmaking', 'Priority Match Queue', 'Read Receipts', 'Incognito Mode'],
      },
      {
        id: 'elite',
        name: 'Snellum Elite',
        weeklyPrice: 'MK 10,000',
        monthlyPrice: 'MK 30,000',
        features: ['VIP Verified Badge', 'Direct VIP Chat before match', 'Unlimited Meetup requests', 'Exclusive VIP lounge access'],
      },
    ];
  },

  // Process a mock or real payment
  async addSparksToAccount(uid, sparksAmount) {
    if (!db || !uid) return;
    const userDoc = doc(db, 'users', uid);
    await updateDoc(userDoc, {
      sparks: increment(sparksAmount),
      credits: increment(sparksAmount),
    }).catch(() => {});
  },

  async activateSubscription(uid, planId) {
    if (!db || !uid) return;
    const userDoc = doc(db, 'users', uid);
    await updateDoc(userDoc, {
      isPremium: true,
      subscriptionPlan: planId,
    }).catch(() => {});
  },
};
