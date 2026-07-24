"use client";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages, Check } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English",    native: "English" },
  { code: "hi", label: "Hindi",      native: "हिंदी" },
  { code: "ta", label: "Tamil",      native: "தமிழ்" },
  { code: "te", label: "Telugu",     native: "తెలుగు" },
  { code: "mr", label: "Marathi",    native: "मराठी" },
  { code: "bn", label: "Bengali",    native: "বাংলা" },
  { code: "gu", label: "Gujarati",   native: "ગુજરાતી" },
  { code: "kn", label: "Kannada",    native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam",  native: "മലയാളം" },
  { code: "pa", label: "Punjabi",    native: "ਪੰਜਾਬੀ" },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 font-medium">
          <Languages className="h-4 w-4" />
          <span>{current.native}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 max-h-80 overflow-y-auto">
        {LANGUAGES.map((lang, idx) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className="flex items-center justify-between gap-2"
          >
            <span className="flex items-center gap-2">
              <span className="text-sm font-medium">{lang.native}</span>
              <span className="text-xs text-muted-foreground">{lang.label}</span>
            </span>
            {i18n.language === lang.code && (
              <Check className="h-4 w-4 text-primary shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
