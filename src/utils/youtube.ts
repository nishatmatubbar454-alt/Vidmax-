/**
 * YouTube Utility functions for extracting IDs, embed URLs, and thumbnails
 */

export function extractYouTubeId(urlOrId: string): string {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();

  // If already an 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex covering standard watch, shorts, embed, youtu.be, and mobile URLs
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regExp);

  return match && match[1] ? match[1] : '';
}

export function getYouTubeThumbnail(youtubeId: string, customThumbnail?: string): string {
  if (customThumbnail && customThumbnail.trim().startsWith('http')) {
    return customThumbnail.trim();
  }
  const cleanId = extractYouTubeId(youtubeId);
  if (!cleanId) {
    return 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&auto=format&fit=crop&q=80';
  }
  return `https://img.youtube.com/vi/${cleanId}/hqdefault.jpg`;
}

export function getYouTubeEmbedUrl(youtubeId: string, autoplay = true): string {
  const cleanId = extractYouTubeId(youtubeId);
  if (!cleanId) return '';
  return `https://www.youtube-nocookie.com/embed/${cleanId}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;
}
