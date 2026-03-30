'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18n } from '@/providers/I18nProvider';
import { Music, UploadCloud, PlayCircle, Plus, X, FileAudio, CheckCircle, Image as ImageIcon, Loader2, Trash2, Youtube, Music2, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { TrackItem } from '@/components/shared/TrackItem';
import Image from 'next/image';

export default function ArtistDashboard() {
  const { data: session } = useSession();
  const { dict } = useI18n();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal form states
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [price, setPrice] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [cause, setCause] = useState('');
  const [fileSelected, setFileSelected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const artistUserEmail = session?.user?.email;

  const { data: myTracks, isLoading } = useQuery({
    queryKey: ['artist-tracks', artistUserEmail],
    queryFn: async () => {
      if (!artistUserEmail) return [];
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      // MOCK O REAL ENDPOINT: GET /tracks/artist/:email
      const res = await fetch(`${apiUrl}/tracks/artist/${encodeURIComponent(artistUserEmail)}`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!artistUserEmail
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      // Simulate file upload delay
      await new Promise(r => setTimeout(r, 2000));
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/tracks/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          genre,
          price: price ? parseFloat(price) : null,
          userEmail: artistUserEmail,
          coverUrl: coverUrl || undefined,
          cause: cause || undefined
        })
      });

      if (!res.ok) throw new Error('Failed to save to Prisma');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-tracks'] });
      setTimeout(() => {
        setIsModalOpen(false);
        setTitle('');
        setGenre('');
        setPrice('');
        setCoverUrl('');
        setCause('');
        setFileSelected(false);
      }, 1000);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (internalTrackId: string) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/tracks/${internalTrackId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete track');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-tracks'] });
    }
  });

  const handleSimulatedUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileSelected) return;
    uploadMutation.mutate();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFileSelected(false);
      return;
    }
    setFileSelected(true);
    setIsScanning(true);
    
    try {
      // Import dinámico de libreria
      const mm = await import('music-metadata-browser');
      const metadata = await mm.parseBlob(file);
      
      const { title: mTitle, genre: mGenre, picture } = metadata.common;
      
      if (mTitle) setTitle(mTitle);
      if (mGenre && mGenre.length > 0) setGenre(mGenre[0]);
      
      if (picture && picture.length > 0) {
        const pic = picture[0];
        const blob = new Blob([new Uint8Array(pic.data)], { type: pic.format });
        setCoverUrl(URL.createObjectURL(blob));
      }
    } catch (err) {
      console.log('No metadata found or error parsing ID3:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const totalPlays = myTracks ? myTracks.length * 1520 : 0; // Mock de reproducciones

  const upgradeMutation = useMutation({
    mutationFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/users/${encodeURIComponent(session?.user?.email || '')}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'ARTIST' })
      });
      if (!res.ok) throw new Error('Error al elevar a artista');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      // Aquí podrías usar un toast pero el alert sirve para el prototipo
      alert("¡Felicidades!");
    }
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', session?.user?.email],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/users/${encodeURIComponent(session?.user?.email || '')}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
    enabled: !!session?.user?.email
  });

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <UploadCloud className="w-16 h-16 text-neutral-600 mb-6" />
        <h2 className="text-2xl font-bold mb-2 text-white">{dict.artist.accessDenied}</h2>
        <p className="text-neutral-500 mb-6">{dict.artist.mustLogin}</p>
        <button 
          onClick={() => signIn()}
          className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-3 rounded-full font-bold shadow-xl shadow-emerald-500/20 transition-all hover:scale-105"
        >
          {dict.artist.login}
        </button>
      </div>
    );
  }

  const isArtist = userProfile?.role === 'ARTIST';

  if (!isArtist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-10 text-center max-w-2xl mx-auto">
        <div className="w-24 h-24 bg-linear-to-br from-emerald-500/20 to-blue-500/20 rounded-3xl border border-white/10 flex items-center justify-center mb-8 shadow-3xl">
          <Music className="w-12 h-12 text-emerald-400" />
        </div>
        <h2 className="text-3xl font-black text-white mb-4 tracking-tighter">{dict.artist.areYouArtist}</h2>
        <p className="text-neutral-400 mb-8 text-lg leading-relaxed">
          {dict.artist.upgradeDesc}
        </p>
        <button 
          onClick={() => upgradeMutation.mutate()}
          className="group relative px-10 py-5 bg-white text-black font-black rounded-2xl hover:bg-emerald-400 transition-all shadow-2xl flex items-center space-x-3 active:scale-95"
          disabled={upgradeMutation.isPending}
        >
          {upgradeMutation.isPending ? (
             <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
             <>
               <CheckCircle className="w-6 h-6 text-emerald-600 group-hover:text-black" />
               <span className="text-sm uppercase tracking-widest">{dict.artist.activateRole}</span>
             </>
          )}
        </button>
        <p className="text-neutral-600 text-xs mt-6 uppercase tracking-widest font-bold">{dict.artist.irrevocable}</p>
      </div>
    );
  }

  return (
    <div className="p-8 pb-32 max-w-6xl mx-auto">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center space-x-5">
          <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center border border-white/5 overflow-hidden shrink-0">
            {session.user?.image ? (
              <Image src={session.user.image} alt={session.user.name || ''} width={80} height={80} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold uppercase">{session.user?.name?.[0] || 'A'}</span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#FFEFB7] to-[#E6C200]">
                {dict.artist.dashboard}
              </h1>
              {userProfile?.isVerified && (
                <div className="flex items-center group relative cursor-help" title={dict.artist.verifiedOriginal}>
                  <ShieldCheck className="w-6 h-6 text-blue-400 fill-blue-400/20" />
                  <span className="absolute left-full ml-2 px-2 py-1 bg-blue-500 text-[10px] text-white font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{dict.artist.originalBadge}</span>
                </div>
              )}
            </div>
            <p className="text-emerald-400 font-medium">@{session.user?.name}</p>
          </div>
        </div>

        {/* OAuth Verification Section */}
        <div className="flex flex-col space-y-2">
             <div className="flex items-center space-x-3 bg-neutral-900/80 p-2 rounded-2xl border border-white/5 shadow-inner">
                <button 
                  onClick={async () => {
                    const link = prompt(dict.artist.linkSpotify + ":");
                    if (link) {
                      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                      await fetch(`${apiUrl}/users/${session.user?.email}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ spotifyLink: link, isVerified: true })
                      });
                      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
                    }
                  }}
                  className={`p-2.5 rounded-xl transition-all flex items-center space-x-2 ${userProfile?.spotifyLink ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-500 hover:text-white border border-transparent'}`}
                  title={dict.artist.linkSpotify}
                >
                  <Music2 className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter hidden sm:inline">{userProfile?.spotifyLink ? dict.artist.verified : dict.artist.linkSpotify}</span>
                </button>
                
                <button 
                  onClick={async () => {
                    const link = prompt(dict.artist.linkYoutube + ":");
                    if (link) {
                      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                      await fetch(`${apiUrl}/users/${session.user?.email}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ youtubeLink: link, isVerified: true })
                      });
                      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
                    }
                  }}
                  className={`p-2.5 rounded-xl transition-all flex items-center space-x-2 ${userProfile?.youtubeLink ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-neutral-800 text-neutral-500 hover:text-white border border-transparent'}`}
                  title={dict.artist.linkYoutube}
                >
                  <Youtube className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter hidden sm:inline">{userProfile?.youtubeLink ? dict.artist.verified : dict.artist.linkYoutube}</span>
                </button>
                
                <div className="pr-4 border-l border-white/10 pl-3">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">{dict.artist.status}</p>
                   <p className={`text-xs font-bold uppercase tracking-tight ${userProfile?.isVerified ? 'text-blue-400' : 'text-amber-500'}`}>
                      {userProfile?.isVerified ? dict.artist.verified : dict.artist.pending}
                   </p>
                </div>
             </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="bg-neutral-900/50 border border-white/5 px-6 py-4 rounded-2xl text-center">
            <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest mb-1">{dict.artist.totalPlays}</p>
            <p className="text-white text-2xl font-black">{totalPlays.toLocaleString()}</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-500/20 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>{dict.artist.uploadNew}</span>
          </button>
        </div>
      </div>

      {/* Track List */}
      <div>
        <h3 className="text-xl font-bold mb-6 text-white tracking-wide border-b border-white/5 pb-3">
          {dict.artist.myTracks}
        </h3>
        
        {isLoading ? (
          <div className="flex space-x-3 items-center text-neutral-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{dict.artist.loadingTracks}</span>
          </div>
        ) : myTracks && myTracks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {myTracks.map((track: any) => (
              <div key={track.id} className="relative group">
                <div className={`relative ${track.status === 'PENDING' ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}>
                   <TrackItem track={track} />
                   {track.status === 'PENDING' && (
                     <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500/80 backdrop-blur-md rounded-lg flex items-center space-x-1 border border-amber-400/30">
                        <Clock className="w-3 h-3 text-white animate-pulse" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-tighter">{dict.artist.inReview}</span>
                     </div>
                   )}
                </div>
                {track.status === 'APPROVED' && (
                  <div className="absolute top-2 right-2 p-1.5 bg-emerald-500 rounded-lg shadow-xl" title={dict.artist.publicCatalogActivated}>
                    <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                  </div>
                )}
                <button 
                  onClick={() => {
                    if (window.confirm(dict.artist.deleteConfirm)) {
                      deleteMutation.mutate(track.internalTrackId);
                    }
                  }}
                  className="absolute -top-3 -right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:scale-110 transition-all shadow-xl z-10"
                  title="Eliminar Track"
                >
                  {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-neutral-900/30 rounded-3xl border border-white/5 border-dashed">
            <Music className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <p className="text-xl font-medium text-neutral-400 mb-2">{dict.artist.noTracksYet}</p>
            <p className="text-sm text-neutral-600 mb-6">{dict.artist.noTracksDesc}</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full transition-colors text-sm font-bold"
            >
              {dict.artist.startUploading}
            </button>
          </div>
        )}
      </div>

      {/* UPLOAD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-100 animate-in fade-in">
          <div className="bg-neutral-900 border border-white/10 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold flex items-center">
                <UploadCloud className="w-5 h-5 mr-3 text-emerald-400" />
                {dict.artist.uploadDialog.title}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSimulatedUpload} className="p-6 space-y-6">
              
              {/* File Drag and Drop / Selector */}
              <div className={`border-2 border-dashed ${fileSelected ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-neutral-700 hover:border-emerald-500/50'} rounded-2xl p-8 text-center transition-colors group cursor-pointer relative overflow-hidden`}>
                <input required type="file" accept=".mp3,.wav" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                
                {isScanning ? (
                  <Loader2 className="w-10 h-10 mx-auto mb-3 text-emerald-400 animate-spin" />
                ) : (
                  <FileAudio className={`w-10 h-10 mx-auto mb-3 transition-colors ${fileSelected ? 'text-emerald-400' : 'text-neutral-500 group-hover:text-emerald-400'}`} />
                )}
                
                <p className={`font-bold ${fileSelected ? 'text-emerald-400' : 'text-neutral-300'}`}>
                  {isScanning ? 'Escaneando metadatos ID3...' : fileSelected ? 'Archivo de audio cargado' : dict.artist.uploadDialog.audioFile}
                </p>
                {!fileSelected && <p className="text-neutral-500 text-xs mt-1">.WAV o .MP3 nativo (High Fidelity)</p>}
              </div>

              {/* Text Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">{dict.artist.uploadDialog.trackTitle}</label>
                  <input required value={title} onChange={e => setTitle(e.target.value)} type="text" className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400 transition-colors text-sm" placeholder="Ej. Horizonte Persistente" />
                </div>
                
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">{dict.artist.uploadDialog.genre}</label>
                    <input required value={genre} onChange={e => setGenre(e.target.value)} type="text" className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400 transition-colors text-sm" placeholder="Ej. Surf Rock" />
                  </div>
                  <div className="w-1/3">
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">{dict.artist.uploadDialog.price}</label>
                    <input value={price} onChange={e => setPrice(e.target.value)} type="number" step="0.01" className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400 transition-colors text-sm" placeholder="0.00" />
                  </div>
                </div>

                <div className="w-full mt-2">
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Causa ReFi (Opcional)</label>
                  <select value={cause} onChange={e => setCause(e.target.value)} className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-emerald-400 font-medium focus:outline-none focus:border-emerald-400 transition-colors text-sm appearance-none cursor-pointer">
                    <option value="">Ninguna causa particular</option>
                    <option value="CLIMATE">🌍 Acción por el Clima</option>
                    <option value="EDUCATION">📚 Educación de calidad</option>
                    <option value="HUNGER">🍎 Hambre Cero</option>
                    <option value="OCEANS">💧 Conservación de Océanos</option>
                    <option value="PEACE">⚖️ Paz y Justicia</option>
                    <option value="GENDER">👥 Igualdad de Género</option>
                  </select>
                </div>
              </div>

              {/* Cover Upload (URL Form) */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-black border border-neutral-800 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                  {coverUrl ? <img src={coverUrl} className="w-full h-full object-cover" alt="cover" /> : <ImageIcon className="w-6 h-6 text-neutral-600" />}
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">{dict.artist.uploadDialog.coverImage}</label>
                  <input value={coverUrl} onChange={e => setCoverUrl(e.target.value)} type="url" className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-400 transition-colors text-sm" placeholder="https://ejemplo.com/fotaza.jpg" />
                  <p className="text-[10px] text-neutral-500 mt-1">Pega una URL pública de imagen de alta calidad.</p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-white/5">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-bold text-neutral-400 hover:text-white transition-colors"
                >
                  {dict.artist.uploadDialog.cancel}
                </button>
                <button 
                  type="submit" 
                  disabled={uploadMutation.isPending || uploadMutation.isSuccess || !fileSelected}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center transition-all ${
                    uploadMutation.isPending ? 'bg-emerald-500/50 cursor-not-allowed' : 
                    uploadMutation.isSuccess ? 'bg-emerald-500 text-black' : 
                    (!title || !genre || !fileSelected) ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' :
                    'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20'
                  }`}
                >
                  {uploadMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {dict.artist.uploadDialog.uploading}</>
                  ) : uploadMutation.isSuccess ? (
                    <><CheckCircle className="w-4 h-4 mr-2" /> {dict.artist.uploadDialog.success}</>
                  ) : (
                    dict.artist.uploadDialog.save
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
