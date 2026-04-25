"use client";

import { useAuth } from '@/lib/auth-context';
import { useSubscriptionLimits } from './use-subscription-limits';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface SubscriptionUpdatePayload {
  user_id: number;
  subscription_tier: string;
  ai_chat_used?: number;
  ai_chat_month?: string;
}

export function useSubscriptionSync() {
  const { user, refreshUser } = useAuth();
  const { currentTier, limits } = useSubscriptionLimits();

  const updateSubscriptionInDB = async (tier: string) => {
    if (!user?.id) throw new Error('User not logged in');

    try {
      const payload: SubscriptionUpdatePayload = {
        user_id: user.id,
        subscription_tier: tier,
      };

      const response = await fetch(`${API_BASE}/users/${user.id}/subscription`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Failed to update subscription: ${response.statusText}`);
      const data = await response.json();
      await refreshUser();
      return data;
    } catch (error) {
      console.error('❌ Failed to sync subscription:', error);
      throw error;
    }
  };

  const trackAIChatUsage = async () => {
    if (!user?.id) return;
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const response = await fetch(`${API_BASE}/users/${user.id}/ai-usage`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, increment: 1, month: currentMonth }),
      });
      if (!response.ok) throw new Error(`Failed to track AI usage: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Failed to track AI usage:', error);
      throw error;
    }
  };

  const getAIUsage = async (): Promise<{ used: number; limit: number; month: string }> => {
    if (!user?.id) return { used: 0, limit: limits.maxAIChatMessagesPerMonth, month: '' };
    try {
      const response = await fetch(`${API_BASE}/users/${user.id}/ai-usage`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        return {
          used: user.aiChatUsed || 0,
          limit: limits.maxAIChatMessagesPerMonth,
          month: user.aiChatMonth || new Date().toISOString().slice(0, 7)
        };
      }
      const data = await response.json();
      return { used: data.ai_chat_used || 0, limit: limits.maxAIChatMessagesPerMonth, month: data.ai_chat_month || '' };
    } catch (error) {
      console.error('❌ Failed to get AI usage:', error);
      return { used: user.aiChatUsed || 0, limit: limits.maxAIChatMessagesPerMonth, month: user.aiChatMonth || '' };
    }
  };

  const canUseAIFeature = async (): Promise<boolean> => {
    if (!user) return false;
    const usage = await getAIUsage();
    if (limits.maxAIChatMessagesPerMonth === 1000000) return true; // UNLIMITED
    return usage.used < usage.limit;
  };

  const getRemainingAIMessages = async (): Promise<number> => {
    if (!user) return 0;
    const usage = await getAIUsage();
    if (limits.maxAIChatMessagesPerMonth === 1000000) return 1000000;
    return Math.max(0, usage.limit - usage.used);
  };

  const hasReachedAILimit = async (): Promise<boolean> => {
    if (!user) return true;
    const canUse = await canUseAIFeature();
    return !canUse;
  };

  return {
    updateSubscriptionInDB,
    trackAIChatUsage,
    getAIUsage,
    canUseAIFeature,
    getRemainingAIMessages,
    hasReachedAILimit,
    currentTier,
    limits,
    user,
  };
}
