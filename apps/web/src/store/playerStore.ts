import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QueuedTrack {
  id: string; // providerId
  internalTrackId?: string; // DB ID
  title: string;
  artist: string;
  thumbnailUrl?: string;
  provider: string;
  sources?: { provider: string; providerId: string; url: string; isOfficial: boolean }[];
}

interface PlayerState {
  currentTrack: QueuedTrack | null;
  isPlaying: boolean;
  isBuffering: boolean;
  volume: number;
  previousVolume: number;
  currentTime: number;
  duration: number;
  seekPosition: number | null;
  isAdDetected: boolean;
  setTrack: (track: QueuedTrack) => void;
  setAdDetected: (state: boolean) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setBuffering: (state: boolean) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setProgress: (currentTime: number, duration: number) => void;
  seekTo: (seconds: number) => void;
  clearSeek: () => void;
  stop: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      currentTrack: null,
      isPlaying: false,
      isBuffering: false,
      volume: 100,
      previousVolume: 100,
      currentTime: 0,
      duration: 0,
      seekPosition: null,
      isAdDetected: false,
      setTrack: (track) => set({ currentTrack: track, isPlaying: true, isBuffering: true, currentTime: 0, duration: 0, isAdDetected: false }),
      setAdDetected: (state) => set({ isAdDetected: state }),
      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false, isBuffering: false }),
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      setBuffering: (state: boolean) => set({ isBuffering: state }),
      setVolume: (volume) => set((state) => ({ volume, previousVolume: volume > 0 ? volume : state.previousVolume })),
      toggleMute: () => set((state) => ({ 
        volume: state.volume === 0 ? state.previousVolume : 0 
      })),
      setProgress: (currentTime, duration) => set({ currentTime, duration }),
      seekTo: (seconds) => set({ seekPosition: seconds }),
      clearSeek: () => set({ seekPosition: null }),
      stop: () => set({ currentTrack: null, isPlaying: false, isBuffering: false, currentTime: 0, duration: 0 }),
    }),
    {
      name: 'dignify-player-storage',
      partialize: (state) => ({ volume: state.volume, currentTrack: state.currentTrack }),
    }
  )
);
