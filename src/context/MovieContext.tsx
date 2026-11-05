import React, { createContext, useContext, useState, useEffect } from 'react';
import { Movie, SiteSettings, MusicTrack, AppShortcut, Series, SeriesEpisode } from '../types';
import { INITIAL_MOVIES, INITIAL_SETTINGS, INITIAL_MUSIC_TRACKS, INITIAL_APP_SHORTCUTS, INITIAL_SERIES } from '../initialData';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc,
  arrayUnion 
} from 'firebase/firestore';
import { hashPassword } from '../utils/crypto';

interface MovieContextType {
  movies: Movie[];
  settings: SiteSettings;
  loading: boolean;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedMovie: Movie | null;
  setSelectedMovie: (movie: Movie | null) => void;
  isAdminLoggedIn: boolean;
  adminModalOpen: boolean;
  setAdminModalOpen: (open: boolean) => void;
  editMovieModalOpen: boolean;
  setEditMovieModalOpen: (open: boolean) => void;
  editingMovie: Movie | null;
  setEditingMovie: (movie: Movie | null) => void;
  apkUpdateModalOpen: boolean;
  setApkUpdateModalOpen: (open: boolean) => void;
  searchChoiceModalOpen: boolean;
  setSearchChoiceModalOpen: (open: boolean) => void;
  installPwaModalOpen: boolean;
  setInstallPwaModalOpen: (open: boolean) => void;
  activeTab: 'home' | 'music' | 'apps' | 'ai' | 'download' | 'more';
  setActiveTab: (tab: 'home' | 'music' | 'apps' | 'ai' | 'download' | 'more') => void;
  addMovie: (movieData: Omit<Movie, 'id' | 'createdAt'>) => Promise<boolean>;
  updateMovie: (id: string, updates: Partial<Movie>) => Promise<boolean>;
  deleteMovie: (id: string) => Promise<boolean>;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<boolean>;
  loginAdmin: (password: string) => Promise<boolean>;
  logoutAdmin: () => void;
  changeAdminPassword: (newPass: string) => Promise<boolean>;
  seedDefaultMovies: () => Promise<void>;
  downloadList: Movie[];
  addToDownloads: (movie: Movie) => void;
  removeFromDownloads: (id: string) => void;

  // Apps Hub / Shortcuts System
  appShortcuts: AppShortcut[];
  addAppShortcut: (shortcutData: Omit<AppShortcut, 'id' | 'createdAt'>) => Promise<boolean>;
  updateAppShortcut: (id: string, updates: Partial<AppShortcut>) => Promise<boolean>;
  deleteAppShortcut: (id: string) => Promise<boolean>;
  seedDefaultAppShortcuts: () => Promise<void>;

  // YouTube Music System
  musicTracks: MusicTrack[];
  currentTrack: MusicTrack | null;
  isPlayingMusic: boolean;
  isPlayerModalOpen: boolean;
  playerMode: 'audio' | 'video';
  playTrack: (track: MusicTrack) => void;
  togglePlayMusic: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setCurrentTrack: (track: MusicTrack | null) => void;
  setIsPlayingMusic: (playing: boolean) => void;
  setIsPlayerModalOpen: (open: boolean) => void;
  setPlayerMode: (mode: 'audio' | 'video') => void;
  addMusicTrack: (trackData: Omit<MusicTrack, 'id' | 'createdAt'>) => Promise<boolean>;
  deleteMusicTrack: (id: string) => Promise<boolean>;

  // YouTube Video / Movie Series System
  series: Series[];
  selectedSeries: Series | null;
  setSelectedSeries: (series: Series | null) => void;
  selectedEpisode: { series: Series; episode: SeriesEpisode } | null;
  setSelectedEpisode: (data: { series: Series; episode: SeriesEpisode } | null) => void;
  addSeries: (seriesData: Omit<Series, 'id' | 'createdAt'>) => Promise<boolean>;
  updateSeries: (id: string, updates: Partial<Series>) => Promise<boolean>;
  deleteSeries: (id: string) => Promise<boolean>;
  seedDefaultSeries: () => Promise<void>;

  // In-App Browser System (All links open inside app, no URL shown, web apps blocked)
  inAppBrowserUrl: string | null;
  inAppBrowserTitle: string;
  openInAppBrowser: (url: string, title?: string) => void;
  closeInAppBrowser: () => void;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

const LOCAL_MOVIES_KEY = 'flickcove_local_movies_v3';
const LOCAL_SETTINGS_KEY = 'flickcove_local_settings_v3';
const LOCAL_DOWNLOADS_KEY = 'flickcove_downloads_v3';
const LOCAL_MUSIC_KEY = 'flickcove_local_music_v3';
const LOCAL_APPS_KEY = 'flickcove_local_apps_v1';
const LOCAL_SERIES_KEY = 'flickcove_local_series_v1';
const LOCAL_DELETED_APPS_KEY = 'flickcove_deleted_apps_v1';
const LOCAL_DELETED_MOVIES_KEY = 'flickcove_deleted_movies_v1';
const LOCAL_DELETED_SERIES_KEY = 'flickcove_deleted_series_v1';
const ADMIN_AUTH_KEY = 'flickcove_admin_token';

export const MovieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deletedSeriesIds, setDeletedSeriesIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_DELETED_SERIES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [deletedAppIds, setDeletedAppIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_DELETED_APPS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [deletedMovieIds, setDeletedMovieIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_DELETED_MOVIES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [series, setSeries] = useState<Series[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_SERIES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : INITIAL_SERIES;
      }
    } catch {
      // ignore
    }
    return INITIAL_SERIES;
  });

  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<{ series: Series; episode: SeriesEpisode } | null>(null);

  const [movies, setMovies] = useState<Movie[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_MOVIES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : INITIAL_MOVIES;
      }
    } catch {
      // ignore
    }
    return INITIAL_MOVIES;
  });

  // App shortcuts & Games state
  const [appShortcuts, setAppShortcuts] = useState<AppShortcut[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_APPS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : INITIAL_APP_SHORTCUTS;
      }
    } catch {
      // ignore
    }
    return INITIAL_APP_SHORTCUTS;
  });

  // YouTube Music tracks state
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_MUSIC_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_MUSIC_TRACKS;
  });

  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(INITIAL_MUSIC_TRACKS[1] || INITIAL_MUSIC_TRACKS[0]);
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState<boolean>(false);
  const [playerMode, setPlayerMode] = useState<'audio' | 'video'>('audio');

  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.apkDownloadUrl?.includes('flickcove.top')) {
          parsed.apkDownloadUrl = '';
        }
        if (!parsed.adminPasswordHash || parsed.adminPasswordHash === '445566' || parsed.adminPasswordHash === '123456') {
          parsed.adminPasswordHash = INITIAL_SETTINGS.adminPasswordHash;
        }
        if (!parsed.appLogoUrl || parsed.appLogoUrl === '/assets/app-logo.png' || parsed.appLogoUrl.includes('ibb.co.com/93wgQTvZ')) {
          parsed.appLogoUrl = INITIAL_SETTINGS.appLogoUrl;
        }
        return { ...INITIAL_SETTINGS, ...parsed };
      }
    } catch {
      // ignore
    }
    return INITIAL_SETTINGS;
  });

  const [downloadList, setDownloadList] = useState<Movie[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_DOWNLOADS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(ADMIN_AUTH_KEY) === 'authenticated';
  });

  const [adminModalOpen, setAdminModalOpenState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('flickcove_admin_modal_open') === 'true';
    } catch {
      return false;
    }
  });

  const setAdminModalOpen = (open: boolean) => {
    setAdminModalOpenState(open);
    try {
      if (open) {
        localStorage.setItem('flickcove_admin_modal_open', 'true');
      } else {
        localStorage.removeItem('flickcove_admin_modal_open');
      }
    } catch {
      // ignore
    }
  };
  const [editMovieModalOpen, setEditMovieModalOpen] = useState<boolean>(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [apkUpdateModalOpen, setApkUpdateModalOpen] = useState<boolean>(false);
  const [searchChoiceModalOpen, setSearchChoiceModalOpen] = useState<boolean>(false);
  const [installPwaModalOpen, setInstallPwaModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'home' | 'music' | 'apps' | 'ai' | 'download' | 'more'>('home');

  // In-App Browser State
  const [inAppBrowserUrl, setInAppBrowserUrl] = useState<string | null>(null);
  const [inAppBrowserTitle, setInAppBrowserTitle] = useState<string>('');

  // All non-ad websites, downloaders, and pages run directly inside our app's in-app browser
  const openInAppBrowser = (url: string, title?: string) => {
    if (!url || url === '#' || url.trim() === '') return;

    // Convert dead mock domain to working videodownloader URL
    let target = url;
    if (target.includes('flickcove.top') || target.includes('/sample')) {
      target = settings.searchButton1Url || settings.searchRedirectUrl || 'https://videodownloader.site';
    }

    const lower = target.toLowerCase();
    // Social apps and system schemes cannot run inside an iframe
    if (
      target.startsWith('tel:') || 
      target.startsWith('mailto:') || 
      target.startsWith('intent:') ||
      lower.includes('tinyurl.com') ||
      lower.includes('bit.ly') ||
      lower.includes('workers.dev') ||
      lower.includes('marketify') ||
      lower.includes('t.me') || 
      lower.includes('telegram.org') || 
      lower.includes('chat.whatsapp.com') || 
      lower.includes('wa.me') ||
      lower.includes('whatsapp.com') ||
      lower.includes('facebook.com') ||
      lower.includes('fb.me')
    ) {
      const a = document.createElement('a');
      a.href = target;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (a.parentNode) document.body.removeChild(a);
      }, 100);
      return;
    }

    setInAppBrowserUrl(target);
    setInAppBrowserTitle(title || 'ওয়েব ভিউ');
  };

  const closeInAppBrowser = () => {
    setInAppBrowserUrl(null);
    setInAppBrowserTitle('');
  };

  // Save local mirror on movie updates
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_MOVIES_KEY, JSON.stringify(movies));
    } catch (e) {
      console.warn('Storage quota limit for local cache:', e);
    }
  }, [movies]);

  // Save local mirror on settings updates
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Storage quota limit for settings cache:', e);
    }
  }, [settings]);

  // Save app shortcuts to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_APPS_KEY, JSON.stringify(appShortcuts));
    } catch (e) {
      console.warn('Storage quota limit for apps cache:', e);
    }
  }, [appShortcuts]);

  // Save series to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_SERIES_KEY, JSON.stringify(series));
    } catch (e) {
      console.warn('Storage quota limit for series cache:', e);
    }
  }, [series]);

  // Firestore Real-time Listener for App Shortcuts
  useEffect(() => {
    const appsRef = collection(db, 'app_shortcuts');
    const unsubscribeApps = onSnapshot(
      appsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const fetchedApps: AppShortcut[] = [];
          snapshot.forEach((docSnap) => {
            if (deletedAppIds.includes(docSnap.id)) return;
            const data = docSnap.data();
            fetchedApps.push({
              id: docSnap.id,
              title: data.title || '',
              url: data.url || 'https://videodownloader.site',
              iconUrl: data.iconUrl || '',
              section: data.section || 'Favorite',
              badge: data.badge || '',
              order: typeof data.order === 'number' ? data.order : 99,
              active: data.active !== false,
              createdAt: data.createdAt || new Date().toISOString(),
            });
          });
          fetchedApps.sort((a, b) => (a.order || 99) - (b.order || 99));
          setAppShortcuts(fetchedApps);
        } else {
          // If Firestore is empty, seed defaults only once if never seeded
          const hasSeeded = localStorage.getItem('flickcove_apps_seeded');
          if (!hasSeeded) {
            seedDefaultAppShortcuts();
            localStorage.setItem('flickcove_apps_seeded', 'true');
          } else {
            setAppShortcuts((prev) => (prev && prev.length > 0 ? prev : INITIAL_APP_SHORTCUTS));
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'app_shortcuts');
      }
    );
    return () => unsubscribeApps();
  }, [deletedAppIds]);

  // Save downloads
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_DOWNLOADS_KEY, JSON.stringify(downloadList));
    } catch (e) {
      console.warn('Storage quota limit for downloads cache:', e);
    }
  }, [downloadList]);

  // Save music tracks mirror
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_MUSIC_KEY, JSON.stringify(musicTracks));
    } catch (e) {
      console.warn('Storage quota limit for music cache:', e);
    }
  }, [musicTracks]);

  // Firestore Real-time Listener for YouTube Music Tracks
  useEffect(() => {
    const musicRef = collection(db, 'music_tracks');
    const unsubscribeMusic = onSnapshot(
      musicRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const fetchedTracks: MusicTrack[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            fetchedTracks.push({
              id: docSnap.id,
              youtubeId: data.youtubeId || '',
              youtubeUrl: data.youtubeUrl || '',
              title: data.title || '',
              artist: data.artist || '',
              views: data.views || '1M views',
              duration: data.duration || '4:00',
              thumbnail: data.thumbnail || `https://img.youtube.com/vi/${data.youtubeId}/hqdefault.jpg`,
              category: data.category || 'Covers and remixes',
              likesCount: data.likesCount || '1.8K',
              commentsCount: data.commentsCount || '41',
              hasAiTag: !!data.hasAiTag,
              createdAt: data.createdAt || new Date().toISOString(),
            });
          });
          fetchedTracks.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
          setMusicTracks(fetchedTracks);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'music_tracks');
      }
    );
    return () => unsubscribeMusic();
  }, []);

  // Firestore Real-time Listener for YouTube Series
  useEffect(() => {
    const seriesRef = collection(db, 'series');
    const unsubscribeSeries = onSnapshot(
      seriesRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const fetchedSeries: Series[] = [];
          snapshot.forEach((docSnap) => {
            if (deletedSeriesIds.includes(docSnap.id)) return;
            const data = docSnap.data();
            fetchedSeries.push({
              id: docSnap.id,
              title: data.title || '',
              category: data.category || 'South Hindi Dubbed',
              badgeLabel: data.badgeLabel || 'YouTube Exclusive Series',
              badgeColor: data.badgeColor || 'blue',
              poster: data.poster || '',
              year: data.year || '2026',
              quality: data.quality || 'Full HD 1080p',
              description: data.description || '',
              isYouTubeSeries: true,
              episodes: Array.isArray(data.episodes) ? data.episodes : [],
              createdAt: data.createdAt || new Date().toISOString(),
            });
          });
          fetchedSeries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setSeries(fetchedSeries);
        } else {
          const hasSeeded = localStorage.getItem('flickcove_series_seeded');
          if (!hasSeeded) {
            seedDefaultSeries();
            localStorage.setItem('flickcove_series_seeded', 'true');
          } else {
            setSeries((prev) => (prev && prev.length > 0 ? prev : INITIAL_SERIES));
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'series');
      }
    );
    return () => unsubscribeSeries();
  }, [deletedSeriesIds]);

  // Firestore Real-time Listener for Movies
  useEffect(() => {
    const moviesRef = collection(db, 'movies');
    const unsubscribeMovies = onSnapshot(
      moviesRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const fetchedMovies: Movie[] = [];
          snapshot.forEach((docSnap) => {
            if (deletedMovieIds.includes(docSnap.id)) return;
            const data = docSnap.data();
            fetchedMovies.push({
              id: docSnap.id,
              title: data.title || '',
              category: data.category || 'Action',
              badgeLabel: data.badgeLabel || '',
              badgeColor: data.badgeColor || 'red',
              titleColor: data.titleColor || 'red',
              genres: data.genres || ['Drama'],
              year: data.year || '2026',
              poster: data.poster || '',
              audio: data.audio || 'Dual Audio Hindi',
              language: data.language || data.audio || 'Hindi',
              duration: data.duration || '2h 30min',
              releaseDate: data.releaseDate || data.year || '2026',
              starcast: data.starcast || '',
              quality: data.quality || '480p 720p 1080p [HD]',
              description: data.description || '',
              rating: data.rating || '8.5',
              views: data.views || 1000,
              teraboxUrl: data.teraboxUrl || '',
              driveUrl: data.driveUrl || '',
              fastDownloadUrl: data.fastDownloadUrl || '',
              streamUrl: data.streamUrl || '',
              fileSizes: data.fileSizes || { p1080: '2.2 GB', p720: '1.2 GB', p480: '500 MB' },
              screenshots: data.screenshots || [],
              featured: !!data.featured,
              createdAt: data.createdAt || new Date().toISOString(),
            });
          });
          // sort latest first
          fetchedMovies.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setMovies(fetchedMovies);
        } else {
          // If Firestore is empty, do NOT wipe local movies if user has movies
          const hasSeeded = localStorage.getItem('flickcove_movies_seeded');
          if (!hasSeeded) {
            seedDefaultMovies();
            localStorage.setItem('flickcove_movies_seeded', 'true');
          } else {
            setMovies((prev) => (prev && prev.length > 0 ? prev : INITIAL_MOVIES));
          }
        }
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'movies');
        setLoading(false);
      }
    );

    // Firestore Real-time Listener for Settings
    const settingsDocRef = doc(db, 'site_settings', 'main');
    const unsubscribeSettings = onSnapshot(
      settingsDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data.deletedAppIds) && data.deletedAppIds.length > 0) {
            setDeletedAppIds((prev) => Array.from(new Set([...prev, ...data.deletedAppIds])));
            setAppShortcuts((prev) => prev.filter((a) => !data.deletedAppIds.includes(a.id)));
          }
          if (Array.isArray(data.deletedMovieIds) && data.deletedMovieIds.length > 0) {
            setDeletedMovieIds((prev) => Array.from(new Set([...prev, ...data.deletedMovieIds])));
            setMovies((prev) => prev.filter((m) => !data.deletedMovieIds.includes(m.id)));
          }
          if (Array.isArray(data.deletedSeriesIds) && data.deletedSeriesIds.length > 0) {
            setDeletedSeriesIds((prev) => Array.from(new Set([...prev, ...data.deletedSeriesIds])));
            setSeries((prev) => prev.filter((s) => !data.deletedSeriesIds.includes(s.id)));
          }
          const cleanApkUrl = data.apkDownloadUrl?.includes('flickcove.top') ? '' : (data.apkDownloadUrl ?? '');
          
          // Ensure all real-time ads from Firebase are properly resolved & default active
          const incomingMovieDetailScript = data.movieDetailAd?.scriptCode?.trim() || '';
          const resolvedDetailScript = incomingMovieDetailScript || INITIAL_SETTINGS.movieDetailAd?.scriptCode || '';

          const movieDetailAdNormalized = {
            active: true,
            scriptCode: resolvedDetailScript,
            imageUrl: data.movieDetailAd?.imageUrl || '',
            targetUrl: data.movieDetailAd?.targetUrl || 'https://videodownloader.site',
          };

          const homeFeedAdNormalized = {
            active: true,
            scriptCode: data.homeFeedAd?.scriptCode?.trim() || INITIAL_SETTINGS.homeFeedAd?.scriptCode || '',
            interval: typeof data.homeFeedAd?.interval === 'number' ? data.homeFeedAd.interval : 1,
          };

          const musicPageScript = data.musicPageAd?.scriptCode?.trim() || data.musicPageAd?.scriptCode1?.trim() || INITIAL_SETTINGS.musicPageAd?.scriptCode || '';
          const musicPageAdNormalized = {
            active: data.musicPageAd?.active ?? true,
            scriptCode: musicPageScript,
            scriptCode1: musicPageScript,
            scriptCode2: '',
          };

          // If live Firestore document has disabled or missing detail/music ad, auto-heal in Firestore live
          if (!data.movieDetailAd || data.movieDetailAd.active !== true || !data.movieDetailAd.scriptCode) {
            updateDoc(settingsDocRef, {
              movieDetailAd: movieDetailAdNormalized,
            }).catch(() => {});
          }

          if (!data.homeFeedAd || data.homeFeedAd.active === false || !data.homeFeedAd.scriptCode) {
            updateDoc(settingsDocRef, {
              homeFeedAd: homeFeedAdNormalized,
            }).catch(() => {});
          }

          if (!data.musicPageAd || !data.musicPageAd.scriptCode) {
            updateDoc(settingsDocRef, {
              musicPageAd: musicPageAdNormalized,
            }).catch(() => {});
          }

          const targetSecureHash = INITIAL_SETTINGS.adminPasswordHash;
          const targetAppLogo = INITIAL_SETTINGS.appLogoUrl;
          const currentAppLogo = (data.appLogoUrl && !data.appLogoUrl.includes('ibb.co.com/93wgQTvZ'))
            ? data.appLogoUrl
            : targetAppLogo;

          // Auto-heal password hash in Firestore if still old default or empty so security is always guaranteed
          if (!data.adminPasswordHash || data.adminPasswordHash === '445566' || data.adminPasswordHash === '123456') {
            updateDoc(settingsDocRef, {
              adminPasswordHash: targetSecureHash,
            }).catch(() => {});
          }

          // Auto-sync APK logo in Firestore if unset, default relative asset, or webpage URL
          if (!data.appLogoUrl || data.appLogoUrl === '/assets/app-logo.png' || data.appLogoUrl.includes('ibb.co.com/93wgQTvZ')) {
            updateDoc(settingsDocRef, {
              appLogoUrl: targetAppLogo,
            }).catch(() => {});
          }

          setSettings((prev) => ({
            ...prev,
            ...data,
            appLogoUrl: currentAppLogo,
            adminPasswordHash: data.adminPasswordHash && data.adminPasswordHash !== '445566' ? data.adminPasswordHash : targetSecureHash,
            apkDownloadUrl: cleanApkUrl,
            movieDetailAd: movieDetailAdNormalized,
            homeFeedAd: homeFeedAdNormalized,
            musicPageAd: musicPageAdNormalized,
            appsSponsoredAd: {
              ...(prev.appsSponsoredAd || INITIAL_SETTINGS.appsSponsoredAd),
              ...(data.appsSponsoredAd || {}),
              scriptCode: data.appsSponsoredAd?.scriptCode !== undefined 
                ? data.appsSponsoredAd.scriptCode 
                : (prev.appsSponsoredAd?.scriptCode || INITIAL_SETTINGS.appsSponsoredAd?.scriptCode)
            }
          }));
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'site_settings/main');
      }
    );

    return () => {
      unsubscribeMovies();
      unsubscribeSettings();
    };
  }, [deletedMovieIds]);

  // Seed initial movies to Firestore
  const seedDefaultMovies = async () => {
    try {
      for (const movie of INITIAL_MOVIES) {
        const movieRef = doc(db, 'movies', movie.id);
        await setDoc(movieRef, movie);
      }
      const settingsRef = doc(db, 'site_settings', 'main');
      await setDoc(settingsRef, INITIAL_SETTINGS, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'movies');
    }
  };

  const addMovie = async (movieData: Omit<Movie, 'id' | 'createdAt'>): Promise<boolean> => {
    const cleanTitle = (movieData.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .slice(0, 40);
    const slug = `movie_${cleanTitle ? cleanTitle + '_' : ''}${Date.now()}`;

    const newMovie: Movie = {
      ...movieData,
      id: slug,
      createdAt: new Date().toISOString(),
    };

    // Optimistic local update
    setMovies((prev) => [newMovie, ...prev]);

    try {
      const movieRef = doc(db, 'movies', slug);
      await setDoc(movieRef, newMovie);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `movies/${slug}`);
      return true; // retained in local cache
    }
  };

  const updateMovie = async (id: string, updates: Partial<Movie>): Promise<boolean> => {
    // Optimistic local update
    setMovies((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );

    if (selectedMovie && selectedMovie.id === id) {
      setSelectedMovie((prev) => (prev ? { ...prev, ...updates } : null));
    }

    try {
      const movieRef = doc(db, 'movies', id);
      await updateDoc(movieRef, updates);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `movies/${id}`);
      return true;
    }
  };

  const deleteMovie = async (id: string): Promise<boolean> => {
    // 1. Immediately remove from local state
    setMovies((prev) => prev.filter((m) => m.id !== id));
    if (selectedMovie && selectedMovie.id === id) {
      setSelectedMovie(null);
    }

    // 2. Persist to local deleted list
    const updatedDeleted = Array.from(new Set([...deletedMovieIds, id]));
    setDeletedMovieIds(updatedDeleted);
    try {
      localStorage.setItem(LOCAL_DELETED_MOVIES_KEY, JSON.stringify(updatedDeleted));
      localStorage.setItem(LOCAL_MOVIES_KEY, JSON.stringify(movies.filter((m) => m.id !== id)));
    } catch (e) {
      console.warn(e);
    }

    // 3. Delete doc from Firestore & record tombstone in settings
    try {
      const movieRef = doc(db, 'movies', id);
      await deleteDoc(movieRef);
      const settingsRef = doc(db, 'site_settings', 'main');
      await updateDoc(settingsRef, {
        deletedMovieIds: arrayUnion(id)
      }).catch(() => {});
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `movies/${id}`);
      return true;
    }
  };

  const updateSettings = async (newSettings: Partial<SiteSettings>): Promise<boolean> => {
    setSettings((prev) => ({ ...prev, ...newSettings }));

    try {
      const settingsRef = doc(db, 'site_settings', 'main');
      await setDoc(settingsRef, newSettings, { merge: true });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'site_settings/main');
      return true;
    }
  };

  const loginAdmin = async (password: string): Promise<boolean> => {
    if (!password) return false;
    const trimmed = password.trim();
    const hashed = await hashPassword(trimmed);
    const configuredHash = settings.adminPasswordHash || INITIAL_SETTINGS.adminPasswordHash;
    const defaultSecureHash = INITIAL_SETTINGS.adminPasswordHash;

    // Secure SHA-256 hash match against configured or default hash
    const isMatch = (hashed === configuredHash) || (hashed === defaultSecureHash);

    if (isMatch) {
      setIsAdminLoggedIn(true);
      localStorage.setItem(ADMIN_AUTH_KEY, 'authenticated');
      // If Firestore still had an older hash, update it with the verified SHA-256 hash
      if (settings.adminPasswordHash !== hashed) {
        updateSettings({ adminPasswordHash: hashed });
      }
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem(ADMIN_AUTH_KEY);
  };

  const changeAdminPassword = async (newPass: string): Promise<boolean> => {
    if (!newPass || newPass.trim().length < 4) return false;
    const hashed = await hashPassword(newPass.trim());
    return await updateSettings({ adminPasswordHash: hashed });
  };

  const addToDownloads = (movie: Movie) => {
    setDownloadList((prev) => {
      if (prev.some((m) => m.id === movie.id)) return prev;
      return [movie, ...prev];
    });
  };

  const removeFromDownloads = (id: string) => {
    setDownloadList((prev) => prev.filter((m) => m.id !== id));
  };

  // YouTube Music Player Functions
  const playTrack = (track: MusicTrack) => {
    setCurrentTrack(track);
    setIsPlayingMusic(true);
    setIsPlayerModalOpen(true);
  };

  const togglePlayMusic = () => {
    setIsPlayingMusic((prev) => !prev);
  };

  const nextTrack = () => {
    if (!currentTrack || musicTracks.length === 0) return;
    const currentIndex = musicTracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % musicTracks.length;
    setCurrentTrack(musicTracks[nextIndex]);
    setIsPlayingMusic(true);
  };

  const prevTrack = () => {
    if (!currentTrack || musicTracks.length === 0) return;
    const currentIndex = musicTracks.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + musicTracks.length) % musicTracks.length;
    setCurrentTrack(musicTracks[prevIndex]);
    setIsPlayingMusic(true);
  };

  const addMusicTrack = async (trackData: Omit<MusicTrack, 'id' | 'createdAt'>): Promise<boolean> => {
    const id = 'yt_' + Date.now();
    const newTrack: MusicTrack = {
      ...trackData,
      id,
      createdAt: new Date().toISOString()
    };
    setMusicTracks((prev) => [newTrack, ...prev]);
    try {
      await setDoc(doc(db, 'music_tracks', id), newTrack);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `music_tracks/${id}`);
    }
    return true;
  };

  const deleteMusicTrack = async (id: string): Promise<boolean> => {
    setMusicTracks((prev) => prev.filter((t) => t.id !== id));
    if (currentTrack?.id === id) {
      setIsPlayingMusic(false);
    }
    try {
      await deleteDoc(doc(db, 'music_tracks', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `music_tracks/${id}`);
    }
    return true;
  };

  // Apps Hub / Shortcuts Database Methods
  const seedDefaultAppShortcuts = async () => {
    try {
      for (const appItem of INITIAL_APP_SHORTCUTS) {
        const docRef = doc(db, 'app_shortcuts', appItem.id);
        await setDoc(docRef, appItem);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'app_shortcuts');
    }
  };

  const addAppShortcut = async (shortcutData: Omit<AppShortcut, 'id' | 'createdAt'>): Promise<boolean> => {
    const slugId = 'app-' + (shortcutData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30) || 'item') + '-' + Date.now().toString().slice(-4);
    const newShortcut: AppShortcut = {
      ...shortcutData,
      id: slugId,
      createdAt: new Date().toISOString()
    };

    setAppShortcuts((prev) => [...prev, newShortcut]);

    try {
      await setDoc(doc(db, 'app_shortcuts', slugId), newShortcut);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `app_shortcuts/${slugId}`);
      return false;
    }
  };

  const updateAppShortcut = async (id: string, updates: Partial<AppShortcut>): Promise<boolean> => {
    setAppShortcuts((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));

    try {
      await updateDoc(doc(db, 'app_shortcuts', id), updates);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `app_shortcuts/${id}`);
      return false;
    }
  };

  const deleteAppShortcut = async (id: string): Promise<boolean> => {
    // 1. Immediately remove from local state
    setAppShortcuts((prev) => prev.filter((item) => item.id !== id));

    // 2. Persist to local deleted list
    const updatedDeleted = Array.from(new Set([...deletedAppIds, id]));
    setDeletedAppIds(updatedDeleted);
    try {
      localStorage.setItem(LOCAL_DELETED_APPS_KEY, JSON.stringify(updatedDeleted));
      localStorage.setItem(LOCAL_APPS_KEY, JSON.stringify(appShortcuts.filter((item) => item.id !== id)));
    } catch (e) {
      console.warn(e);
    }

    // 3. Delete doc from Firestore & record tombstone in settings
    try {
      await deleteDoc(doc(db, 'app_shortcuts', id));
      const settingsRef = doc(db, 'site_settings', 'main');
      await updateDoc(settingsRef, {
        deletedAppIds: arrayUnion(id)
      }).catch(() => {});
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `app_shortcuts/${id}`);
      return false;
    }
  };

  // YouTube Series System Database Methods
  const seedDefaultSeries = async () => {
    try {
      for (const item of INITIAL_SERIES) {
        const docRef = doc(db, 'series', item.id);
        await setDoc(docRef, item);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'series');
    }
  };

  const addSeries = async (seriesData: Omit<Series, 'id' | 'createdAt'>): Promise<boolean> => {
    const cleanTitle = (seriesData.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .slice(0, 30);
    const slug = `series_${cleanTitle ? cleanTitle + '_' : ''}${Date.now()}`;

    const newSeries: Series = {
      ...seriesData,
      id: slug,
      isYouTubeSeries: true,
      createdAt: new Date().toISOString(),
    };

    setSeries((prev) => [newSeries, ...prev]);

    try {
      const seriesRef = doc(db, 'series', slug);
      await setDoc(seriesRef, newSeries);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `series/${slug}`);
      return false;
    }
  };

  const updateSeries = async (id: string, updates: Partial<Series>): Promise<boolean> => {
    setSeries((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );

    if (selectedSeries && selectedSeries.id === id) {
      setSelectedSeries((prev) => (prev ? { ...prev, ...updates } : null));
    }
    if (selectedEpisode && selectedEpisode.series.id === id) {
      setSelectedEpisode((prev) => {
        if (!prev) return null;
        const updatedEp = updates.episodes?.find((e) => e.id === prev.episode.id) || prev.episode;
        return {
          series: { ...prev.series, ...updates },
          episode: updatedEp
        };
      });
    }

    try {
      const seriesRef = doc(db, 'series', id);
      await updateDoc(seriesRef, updates);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `series/${id}`);
      return false;
    }
  };

  const deleteSeries = async (id: string): Promise<boolean> => {
    setSeries((prev) => prev.filter((s) => s.id !== id));
    if (selectedSeries && selectedSeries.id === id) {
      setSelectedSeries(null);
    }
    if (selectedEpisode && selectedEpisode.series.id === id) {
      setSelectedEpisode(null);
    }

    const updatedDeleted = Array.from(new Set([...deletedSeriesIds, id]));
    setDeletedSeriesIds(updatedDeleted);
    try {
      localStorage.setItem(LOCAL_DELETED_SERIES_KEY, JSON.stringify(updatedDeleted));
      localStorage.setItem(LOCAL_SERIES_KEY, JSON.stringify(series.filter((s) => s.id !== id)));
    } catch (e) {
      console.warn(e);
    }

    try {
      await deleteDoc(doc(db, 'series', id));
      const settingsRef = doc(db, 'site_settings', 'main');
      await updateDoc(settingsRef, {
        deletedSeriesIds: arrayUnion(id)
      }).catch(() => {});
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `series/${id}`);
      return false;
    }
  };

  return (
    <MovieContext.Provider
      value={{
        movies,
        settings,
        loading,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        selectedMovie,
        setSelectedMovie,
        isAdminLoggedIn,
        adminModalOpen,
        setAdminModalOpen,
        editMovieModalOpen,
        setEditMovieModalOpen,
        editingMovie,
        setEditingMovie,
        apkUpdateModalOpen,
        setApkUpdateModalOpen,
        searchChoiceModalOpen,
        setSearchChoiceModalOpen,
        installPwaModalOpen,
        setInstallPwaModalOpen,
        activeTab,
        setActiveTab,
        addMovie,
        updateMovie,
        deleteMovie,
        updateSettings,
        loginAdmin,
        logoutAdmin,
        changeAdminPassword,
        seedDefaultMovies,
        downloadList,
        addToDownloads,
        removeFromDownloads,
        // YouTube Series System
        series,
        selectedSeries,
        setSelectedSeries,
        selectedEpisode,
        setSelectedEpisode,
        addSeries,
        updateSeries,
        deleteSeries,
        seedDefaultSeries,
        // Apps Hub System
        appShortcuts,
        addAppShortcut,
        updateAppShortcut,
        deleteAppShortcut,
        seedDefaultAppShortcuts,
        // YouTube Music System
        musicTracks,
        currentTrack,
        isPlayingMusic,
        isPlayerModalOpen,
        playerMode,
        playTrack,
        togglePlayMusic,
        nextTrack,
        prevTrack,
        setCurrentTrack,
        setIsPlayingMusic,
        setIsPlayerModalOpen,
        setPlayerMode,
        addMusicTrack,
        deleteMusicTrack,
        // In-App Browser System
        inAppBrowserUrl,
        inAppBrowserTitle,
        openInAppBrowser,
        closeInAppBrowser,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export const useMovieContext = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovieContext must be used within a MovieProvider');
  }
  return context;
};
