"use client";

import i18n from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import * as enDashboard from '../locales/en/dashboard.json';
import * as hiDashboard from '../locales/hi/dashboard.json';
import * as taDashboard from '../locales/ta/dashboard.json';
import * as teDashboard from '../locales/te/dashboard.json';
import * as mrDashboard from '../locales/mr/dashboard.json';
import * as bnDashboard from '../locales/bn/dashboard.json';
import * as guDashboard from '../locales/gu/dashboard.json';
import * as knDashboard from '../locales/kn/dashboard.json';
import * as mlDashboard from '../locales/ml/dashboard.json';
import * as paDashboard from '../locales/pa/dashboard.json';

// Initialize i18next
if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: { dashboard: enDashboard },
        hi: { dashboard: hiDashboard },
        ta: { dashboard: taDashboard },
        te: { dashboard: teDashboard },
        mr: { dashboard: mrDashboard },
        bn: { dashboard: bnDashboard },
        gu: { dashboard: guDashboard },
        kn: { dashboard: knDashboard },
        ml: { dashboard: mlDashboard },
        pa: { dashboard: paDashboard },
      },
      fallbackLng: 'en',
      defaultNS: 'dashboard',
      interpolation: {
        escapeValue: false,
      },
    });
}

export function I18nClientProvider({ children }: { children: React.ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
