import { useAuth } from '@/App';
import { useSubscriptionLimits } from './useSubscriptionLimits';

const API_BASE_URL = "https://api.insydz.com";

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

      console.log(`🔄 Updating subscription to ${tier} for user ${user.id}`);

      const response = await fetch(`${API_BASE_URL}/users/${user.id}/subscription`, {
        method: 'PATCH',
        credentials: 'include', // ✅ Include session cookie
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
      
      // ✅ REFRESH AUTH CONTEXT - Updates user everywhere (sidebar, settings, etc.)
      await refreshUser();

      console.log('✅ Subscription updated in database and auth context:', tier);
      return data;
    } catch (error) {
      console.error('❌ Failed to sync subscription to database:', error);
      throw error;
    }
  };

  // ✅ Track AI chat usage
  const trackAIChatUsage = async () => {
    if (!user?.id) {
      console.warn('No user ID available for AI usage tracking');
      return;
    }

    try {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      
      const response = await fetch(`${API_BASE_URL}/users/${user.id}/ai-usage`, {
        method: 'POST',
        credentials: 'include', // ✅ Include session cookie
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          increment: 1,
          month: currentMonth,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to track AI usage: ${response.statusText}`);
      }

      const data = await response.json();
      
      // ✅ REFRESH AUTH CONTEXT - Updates AI usage count everywhere
      await refreshUser();

      console.log('✅ AI usage tracked and synced:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to track AI usage:', error);
      throw error;
    }
  };

  // ✅ Get current AI usage for the month
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
        credentials: 'include', // ✅ Include session cookie
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If endpoint fails, fall back to current user data from auth context
        console.warn('Failed to fetch AI usage from backend, using auth context data');
        return {
          used: user.aiChatUsed || 0,
          limit: limits.maxAIChatMessagesPerMonth,
          month: user.aiChatMonth || new Date().toISOString().slice(0, 7)
        };
      }

      const data = await response.json();
      
      // ✅ REFRESH AUTH CONTEXT if data has changed
      if (data.ai_chat_used !== user.aiChatUsed || data.ai_chat_month !== user.aiChatMonth) {
        await refreshUser();
      }
      
      return {
        used: data.ai_chat_used || 0,
        limit: limits.maxAIChatMessagesPerMonth,
        month: data.ai_chat_month || '',
      };
    } catch (error) {
      console.error('❌ Failed to get AI usage:', error);
      // Return from auth context as fallback
      return { 
        used: user.aiChatUsed || 0, 
        limit: limits.maxAIChatMessagesPerMonth, 
        month: user.aiChatMonth || '' 
      };
    }
  };

  // ✅ Check if user can use AI features
  const canUseAIFeature = async (): Promise<boolean> => {
    // If no user, cannot use AI
    if (!user) return false;
    
    const usage = await getAIUsage();
    
    // Premium users have unlimited access
    if (limits.maxAIChatMessagesPerMonth === Infinity) return true;
    
    // Check if under limit
    return usage.used < usage.limit;
  };

  // ✅ Get remaining AI messages
  const getRemainingAIMessages = async (): Promise<number> => {
    if (!user) return 0;
    
    const usage = await getAIUsage();
    
    if (limits.maxAIChatMessagesPerMonth === Infinity) {
      return Infinity;
    }
    
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
    user, // ✅ Expose user from auth context
  };
}