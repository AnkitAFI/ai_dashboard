"use client";

import { useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';

export interface SubscriptionLimits {
  productTrackingLimit: number;
  hasAdvancedAI: boolean;
  hasRealTimeData: boolean;
  hasRealTimeAlerts: boolean;
  hasPrioritySupport: boolean;
  hasAdvancedAnalytics: boolean;
  hasCustomIntegrations: boolean;
  hasCompetitorAnalysis: boolean;
  reportFrequency: 'weekly' | 'daily' | 'realtime';
  hasAIChatbot: boolean;
  hasDedicatedManager: boolean;
  canExportData: boolean;
  maxDashboardWidgets: number;
  maxSavedReports: number;
  maxTopN: number;
  hasChartAISummaries: boolean;
  maxNotifications: number;
  maxFullAnalysesPerMonth: number;
  maxAIChatMessagesPerMonth: number;
}

export const UNLIMITED = 1000000;

const TIER_LIMITS: Record<string, SubscriptionLimits> = {
  free: {
    productTrackingLimit: 100,
    hasAdvancedAI: false,
    hasRealTimeData: false,
    hasRealTimeAlerts: false,
    hasPrioritySupport: false,
    hasAdvancedAnalytics: false,
    hasCustomIntegrations: false,
    hasCompetitorAnalysis: false,
    reportFrequency: 'weekly',
    hasAIChatbot: true,
    hasDedicatedManager: false,
    canExportData: false,
    maxDashboardWidgets: 4,
    maxSavedReports: 3,
    maxTopN: 5,
    hasChartAISummaries: false,
    maxNotifications: 5,
    maxFullAnalysesPerMonth: 5,
    maxAIChatMessagesPerMonth: 5,
  },
  basic: {
    productTrackingLimit: 1000,
    hasAdvancedAI: true,
    hasRealTimeData: false,
    hasRealTimeAlerts: false,
    hasPrioritySupport: false,
    hasAdvancedAnalytics: false,
    hasCustomIntegrations: false,
    hasCompetitorAnalysis: true,
    reportFrequency: 'daily',
    hasAIChatbot: true,
    hasDedicatedManager: false,
    canExportData: true,
    maxDashboardWidgets: 8,
    maxSavedReports: 10,
    maxTopN: 20,
    hasChartAISummaries: true,
    maxNotifications: 15,
    maxFullAnalysesPerMonth: 20,
    maxAIChatMessagesPerMonth: 20,
  },
  premium: {
    productTrackingLimit: UNLIMITED,
    hasAdvancedAI: true,
    hasRealTimeData: true,
    hasRealTimeAlerts: true,
    hasPrioritySupport: true,
    hasAdvancedAnalytics: true,
    hasCustomIntegrations: true,
    hasCompetitorAnalysis: true,
    reportFrequency: 'realtime',
    hasAIChatbot: true,
    hasDedicatedManager: false,
    canExportData: true,
    maxDashboardWidgets: UNLIMITED,
    maxSavedReports: UNLIMITED,
    maxTopN: 100,
    hasChartAISummaries: true,
    maxNotifications: UNLIMITED,
    maxFullAnalysesPerMonth: UNLIMITED,
    maxAIChatMessagesPerMonth: UNLIMITED,
  },
  enterprise: {
    productTrackingLimit: UNLIMITED,
    hasAdvancedAI: true,
    hasRealTimeData: true,
    hasRealTimeAlerts: true,
    hasPrioritySupport: true,
    hasAdvancedAnalytics: true,
    hasCustomIntegrations: true,
    hasCompetitorAnalysis: true,
    reportFrequency: 'realtime',
    hasAIChatbot: true,
    hasDedicatedManager: true,
    canExportData: true,
    maxDashboardWidgets: UNLIMITED,
    maxSavedReports: UNLIMITED,
    maxTopN: UNLIMITED,
    hasChartAISummaries: true,
    maxNotifications: UNLIMITED,
    maxFullAnalysesPerMonth: UNLIMITED,
    maxAIChatMessagesPerMonth: UNLIMITED,
  },
};

export function useSubscriptionLimits() {
  const { user } = useAuth();

  const currentTier = useMemo(() => {
    return user?.subscriptionTier?.toLowerCase() || 'free';
  }, [user?.subscriptionTier]);

  const limits = useMemo(() => {
    return TIER_LIMITS[currentTier] || TIER_LIMITS.free;
  }, [currentTier]);

  const canAccessFeature = (feature: keyof SubscriptionLimits): boolean => {
    const value = limits[feature];
    if (typeof value === 'boolean') return value;
    return true;
  };

  const isAtLimit = (
    currentCount: number,
    limitType: 'products' | 'widgets' | 'reports' | 'topN' | 'AIChatMessages' | 'productAnalyses'
  ): boolean => {
    switch (limitType) {
      case 'products':
        return limits.productTrackingLimit < UNLIMITED && currentCount >= limits.productTrackingLimit;
      case 'widgets':
        return limits.maxDashboardWidgets < UNLIMITED && currentCount >= limits.maxDashboardWidgets;
      case 'reports':
        return limits.maxSavedReports < UNLIMITED && currentCount >= limits.maxSavedReports;
      case 'topN':
        return limits.maxTopN < UNLIMITED && currentCount >= limits.maxTopN;
      case 'AIChatMessages':
        return limits.maxAIChatMessagesPerMonth < UNLIMITED && currentCount >= limits.maxAIChatMessagesPerMonth;
      case 'productAnalyses':
        return limits.maxFullAnalysesPerMonth < UNLIMITED && currentCount >= limits.maxFullAnalysesPerMonth;
      default:
        return false;
    }
  };

  const getRemainingCount = (
    currentCount: number,
    limitType: 'products' | 'widgets' | 'reports' | 'topN' | 'AIChatMessages' | 'productAnalyses'
  ): number | null => {
    let limit: number;
    switch (limitType) {
      case 'products':
        limit = limits.productTrackingLimit;
        break;
      case 'widgets':
        limit = limits.maxDashboardWidgets;
        break;
      case 'reports':
        limit = limits.maxSavedReports;
        break;
      case 'topN':
        limit = limits.maxTopN;
        break;
      case 'AIChatMessages':
        limit = limits.maxAIChatMessagesPerMonth;
        break;
      case 'productAnalyses':
        limit = limits.maxFullAnalysesPerMonth;
        break;
      default:
        return null;
    }
    if (limit >= UNLIMITED) return null;
    return Math.max(0, limit - currentCount);
  };

  const canPerformAction = (
    actionType: 'productAnalysis' | 'aiChat' | 'addWidget' | 'saveReport',
    currentCount: number
  ): boolean => {
    switch (actionType) {
      case 'productAnalysis':
        return !isAtLimit(currentCount, 'productAnalyses');
      case 'aiChat':
        return !isAtLimit(currentCount, 'AIChatMessages');
      case 'addWidget':
        return !isAtLimit(currentCount, 'widgets');
      case 'saveReport':
        return !isAtLimit(currentCount, 'reports');
      default:
        return true;
    }
  };

  const getUpgradeMessage = (
    limitType: 'productAnalyses' | 'AIChatMessages' | 'widgets' | 'reports'
  ): string => {
    const nextTier = currentTier === 'free' ? 'Basic' : 'Premium';
    
    switch (limitType) {
      case 'productAnalyses':
        return `Upgrade to ${nextTier} for ${
          currentTier === 'free' ? '20' : 'unlimited'
        } product analyses per month`;
      case 'AIChatMessages':
        return `Upgrade to ${nextTier} for ${
          currentTier === 'free' ? '20' : 'unlimited'
        } AI chat messages per month`;
      case 'widgets':
        return `Upgrade to ${nextTier} for ${
          currentTier === 'free' ? '8' : 'unlimited'
        } dashboard widgets`;
      case 'reports':
        return `Upgrade to ${nextTier} for ${
          currentTier === 'free' ? '10' : 'unlimited'
        } saved reports`;
      default:
        return `Upgrade to ${nextTier} for more features`;
    }
  };

  return {
    currentTier,
    limits,
    canAccessFeature,
    isAtLimit,
    getRemainingCount,
    canPerformAction,
    getUpgradeMessage,
  };
}
