'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export interface FeatureSettings {
  enable_upsell_popup: boolean;
  enable_cart_frequently_bought: boolean;
  whatsapp_number: string;
}

const DEFAULT_SETTINGS: FeatureSettings = {
  enable_upsell_popup: false, // Suspended by default as requested
  enable_cart_frequently_bought: true,
  whatsapp_number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2347030574580',
};

export function useFeatureSettings() {
  const [settings, setSettings] = useState<FeatureSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'settings', 'features'),
      (snap) => {
        if (snap.exists()) {
          setSettings({
            enable_upsell_popup: snap.data().enable_upsell_popup ?? false,
            enable_cart_frequently_bought: snap.data().enable_cart_frequently_bought ?? true,
            whatsapp_number: snap.data().whatsapp_number || (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2347030574580'),
          });
        } else {
          setSettings(DEFAULT_SETTINGS);
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Feature settings listener fallback:', err);
        setSettings(DEFAULT_SETTINGS);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const updateSetting = async <K extends keyof FeatureSettings>(key: K, value: FeatureSettings[K]) => {
    try {
      await setDoc(doc(db, 'settings', 'features'), { [key]: value }, { merge: true });
    } catch (err) {
      console.error('Failed to update feature setting:', err);
      alert('Failed to update setting. Please check connection.');
    }
  };

  return { settings, loading, updateSetting };
}

