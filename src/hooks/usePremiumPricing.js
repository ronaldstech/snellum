import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function usePremiumPricing() {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(Boolean(db));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!db) {
      setLoading(false);
      setError('Pricing is unavailable because Firebase is not configured.');
      return undefined;
    }

    return onSnapshot(
      doc(db, 'app_settings', 'premium_pricing'),
      (snapshot) => {
        setPricing(snapshot.exists() ? snapshot.data() : null);
        setError('');
        setLoading(false);
      },
      (snapshotError) => {
        console.error('Premium pricing listener error:', snapshotError);
        setError('Could not load pricing. Please try again later.');
        setLoading(false);
      }
    );
  }, []);

  return { pricing, loading, error };
}
