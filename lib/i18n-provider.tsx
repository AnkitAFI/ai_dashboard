"use client";

import i18n from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enDashboard from '../locales/en/dashboard.json';
import hiDashboard from '../locales/hi/dashboard.json';

// Initialize i18next
if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: {
          dashboard: enDashboard,
        },
        hi: {
          dashboard: hiDashboard,
        },
      },
      fallbackLng: 'en',
      defaultNS: 'dashboard',
      interpolation: {
        escapeValue: false, // react already safes from xss
      },
    });
}

export function I18nClientProvider({ children }: { children: React.ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
