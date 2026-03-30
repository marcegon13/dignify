const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const userService = {
  async getUserProfile(email: string) {
    const res = await fetch(`${API_URL}/users/${encodeURIComponent(email)}`);
    if (!res.ok) throw new Error(`[UserSvc] Failed to fetch profile: ${res.statusText}`);
    const json = await res.json();
    return json.data;
  },

  async getProfileStats(email: string) {
    const res = await fetch(`${API_URL}/profile/stats/${encodeURIComponent(email)}`);
    if (!res.ok) return { discoveries: 0, favorites: 0, playlists: 0 };
    return res.json();
  },

  async updateProfile(email: string, data: { name?: string; birthDate?: string; role?: string }) {
    const res = await fetch(`${API_URL}/users/${encodeURIComponent(email)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `[UserSvc] Update failed: ${res.statusText}`);
    }
    
    return res.json();
  },

  async updateCauses(email: string, causes: string[]) {
    const res = await fetch(`${API_URL}/users/${encodeURIComponent(email)}/causes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ causes }),
    });
    
    if (!res.ok) throw new Error(`[UserSvc] Failed to update causes: ${res.statusText}`);
    return res.json();
  },

  async uploadAvatar(email: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${API_URL}/users/${encodeURIComponent(email)}/avatar`, {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `[UserSvc] Upload failed: ${res.statusText}`);
    }
    
    return res.json();
  }
};
