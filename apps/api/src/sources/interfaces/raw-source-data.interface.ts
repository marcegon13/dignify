export interface RawSourceData {
  provider: 'YOUTUBE' | 'SOUNDCLOUD' | 'BANDCAMP' | 'SELF_HOSTED';
  providerId: string;
  title: string;
  artistName: string;
  duration?: number; // duration in seconds
  url: string;
  thumbnailUrl?: string;
  quality?: string; // HD, LQ
  isrc?: string;
  viewCount?: number;
}
