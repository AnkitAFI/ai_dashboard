import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useSubscriptionLimits, UNLIMITED } from './use-subscription-limits';
import { API_BASE_URL } from '@/lib/config';

interface PTUsageState {
  used: number;
  limit: number;
  remaining: number | null; // null = unlimited
  isLocked: boolean;        // free tier � no access at all
  isAtLimit: boolean;       // has a limit and has reached it
  loading: boolean;
}

export function usePTUsage() {
  const { user } = useAuth();
  const { limits } = useSubscriptionLimits();
  const searchLimit = limits.maxFullAnalysesPerMonth;

  const [state, setState] = useState<PTUsageState>({
    used: 0,
    limit: searchLimit,
    remaining: searchLimit >= UNLIMITED ? null : searchLimit,
    isLocked: searchLimit === 0,
    isAtLimit: false,
    loading: true,
  });

  // -- Fetch current usage from the backend ---------------------------------
  const fetchUsage = useCallback(async () => {
    if (!user?.id || searchLimit === 0) {
      // Free tier: locked, no need to fetch
      setState({
        used: 0,
        limit: 0,
        remaining: 0,
        isLocked: true,
        isAtLimit: false,
        loading: false,
      });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/users/${user?.id}/analysis-usage`, {
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to fetch PT usage');

      const data = await res.json();
      const used = data.data?.count ?? 0;
      const remaining = searchLimit >= UNLIMITED ? null : Math.max(0, searchLimit - used);

      setState({
        used,
        limit: searchLimit,
        remaining,
        isLocked: false,
        isAtLimit: remaining !== null && remaining <= 0,
        loading: false,
      });
    } catch {
      // On error, fail open (don't block user)
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [user?.id, searchLimit]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  // -- Increment usage on the backend after a successful search -------------
  const incrementUsage = useCallback(async () => {
    if (!user?.id || searchLimit === 0 || searchLimit >= UNLIMITED) return;

    try {
      const res = await fetch(`${API_BASE_URL}/users/${user?.id}/analysis-usage`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, increment: 1 }),
      });

      if (!res.ok) throw new Error('Failed to track PT usage');

      const data = await res.json();
      const used = data.data?.analysis_used ?? 0;
      const remaining = Math.max(0, searchLimit - used);

      setState(prev => ({
        ...prev,
        used,
        remaining,
        isAtLimit: remaining <= 0,
      }));
    } catch (err) {
      console.error('? Failed to increment PT usage:', err);
    }
  }, [user?.id, searchLimit]);

  return { ...state, incrementUsage, refetch: fetchUsage };
}
