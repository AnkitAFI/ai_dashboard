"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Sparkles, ChevronRight } from "lucide-react";

// ── Free Spell Correction Engine (Levenshtein Distance) ───────────────────────
// 100% free, runs entirely in the browser — no paid APIs needed

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

function findClosestWord(word: string, dictionary: string[]): string | null {
  if (word.length < 3) return null;
  let best: string | null = null;
  let bestDist = Infinity;
  const lower = word.toLowerCase();
  const maxAllowed = lower.length <= 4 ? 1 : lower.length <= 7 ? 2 : 3;

  for (const entry of dictionary) {
    const entryLower = entry.toLowerCase();

    // Exact match — already correct, no correction needed
    if (entryLower === lower) return null;

    // ── Check against the full entry ──
    const distFull = levenshtein(lower, entryLower);
    if (distFull < bestDist && distFull <= maxAllowed) {
      bestDist = distFull;
      best = entry;
    }

    // ── Also check each individual word inside a multi-word entry ──
    // e.g. "blutooth" vs "bluetooth speakers" → checks "bluetooth" (dist=1) ✅
    const parts = entryLower.split(/\s+/);
    if (parts.length > 1) {
      for (const part of parts) {
        if (part === lower) return null; // typed word is correct as a part of this entry
        const dist = levenshtein(lower, part);
        if (dist < bestDist && dist <= maxAllowed) {
          bestDist = dist;
          best = entry; // return the full dictionary entry as the suggestion
        }
      }
    }
  }
  return best;
}

// Splits query into words and tries to correct each one
function correctQuery(query: string, dictionary: string[]): string | null {
  if (!query.trim() || dictionary.length === 0) return null;
  const words = query.trim().split(/\s+/);
  let corrected = false;
  const result = words.map((word) => {
    const fix = findClosestWord(word, dictionary);
    if (fix) { corrected = true; return fix; }
    return word;
  });
  return corrected ? result.join(" ") : null;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SmartSearchInputProps {
  /** Current value */
  value: string;
  /** onChange handler — receives the new value */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Extra className for the wrapper div */
  className?: string;
  /** Extra className for the <input> element */
  inputClassName?: string;
  /** Words / item names to build autocorrect dictionary and suggestions from */
  dictionary?: string[];
  /** Max number of live suggestions shown in the dropdown */
  maxSuggestions?: number;
  /** Called when user presses Enter */
  onEnter?: () => void;
  /** id for tracking / accessibility */
  id?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SmartSearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  inputClassName = "",
  dictionary = [],
  maxSuggestions = 6,
  onEnter,
  id,
  disabled = false,
}: SmartSearchInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [correction, setCorrection] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced suggestion + correction engine
  const compute = useCallback(() => {
    const q = value.trim().toLowerCase();

    // ── live suggestions (prefix / substring match on dictionary)
    if (q.length > 0 && dictionary.length > 0) {
      const matches = dictionary
        .filter((d) => d.toLowerCase().includes(q) && d.toLowerCase() !== q)
        .slice(0, maxSuggestions);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }

    // ── autocorrect (only when there is no good prefix match)
    if (q.length >= 3) {
      const fix = correctQuery(q, dictionary);
      setCorrection(fix);
    } else {
      setCorrection(null);
    }

    setActiveIdx(-1);
  }, [value, dictionary, maxSuggestions]);

  useEffect(() => {
    const t = setTimeout(compute, 200);
    return () => clearTimeout(t);
  }, [compute]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const showDropdown =
    focused &&
    (suggestions.length > 0 || (correction && correction !== value.toLowerCase()));

  const applyValue = (v: string) => {
    onChange(v);
    setFocused(false);
    setSuggestions([]);
    setCorrection(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) {
      if (e.key === "Enter") onEnter?.();
      return;
    }

    const total = suggestions.length + (correction ? 1 : 0);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % total);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + total) % total);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0) {
        const correctionIdx = correction ? 0 : -1;
        if (correction && activeIdx === 0) {
          applyValue(correction);
        } else {
          const suggIdx = correction ? activeIdx - 1 : activeIdx;
          applyValue(suggestions[suggIdx]);
        }
      } else {
        setFocused(false);
        onEnter?.();
      }
    } else if (e.key === "Escape") {
      setFocused(false);
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* Search icon */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />

      {/* Input */}
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        className={`w-full pl-9 pr-8 py-2.5 text-sm border border-slate-200 rounded-xl bg-white
          focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400
          placeholder:text-slate-400 transition-all disabled:opacity-50 ${inputClassName}`}
      />

      {/* Clear button */}
      {value && (
        <button
          type="button"
          onClick={() => { onChange(""); setCorrection(null); setSuggestions([]); inputRef.current?.focus(); }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors z-10"
          tabIndex={-1}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}


      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in-0 slide-in-from-top-1 duration-150">

          {/* Autocorrect suggestion row */}
          {correction && correction !== value.toLowerCase() && (
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyValue(correction!); }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors border-b border-slate-100
                ${activeIdx === 0 ? "bg-violet-50 text-violet-700" : "hover:bg-violet-50/60 text-slate-700"}`}
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <span className="text-xs text-slate-400 shrink-0">Did you mean:</span>
              <span className="font-semibold text-violet-600 truncate">{correction}</span>
            </button>
          )}

          {/* Live suggestions */}
          {suggestions.map((sug, i) => {
            const idx = correction ? i + 1 : i;
            const q = value.toLowerCase();
            // Highlight the matching part
            const lower = sug.toLowerCase();
            const start = lower.indexOf(q);
            const before = start > 0 ? sug.slice(0, start) : "";
            const match = start >= 0 ? sug.slice(start, start + q.length) : sug;
            const after = start >= 0 ? sug.slice(start + q.length) : "";

            return (
              <button
                key={sug}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); applyValue(sug); }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors
                  ${idx === activeIdx ? "bg-slate-100 text-slate-900" : "hover:bg-slate-50 text-slate-700"}`}
              >
                <Search className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <span className="truncate">
                  {before}
                  <span className="font-semibold text-violet-600">{match}</span>
                  {after}
                </span>
                <ChevronRight className="w-3 h-3 text-slate-300 ml-auto shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
