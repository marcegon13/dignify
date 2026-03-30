import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ArtistProfileClient from './ArtistProfileClient';

// Definimos el tipo de track con sus fuentes para el mapeo
type TrackWithSources = {
  id: string;
  title: string;
  genre: string | null;
  thumbnailUrl: string | null;
  sources: { url: string }[];
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string; lang: string }> }): Promise<Metadata> {
  const { slug, lang } = await params;
  return {
    alternates: {
      canonical: `/${lang}/artist/${slug}`,
    },
  };
}

export default async function ArtistPage({ params: paramsPromise }: { params: Promise<{ slug: string; lang: string }> }) {
  const { slug } = await paramsPromise;
  
  // 1. Buscamos al artista real en la base de datos por su SLUG
  const dbArtist = await prisma.artist.findFirst({
    where: { slug: slug },
    include: {
      tracks: {
        include: {
          sources: true
        }
      },
      _count: {
        select: { followers: true }
      }
    }
  });

  if (!dbArtist) {
    return notFound();
  }

  // Si encontramos artista en DB, lo mapeamos para el componente visual
  const artistData = {
    name: dbArtist.name,
    slug: dbArtist.slug || '',
    bio: dbArtist.bio || '',
    bannerImage: dbArtist.bannerImage || '',
    isVerified: dbArtist.isVerified,
    followersCount: dbArtist._count.followers,
    instagram: dbArtist.instagram || '',
    twitter: dbArtist.twitter || '',
    website: dbArtist.website || '',
    tracks: (dbArtist.tracks as TrackWithSources[]).map((t) => ({
      id: t.sources?.[0]?.url || t.id, 
      internalTrackId: t.id,
      title: t.title,
      genre: t.genre || 'OTHER',
      thumbnailUrl: t.thumbnailUrl || ''
    }))
  };

  return (
    <div className="md:ml-0 min-h-screen bg-black overflow-x-hidden relative">
      {/* VISUAL WITNESS: Barra amarilla de validación de despliegue */}
      <div className="fixed top-0 left-0 w-full bg-yellow-500 text-black text-center z-50 font-bold py-1 shadow-lg text-xs uppercase tracking-widest">
        UI UPDATE ACTIVE - MARCELO
      </div>
      <ArtistProfileClient artist={artistData} />
    </div>
  );
}
