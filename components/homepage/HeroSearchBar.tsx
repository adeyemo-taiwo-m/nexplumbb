"use client";

import { Search } from "lucide-react";
import Button from "@/components/ui/Button";

interface HeroSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent) => void;
}

export default function HeroSearchBar({
  searchQuery,
  setSearchQuery,
  handleSearch,
}: HeroSearchBarProps) {
  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-[640px] mt-10 bg-white rounded-card shadow-modal p-2 flex gap-2 items-center relative animate-fade-in-up delay-300 outline outline-2 outline-transparent focus-within:outline-teal focus-within:shadow-[0_0_0_4px_rgba(42,157,143,0.18)] transition-all duration-200"
    >
      <div className="flex-1 flex items-center gap-2 px-3">
        <Search size={18} className="text-slate" />

        <input
          type="text"
          placeholder="What do you need? e.g. leaking pipe, electrical fault..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-body font-mono text-[14px] placeholder:text-slate !outline-none !border-none !ring-0 !shadow-none focus:ring-0 focus:outline-none"
          style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
          required
        />
      </div>
      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-32 flex-shrink-0"
      >
        Search
      </Button>
    </form>
  );
}
