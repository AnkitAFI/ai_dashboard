"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { analytics } from "@/lib/analytics";
import { useAuth } from "@/lib/auth-context";

// Module-level global state to survive component unmounts and layouts re-renders
let globalLastTrackedPath: string | null = null;
let globalLastTrackedTime: number = 0;
let activePagePath: string | null = null;
let activePageStartTime: number = 0;

const trackActivePageView = (email: string | null) => {
  if (activePagePath && activePageStartTime > 0) {
    const durationMs = Date.now() - activePageStartTime;
    const durationSec = Math.round(durationMs / 1000);
    analytics.track("page_view", {
      path: activePagePath,
      duration_seconds: durationSec,
      user_email: email,
    });
  }
  activePagePath = null;
  activePageStartTime = 0;
};

export default function BehaviorTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();

  // 1. Track route changes automatically - only after auth context is fully resolved
  useEffect(() => {
    if (isLoading) return;
    if (pathname.includes("/admin") || pathname.includes("/portal-node-secure-x3a9")) return; // skip tracking on admin & secret login pages

    const fullPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    const now = Date.now();

    if (fullPath === globalLastTrackedPath && now - globalLastTrackedTime < 2000) {
      return;
    }

    if (activePagePath && activePagePath !== fullPath) {
      trackActivePageView(user?.email || null);
    }

    globalLastTrackedPath = fullPath;
    globalLastTrackedTime = now;
    activePagePath = fullPath;
    activePageStartTime = now;
  }, [pathname, searchParams, user, isLoading]);

  // 1.5 Track page stay timing on tab hide or close
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        trackActivePageView(user?.email || null);
      } else if (document.visibilityState === "visible") {
        if (pathname && !pathname.includes("/admin") && !pathname.includes("/portal-node-secure-x3a9")) {
          activePagePath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
          activePageStartTime = Date.now();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname, searchParams, user]);

  // 2. Track rage clicks and regular clicks
  useEffect(() => {
    if (pathname.includes("/admin") || pathname.includes("/portal-node-secure-x3a9")) return; // skip tracking on admin & secret login pages
    let clicks: { time: number; x: number; y: number; target: HTMLElement }[] = [];
    const RAGE_CLICK_LIMIT = 5;
    const TIME_WINDOW_MS = 1500;

    const handleDocumentClick = (e: MouseEvent) => {
      const now = Date.now();
      const target = e.target as HTMLElement;

      if (!target) return;

      // Resolve custom dataset attributes for semantic analytics mapping
      const trackId = target.getAttribute("data-track-id") || target.closest("[data-track-id]")?.getAttribute("data-track-id") || null;
      let filterValue = target.getAttribute("data-filter-value") || target.closest("[data-filter-value]")?.getAttribute("data-filter-value") || null;

      // Fallback: Read the element's real-time input/select value if not set as a dataset attribute
      if (!filterValue) {
        if (target instanceof HTMLSelectElement || target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
          filterValue = target.value || null;
        } else {
          const closestControl = target.closest("select, input, textarea");
          if (closestControl instanceof HTMLSelectElement || closestControl instanceof HTMLInputElement || closestControl instanceof HTMLTextAreaElement) {
            filterValue = closestControl.value || null;
          }
        }
      }

      const panelId = target.getAttribute("data-panel-id") || target.closest("[data-panel-id]")?.getAttribute("data-panel-id") || null;
      const ariaLabel = target.getAttribute("aria-label") || target.closest("[aria-label]")?.getAttribute("aria-label") || null;
      const nameAttr = target.getAttribute("name") || target.closest("[name]")?.getAttribute("name") || null;

      // Extract basic element identifier properties factually
      const targetData = {
        tagName: target.tagName,
        id: target.id || null,
        track_id: trackId,
        filter_value: filterValue,
        panel_id: panelId,
        aria_label: ariaLabel,
        name: nameAttr,
        className: target.className || null,
        text: target.innerText?.substring(0, 60).trim() || null,
        x: e.clientX,
        y: e.clientY,
      };

      // Push click details to validation array
      clicks.push({ time: now, x: e.clientX, y: e.clientY, target });

      // Filter clicks outside of current time window
      clicks = clicks.filter((c) => now - c.time < TIME_WINDOW_MS);

      // Check if user has triggered a rage click (clicks >= 5 on the same element within 1.5 seconds)
      const sameElementClicks = clicks.filter((c) => c.target === target);

      if (sameElementClicks.length >= RAGE_CLICK_LIMIT) {
        analytics.track("rage_click", {
          ...targetData,
          click_count: sameElementClicks.length,
          time_window_ms: TIME_WINDOW_MS,
        });
        clicks = []; // Clear current clicks buffer after trigger
      } else {
        // Track regular interaction events (excluding noise elements)
        const ignoredTags = ["HTML", "BODY"];
        if (!ignoredTags.includes(target.tagName)) {
          analytics.track("element_click", targetData);
        }
      }
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, []);

  return null;
}

