'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2 } from 'lucide-react';
import { TrackItem } from '@/components/shared/TrackItem';
import { useI18n } from '@/providers/I18nProvider';

export default function Home() {
  const { data: session } = useSession();
  const { dict } = useI18n();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce the input by 500ms so we don't spam the API
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isFetching, error } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/search/semantic?q=${encodeURIComponent(debouncedQuery)}`);
      if (!res.ok) throw new Error('Búsqueda fallida');
      const json = await res.json();
      return json.data || [];
    },
    enabled: debouncedQuery.trim().length > 0,
  });

  const { data: recommended } = useQuery({
    queryKey: ['recommended'],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const emailQuery = session?.user?.email ? `?email=${encodeURIComponent(session.user.email)}` : '';
      const res = await fetch(`${apiUrl}/recommended${emailQuery}`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
    enabled: debouncedQuery.trim().length === 0,
  });

  return (
    <div className="flex flex-col bg-linear-to-b from-neutral-900/50 to-neutral-950/90 px-4 md:px-6 py-4 pb-48">
      
      {/* Search Input Area */}
      <div className="sticky top-0 z-10 bg-neutral-950/80 backdrop-blur-2xl border-b border-white/5 pb-4 pt-2 -mx-4 md:-mx-6 px-4 md:px-6 mb-6 shadow-sm">
        <div className="relative w-full max-w-3xl mx-auto group">
          <div className="absolute inset-y-0 left-0 pl-4 md:pl-6 flex items-center pointer-events-none">
            {isFetching ? (
              <Loader2 className="h-5 w-5 md:h-6 md:w-6 text-emerald-400 animate-spin" />
            ) : (
              <Search className="h-5 w-5 md:h-6 md:w-6 text-neutral-400 font-bold group-hover:text-emerald-400 transition-colors" />
            )}
          </div>
          <input
            type="text"
            className="block w-full pl-12 md:pl-16 pr-6 py-2.5 md:py-4 bg-white/5 border border-white/10 rounded-2xl text-sm md:text-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white/10 transition-all font-medium backdrop-blur-md shadow-2xl"
            placeholder={dict.home.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-[1400px] mx-auto">
        
        {/* Recommended State (Replaces generic empty state) */}
        {!debouncedQuery && (
          <div className="mt-4 md:mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center space-x-3 mb-6 md:mb-10">
              <h2 className="text-xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-emerald-100 to-emerald-500/50 tracking-tight">
                {dict.home.catalogTitle}
              </h2>
            </div>
            {recommended && recommended.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 gap-y-8 md:gap-y-10">
                {recommended.map((track: any) => (
                  <TrackItem key={`rec-${track.id}`} track={track} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center mt-16 md:mt-32 p-6 md:p-12 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-lg text-center">
                <Search className="w-12 h-12 md:w-16 md:h-16 mb-6 text-neutral-600" />
                <p className="text-lg md:text-xl font-medium text-neutral-300">{dict.home.emptyCatalog}</p>
                <p className="text-xs md:text-sm text-neutral-500 mt-2">{dict.home.startSearching}</p>
              </div>
            )}
          </div>
        )}

        {/* Loading State or Errors */}
        {error && (
          <div className="text-red-400 text-center mt-10 p-6 bg-red-900/10 border border-red-900/50 rounded-2xl backdrop-blur-md font-medium text-sm">
            {dict.common.errorServer}
          </div>
        )}

        {/* Results Grid */}
        {results && results.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg md:text-2xl font-bold text-white mb-6 md:mb-8 tracking-tight flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-3 animate-pulse"></span>
              {dict.home?.searchPrecision || "High Precision Search"}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 gap-y-8 md:gap-y-10">
              {results.map((track: any, index: number) => (
                <TrackItem key={`search-${track.id || index}`} track={track} />
              ))}
            </div>
          </div>
        )}

        {/* No Results found */}
        {results && results.length === 0 && !isFetching && debouncedQuery && (
          <div className="text-center mt-16 md:mt-32 p-8 md:p-12 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-lg">
            <span className="text-4xl md:text-5xl block mb-6">🛸</span>
            <p className="text-neutral-300 font-medium text-lg md:text-xl">{dict.home.noResults} "{debouncedQuery}".</p>
            <p className="text-xs md:text-sm text-neutral-500 mt-2">{dict.home.libraryAlive}</p>
          </div>
        )}
        
      </div>
    </div>
  );
}
