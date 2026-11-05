export interface Movie {
  id: string;
  title: string;
  category: string;
  badgeLabel?: string; // e.g. "South Hindi Dubbed Movie", "Bollywood Hindi Movies"
  badgeColor?: 'red' | 'green' | 'blue' | 'orange';
  titleColor?: 'red' | 'green' | 'blue' | 'orange';
  genres: string[];
  year: string;
  poster: string;
  audio: string;
  quality: string;
  description: string;
  duration?: string; // e.g. "2h 40min"
  releaseDate?: string;
  language?: string; // e.g. "Hindi + Kannada"
  starcast?: string;
  rating?: string;
  views?: number;
  downloadUrl?: string;
  teraboxUrl?: string;
  driveUrl?: string;
  fastDownloadUrl?: string;
  streamUrl?: string;
  fileSizes?: {
    p1080?: string;
    p720?: string;
    p480?: string;
  };
  screenshots?: string[];
  featured?: boolean;
  createdAt: string;
}

export interface SeriesEpisode {
  id: string;
  episodeNumber: number;
  title: string;
  badge?: string;
  youtubeUrl: string;
  youtubeId: string;
  thumbnail?: string;
  duration?: string;
  description?: string;
}

export interface Series {
  id: string;
  title: string;
  category: string;
  badgeLabel?: string;
  badgeColor?: 'red' | 'green' | 'blue' | 'orange' | 'purple';
  poster: string;
  year?: string;
  quality?: string;
  description?: string;
  isYouTubeSeries: true;
  episodes: SeriesEpisode[];
  createdAt: string;
}

export interface SiteSettings {
  adminPasswordHash?: string;
  siteTitle: string;
  headerLogoUrl: string;
  appLogoUrl: string;
  noticeBanner: string;
  showNotice: boolean;
  telegramUrl: string;
  telegramLabel?: string;
  whatsappUrl: string;
  contactUrl?: string; // Direct Contact link (WhatsApp / Phone / Support link)
  contactLabel?: string; // Optional custom title, defaults to 'Contact'
  shareInviteUrl?: string; // Invite friends share link
  searchRedirectUrl?: string; // Direct search redirect link
  searchModalTitle?: string;
  searchButton1Text?: string;
  searchButton1Url?: string;
  searchButton2Text?: string;
  searchButton2Url?: string;
  quickBox1Text?: string; // e.g. "Trending movie"
  quickBox1Url?: string; // e.g. "https://videodownloader.site"
  quickBox1Active?: boolean;
  quickBox2Text?: string; // e.g. "18+"
  quickBox2Url?: string; // e.g. "https://tinyurl.com/2waz6wm2"
  quickBox2Active?: boolean;
  imgbbApiKey?: string;
  youtubeApiKey?: string; // YouTube Data API v3 Key
  apkVersion: string;
  apkDownloadUrl: string;
  apkUpdateChangelog: string;
  forceApkUpdate: boolean;
  homeFeedAd?: {
    active: boolean;
    scriptCode: string;
    interval?: number;
  };
  bannerAd?: {
    active: boolean;
    imageUrl: string;
    targetUrl: string;
    scriptCode?: string;
  };
  movieDetailAd?: {
    active: boolean;
    scriptCode?: string;
    imageUrl?: string;
    targetUrl?: string;
  };
  popupAd?: {
    active: boolean;
    title: string;
    imageUrl: string;
    targetUrl: string;
    buttonText: string;
  };
  directAdLink?: string;
  customAdCode?: string;
  sponsored1: {
    title: string;
    tag: string;
    url: string;
    active: boolean;
  };
  sponsored2: {
    title: string;
    tag: string;
    url: string;
    active: boolean;
  };
  inFeedSponsored: {
    title: string;
    tag: string;
    url: string;
    active: boolean;
  };
  appsSponsoredAd?: {
    active: boolean;
    title: string;
    subtitle?: string;
    imageUrl?: string;
    iconUrl?: string;
    targetUrl: string;
    buttonText: string;
    scriptCode?: string;
  };
  downloadPageAd?: {
    active: boolean;
    scriptCode: string;
    count?: number;
  };
  appsPageAd?: {
    active: boolean;
    scriptCode?: string;
  };
  musicPageAd?: {
    active: boolean;
    scriptCode?: string;
    scriptCode1?: string;
    scriptCode2?: string;
  };
}

export interface AppShortcut {
  id: string;
  title: string; // e.g. "YouTube", "PKPK-88", "Q880-506"
  url: string; // Target link when clicked
  iconUrl: string; // Image icon URL (ImgBB or clean web URL)
  section: 'Favorite' | 'Paisa Kamao' | string;
  badge?: string; // Optional e.g. "HOT", "NEW"
  order?: number;
  active: boolean;
  createdAt?: string;
}

export interface MusicTrack {
  id: string;
  youtubeId: string; // e.g. "yG7X9kP1Q4I"
  youtubeUrl: string; // e.g. "https://music.youtube.com/watch?v=..."
  title: string;
  artist: string;
  views: string; // e.g. "819K views"
  duration: string; // e.g. "7:02"
  thumbnail: string;
  category: string; // "Covers and remixes" | "Relax" | "Energize" | "Feel good" | "Workout" | "Bangla Lofi"
  likesCount?: string;
  commentsCount?: string;
  hasAiTag?: boolean;
  createdAt?: string;
}

export interface ApkAnalytics {
  totalDownloads: number;
  totalDevices: number;
  activeDevices: number;
  lastUpdated?: string;
}

export interface InstalledDevice {
  deviceId: string;
  platform: string;
  deviceModel: string;
  appVersion: string;
  isApk: boolean;
  installedAt: string;
  lastSeen: string;
  totalOpens: number;
  screenResolution?: string;
  language?: string;
}

