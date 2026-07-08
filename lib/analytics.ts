import { API_BASE_URL } from "@/lib/config";

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface AnalyticsEvent {
  id: string;
  session_id: string;
  event_type: string;
  page_path: string;
  properties: Record<string, any>;
  created_at: string;
}

class InHouseAnalytics {
  private queue: AnalyticsEvent[] = [];
  private limit = 10;
  private flushInterval = 10000; // 10 seconds
  private intervalId: any = null;
  private sessionId = "";

  constructor() {
    if (typeof window !== "undefined") {
      this.sessionId = this.getOrCreateSession();
      this.setupUnloadListener();
      this.startTimer();
    }
  }

  private getOrCreateSession(): string {
    let id = localStorage.getItem("ih_session_id");
    if (!id) {
      id = generateUUID();
      localStorage.setItem("ih_session_id", id);
    }
    return id;
  }

  private setupUnloadListener() {
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.flush();
      }
    });
  }

  private startTimer() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.flush(), this.flushInterval);
  }

  public track(eventType: string, properties: Record<string, any> = {}) {
    if (typeof window === "undefined") return;

    const event: AnalyticsEvent = {
      id: generateUUID(),
      session_id: this.sessionId,
      event_type: eventType,
      page_path: window.location.pathname + window.location.search,
      properties: properties,
      created_at: new Date().toISOString(),
    };

    this.queue.push(event);

    if (this.queue.length >= this.limit) {
      this.flush();
    }
  }

  public flush() {
    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];

    const url = `${API_BASE_URL}/api/behavior-tracking/batch`;
    const payload = JSON.stringify({ events: batch });

    // Use fetch with keepalive and credentials to ensure auth cookies are sent
    // (navigator.sendBeacon often strips cross-origin credentials)
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
      credentials: "include",
    }).catch((err) => console.error("In-house tracking failed", err));
  }
}

export const analytics = new InHouseAnalytics();
