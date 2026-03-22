import { Injectable } from '@nestjs/common';

export interface ResolvedTrack {
  artist: string;
  title: string;
  isOfficial: boolean;
}

@Injectable()
export class MetadataResolverService {
  /**
   * Resuelve y limpia el título de un video para extraer
   * el nombre del artista, el nombre real de la canción y determinar
   * si proviene de una fuente oficial.
   */
  public resolveTrack(rawTitle: string, channelName: string): ResolvedTrack {
    let cleanTitle = rawTitle;

    // Detectar si es oficial basado en el título o en el canal
    const lowerTitle = rawTitle.toLowerCase();
    const lowerChannel = channelName.toLowerCase();
    
    // Asumimos que es oficial si el canal termina en "vevo", "official", 
    // o si el título incluye "(official video)", etc. Esto suple el indicador
    // de canal "verificado" en búsquedas crudas.
    const isOfficial =
      lowerChannel.endsWith('vevo') ||
      lowerChannel.includes('official') ||
      lowerTitle.includes('official video') ||
      lowerTitle.includes('official audio') ||
      lowerTitle.includes('official music video');

    // Expresión regular para limpiar la basura en títulos:
    // Remover versiones oficiales, letras, calidades, etc.
    cleanTitle = cleanTitle.replace(
      /([\[\(\{])(.*?)(official|lyric|video|audio|mv|hd|hq|live|remastered|4k)(.*?)([\]\)\}])/gi,
      ''
    );

    // Remover otras colillas comunes
    cleanTitle = cleanTitle.replace(/"/g, ''); // Remover comillas dobles
    cleanTitle = cleanTitle.replace(/\s+/g, ' ').trim(); // Remover espacios múltiples

    // Separar por guiones (corto o largo)
    const parts = cleanTitle.split(/\s*[-–]\s*/);

    let resolvedArtist = channelName;
    let resolvedTitle = cleanTitle;

    if (parts.length >= 2) {
      // Formato típico: "Artista - Canción"
      resolvedArtist = parts[0].trim();
      resolvedTitle = parts.slice(1).join(' - ').trim();
    } else {
      // Si no hay guión, usamos el título completo y limpiamos el nombre del canal
      resolvedArtist = channelName.replace(/VEVO$/i, '').trim();
    }

    return {
      artist: resolvedArtist,
      title: resolvedTitle,
      isOfficial, // "Debe marcar isOfficial: true si el canal está verificado/es oficial"
    };
  }
}
