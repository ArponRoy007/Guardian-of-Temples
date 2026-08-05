"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Church, X, Loader2 } from "lucide-react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { createClient } from "@/lib/supabase/client";

export interface SearchSuggestion {
  id: string;
  type: "district" | "temple";
  titleEn: string;
  titleBn?: string;
  subtitle?: string;
  geoCode?: string;
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  initialValue?: string;
}

export function SearchBar({
  placeholder = "Search district (e.g. Cumilla, চট্টগ্রাম) or temple...",
  className = "",
  initialValue = "",
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Query Supabase for matching districts and temples
  useEffect(() => {
    async function fetchSuggestions() {
      const searchTerm = debouncedQuery.trim();
      if (!searchTerm || searchTerm.length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      try {
        // Query Districts (English and Bangla)
        const { data: districtData } = await supabase
          .from("districts")
          .select("id, name_en, name_bn, division, geo_code")
          .or(`name_en.ilike.%${searchTerm}%,name_bn.ilike.%${searchTerm}%`)
          .limit(4);

        // Query Temples
        const { data: templeData } = await supabase
          .from("temples")
          .select("id, name, address_text")
          .ilike("name", `%${searchTerm}%`)
          .limit(4);

        const results: SearchSuggestion[] = [];

        if (districtData) {
          districtData.forEach((d) => {
            results.push({
              id: `dist-${d.id}`,
              type: "district",
              titleEn: d.name_en,
              titleBn: d.name_bn,
              subtitle: `Division: ${d.division}`,
              geoCode: d.geo_code,
            });
          });
        }

        if (templeData) {
          templeData.forEach((t) => {
            results.push({
              id: `temp-${t.id}`,
              type: "temple",
              titleEn: t.name,
              subtitle: t.address_text || "Temple Location",
            });
          });
        }

        setSuggestions(results);
        setIsOpen(results.length > 0);
        setSelectedIndex(-1);
      } catch (err) {
        console.error("Search suggestion query error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSuggestions();
  }, [debouncedQuery]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: SearchSuggestion) => {
    setQuery(item.titleEn);
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(item.titleEn)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSelect(suggestions[selectedIndex]);
    } else if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative flex items-center w-full">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && suggestions.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 pl-10 pr-9 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 shadow-md backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Typeahead Suggestions Dropdown Overlay */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl backdrop-blur-md overflow-hidden max-h-72 overflow-y-auto">
          {suggestions.map((item, index) => {
            const isSelected = index === selectedIndex;
            return (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-primary-50 dark:bg-primary-950/60 text-primary-900 dark:text-primary-200"
                    : "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.type === "district" ? (
                    <MapPin className="h-4 w-4 shrink-0 text-primary-500" />
                  ) : (
                    <Church className="h-4 w-4 shrink-0 text-amber-500" />
                  )}
                  <div className="truncate">
                    <div className="font-semibold flex items-center gap-1.5">
                      <span className="truncate">{item.titleEn}</span>
                      {item.titleBn && (
                        <span className="text-[11px] font-normal text-slate-400">
                          ({item.titleBn})
                        </span>
                      )}
                    </div>
                    {item.subtitle && (
                      <p className="text-[10px] text-slate-400 truncate">{item.subtitle}</p>
                    )}
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    item.type === "district"
                      ? "bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300"
                      : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {item.type}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
