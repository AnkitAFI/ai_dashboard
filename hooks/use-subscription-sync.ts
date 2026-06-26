import { useAuth } from '@/lib/auth-context';
import { useSubscriptionLimits } from './use-subscription-limits';
import { API_BASE_URL } from '@/lib/config';

interface SubscriptionUpdatePayload {
  user_id: number;
  subscription_tier: string;
  ai_chat_used?: number;
  ai_chat_month?: string;
}

export function useSubscriptionSync() {
  const { user, refreshUser } = useAuth();
  const { currentTier, limits } = useSubscriptionLimits();

  // ✅ Update subscription tier in database and refresh auth context
  const updateSubscriptionInDB = async (tier: string) => {
    if (!user?.id) {
      console.warn('No user ID available for subscription update');
      throw new Error('User not logged in');
    }

    try {
      const payload: SubscriptionUpdatePayload = {
        user_id: user.id,
        subscription_tier: tier,
      };

      const response = await fetch(`${API_BASE_URL}/users/${user.id}/subscription`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error:', errorText);
        throw new Error(`Failed to update subscription: ${response.statusText}`);
      }

      const data = await response.json();

      // ✅ Only here we refresh the auth context
      await refreshUser();

      return data;
    } catch (error) {
      console.error('❌ Failed to sync subscription to database:', error);
      throw error;
    }
  };

  // ✅ Track AI chat usage WITHOUT refreshing auth context
  const trackAIChatUsage = async () => {
    if (!user?.id) return;

    try {
      const currentMonth = new Date().toISOString().slice(0, 7);

      const response = await fetch(`${API_BASE_URL}/users/${user.id}/ai-usage`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          increment: 1,
          month: currentMonth,
        }),
      });

      if (!response.ok) {
        console.warn(`Failed to track AI usage: ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('❌ Failed to track AI usage:', error);
      return null;
    }
  };

  // ✅ Get current AI usage for the month WITHOUT refreshing auth context
  const getAIUsage = async (): Promise<{ used: number; limit: number; month: string }> => {
    if (!user?.id) {
      return {
        used: 0,
        limit: limits.maxAIChatMessagesPerMonth,
        month: ''
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}/ai-usage`, {
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
      return {
        used: data.ai_chat_used || 0,
        limit: limits.maxAIChatMessagesPerMonth,
        month: data.ai_chat_month || '',
      };
    } catch (error) {
      console.error('❌ Failed to get AI usage:', error);
      return {
        used: user.aiChatUsed || 0,
        limit: limits.maxAIChatMessagesPerMonth,
        month: user.aiChatMonth || ''
      };
    }
  };

  // ✅ Check if user can use AI features
  const canUseAIFeature = async (): Promise<boolean> => {
    if (!user) return false;

    const usage = await getAIUsage();
    if (limits.maxAIChatMessagesPerMonth === Infinity) return true;
    return usage.used < usage.limit;
  };

  // ✅ Get remaining AI messages
  const getRemainingAIMessages = async (): Promise<number> => {
    if (!user) return 0;

    const usage = await getAIUsage();
    if (limits.maxAIChatMessagesPerMonth === Infinity) return Infinity;
    return Math.max(0, usage.limit - usage.used);
  };

  // ✅ Check if user has reached AI limit
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
