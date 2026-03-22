'use client';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '@/providers/I18nProvider';
import { TrackItem } from '@/components/shared/TrackItem';
import { Compass, Sparkles, Waves, Zap, Mic2, Gem, HeartHandshake, Loader2 } from 'lucide-react';

export default function ExplorePage() {
  const { data: session } = useSession();
  const { dict } = useI18n();
  const userEmail = session?.user?.email;

  const fetchCategory = async (query: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    try {
      const emailQuery = userEmail ? `&email=${encodeURIComponent(userEmail)}` : '';
      const res = await fetch(`${apiUrl}/search/semantic?q=${encodeURIComponent(query)}${emailQuery}`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch (error) {
      console.error("Explore fetch error:", error);
      return [];
    }
  };

  const { data: sections, isLoading } = useQuery({
    queryKey: ['explore-sections', userEmail],
    queryFn: async () => {
      const fetchRecommendedCauses = async () => {
        if (!userEmail) return [];
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        try {
          const res = await fetch(`${apiUrl}/recommended?email=${encodeURIComponent(userEmail)}`);
          if (!res.ok) return [];
          const json = await res.json();
          return (json.data || []).filter((t: any) => t.cause);
        } catch(e) { return []; }
      };

      const [surfTracks, focusTracks, refiTracks, newTracks, hiddenGemsTracks, causesTracks] = await Promise.all([
        fetchCategory('surf vibes chill indie'),
        fetchCategory('focus deep work electronic'),
        fetchCategory('independent refi native'),
        fetchCategory('newest trending hits'),
        fetchCategory('hidden gems zero discovery'),
        fetchRecommendedCauses()
      ]);

      const baseSections = [
        { title: dict.explore?.categories?.surf || "Surf & Vibes", icon: <Waves className="w-5 h-5 text-cyan-400" />, tracks: surfTracks.slice(0, 5) },
        { title: dict.explore?.categories?.focus || "Focus & Deep Work", icon: <Zap className="w-5 h-5 text-amber-500" />, tracks: focusTracks.slice(1, 6).reverse() },
        { title: dict.explore?.categories?.refi || "Independent ReFi", icon: <Sparkles className="w-5 h-5 text-emerald-400" />, tracks: refiTracks.slice(2, 7) },
        { title: dict.explore?.categories?.new || "Novedades Indie", icon: <Mic2 className="w-5 h-5 text-pink-500" />, tracks: newTracks.slice(0, 8).reverse() },
        { title: dict.refi?.hiddenGems || "Joyas Ocultas", icon: <Gem className="w-5 h-5 text-purple-500" />, tracks: hiddenGemsTracks.slice(0, 5) },
      ];

      if (userEmail && causesTracks.length > 0) {
        baseSections.unshift({
          title: "Artistas y Causas que Apoyas",
          icon: <HeartHandshake className="w-5 h-5 text-red-400" />,
          tracks: causesTracks.slice(0, 5)
        });
      }
      return baseSections;
    }
  });

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <Compass className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-neutral-400">
              {dict.explore?.title || "Explorar"}
            </h1>
            <p className="text-neutral-500 text-sm font-medium mt-1">Descubrimiento Inteligente ReFi y ODS.</p>
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
          <p className="text-neutral-500 font-bold uppercase tracking-widest text-sm">Buscando resonancias sociales...</p>
        </div>
      ) : (
        <div className="space-y-14">
          {sections?.map((section, i) => (
            <section key={i} className="animate-in fade-in slide-in-from-bottom-[20px]" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-center space-x-2 mb-6 border-b border-white/5 pb-3">
                {section.icon}
                <h2 className="text-xl font-bold text-white/90 tracking-wide">{section.title}</h2>
              </div>
              {section.tracks && section.tracks.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {section.tracks.map((track: any) => (
                    <TrackItem key={track.id} track={track} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500 italic">No se encontraron pistas para esta categoría.</p>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
