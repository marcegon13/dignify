const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const trackService = {
  async uploadTrack(formData: FormData) {
    const res = await fetch(`${API_URL}/tracks/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `[TrackSvc] Upload failed: ${res.statusText}`);
    }
    
    return res.json();
  },

  async recordListen(id: string, userEmail: string) {
    const res = await fetch(`${API_URL}/tracks/${id}/listen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail }),
    });
    
    if (!res.ok) throw new Error(`[TrackSvc] Failed to record listen: ${res.statusText}`);
    return res.json();
  },

  async deleteTrack(id: string) {
    const res = await fetch(`${API_URL}/tracks/${id}`, {
      method: 'DELETE',
    });
    
    if (!res.ok) throw new Error(`[TrackSvc] Failed to delete track: ${res.statusText}`);
    return res.json();
  }
};
