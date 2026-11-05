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

/**
 * Returns the automatic official YouTube video thumbnail.
 * If YouTube ID/URL exists, it automatically returns YouTube's hqdefault thumbnail.
 */
export function getYouTubeThumbnail(urlOrId: string, customThumbnail?: string): string {
  const cleanId = extractYouTubeId(urlOrId);
  if (cleanId) {
    // Official YouTube High-Quality Thumbnail
    return `https://img.youtube.com/vi/${cleanId}/hqdefault.jpg`;
  }
  if (customThumbnail && customThumbnail.trim().startsWith('http') && !customThumbnail.includes('unsplash.com')) {
    return customThumbnail.trim();
  }
  return 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&auto=format&fit=crop&q=80';
}

export function getYouTubeEmbedUrl(youtubeIdOrUrl: string, autoplay = true): string {
  const cleanId = extractYouTubeId(youtubeIdOrUrl);
  if (!cleanId) return '';
  // Enhanced security parameters:
  // - rel=0: No related videos from outside channel
  // - modestbranding=1: Hide YouTube logo from control bar
  // - iv_load_policy=3: Hide video annotations, subscribe cards, and channel overlays
  // - playsinline=1: Force mobile inline play without opening external app
  // - enablejsapi=1: Internal control
  return `https://www.youtube-nocookie.com/embed/${cleanId}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&enablejsapi=1`;
}
