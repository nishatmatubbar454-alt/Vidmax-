import React, { useState, useEffect } from 'react';
import { useMovieContext } from '../context/MovieContext';
import { Movie, SiteSettings, AppShortcut, ApkAnalytics, InstalledDevice, Series, SeriesEpisode } from '../types';
import { CATEGORIES } from '../initialData';
import { ImageUploader } from './ImageUploader';
import { extractYouTubeId, getYouTubeThumbnail } from '../utils/youtube';
import { DEFAULT_FEED_AD_SCRIPT } from './ScriptAdBanner';
import { DEFAULT_DOWNLOAD_AD_SCRIPT } from './DownloadsView';
import { DEFAULT_MUSIC_PAGE_AD_SCRIPT } from './MusicView';
import { DEFAULT_MOVIE_DETAIL_AD_SCRIPT } from './MovieDetailModal';
import { 
  X, 
  Lock, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Film, 
  Globe, 
  Smartphone, 
  KeyRound, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  LogOut,
  Megaphone,
  Link2,
  Palette,
  ExternalLink,
  Layers,
  UploadCloud,
  Check,
  LayoutGrid,
  Share2,
  Send,
  Sparkles,
  BarChart3,
  Users,
  HardDrive,
  Radio,
  Clock,
  Download,
  Activity,
  Copy,
  ShieldCheck,
  Tv,
  Video,
  PlaySquare,
  Play
} from 'lucide-react';
import { subscribeToApkAnalytics, subscribeToInstalledDevices, recordApkDownload } from '../utils/deviceTracker';

type AdminTab = 'movies' | 'add' | 'series' | 'apps' | 'devices' | 'ads' | 'links' | 'design' | 'apk' | 'password';

export const AdminPanelModal: React.FC = () => {
  const { 
    adminModalOpen, 
    setAdminModalOpen, 
    isAdminLoggedIn, 
    loginAdmin, 
    logoutAdmin,
    changeAdminPassword,
    movies,
    addMovie,
    updateMovie,
    deleteMovie,
    settings,
    updateSettings,
    seedDefaultMovies,
    appShortcuts,
    addAppShortcut,
    updateAppShortcut,
    deleteAppShortcut,
    seedDefaultAppShortcuts,
    series,
    addSeries,
    updateSeries,
    deleteSeries,
    seedDefaultSeries
  } = useMovieContext();

  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTabState] = useState<AdminTab>(() => {
    try {
      const saved = localStorage.getItem('flickcove_admin_active_tab') as AdminTab;
      return saved || 'movies';
    } catch {
      return 'movies';
    }
  });

  const setActiveTab = (tab: AdminTab) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem('flickcove_admin_active_tab', tab);
    } catch {}
  };
  
  // Movie Add / Edit state with persistent draft to protect against mobile tab suspension
  const [movieForm, setMovieForm] = useState<Partial<Movie>>(() => {
    try {
      const draft = localStorage.getItem('flickcove_movie_draft');
      if (draft) return JSON.parse(draft);
    } catch {}
    return {
      title: '',
      category: 'South Hindi Dubbed',
      badgeLabel: 'South Hindi Dubbed Movie',
      year: '2026',
      poster: '',
      quality: '480p 720p 1080p [HD]',
      duration: '140 মিনিট',
      downloadUrl: '',
      description: '',
      screenshots: [],
    };
  });

  const [screenshotList, setScreenshotList] = useState<string[]>(() => {
    try {
      const draft = localStorage.getItem('flickcove_screenshot_draft');
      if (draft) return JSON.parse(draft);
    } catch {}
    return [''];
  });

  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);

  // Auto-save form draft so photo picking or app switching NEVER loses inputs
  useEffect(() => {
    try {
      localStorage.setItem('flickcove_movie_draft', JSON.stringify(movieForm));
    } catch {}
  }, [movieForm]);

  useEffect(() => {
    try {
      localStorage.setItem('flickcove_screenshot_draft', JSON.stringify(screenshotList));
    } catch {}
  }, [screenshotList]);

  const BADGE_COLOR_CYCLE: Array<'red' | 'green' | 'blue' | 'orange'> = ['red', 'green', 'blue', 'orange'];

  const handleAddScreenshot = () => {
    if (screenshotList.length < 4) {
      setScreenshotList([...screenshotList, '']);
    }
  };

  const handleRemoveScreenshot = (index: number) => {
    if (screenshotList.length <= 1) {
      setScreenshotList(['']);
    } else {
      setScreenshotList(screenshotList.filter((_, i) => i !== index));
    }
  };

  const handleUpdateScreenshot = (index: number, url: string) => {
    const updated = [...screenshotList];
    updated[index] = url;
    setScreenshotList(updated);
  };

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(settings);

  // Sync settings when context changes in real-time
  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  // Password change state
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  // Status message
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [movieSearch, setMovieSearch] = useState('');

  // Apps Hub State
  const [appForm, setAppForm] = useState<Partial<AppShortcut>>({
    title: '',
    url: 'https://videodownloader.site',
    iconUrl: '',
    section: 'Favorite',
    badge: '',
    order: 1,
    active: true,
  });
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [customSection, setCustomSection] = useState('');
  const [appSearch, setAppSearch] = useState('');

  // YouTube Movie & Video Series State
  const [editingSeriesId, setEditingSeriesId] = useState<string | null>(null);
  const [seriesSearch, setSeriesSearch] = useState('');
  const [isSeriesFormOpen, setIsSeriesFormOpen] = useState(false);
  const [seriesForm, setSeriesForm] = useState<Partial<Series>>({
    title: '',
    category: 'South Hindi Dubbed',
    badgeLabel: 'মুভি সিরিজ • ২ পর্ব',
    badgeColor: 'blue',
    poster: '',
    year: '2026',
    quality: '1080p [HD]',
    description: '',
  });
  const [seriesEpisodes, setSeriesEpisodes] = useState<SeriesEpisode[]>([
    {
      id: 'ep-' + Date.now(),
      episodeNumber: 1,
      title: 'পর্ব ১: ',
      badge: 'পার্ট ১ • ফুল এইচডি',
      youtubeUrl: '',
      youtubeId: '',
      thumbnail: '',
      duration: '2h 15min',
      description: '',
    }
  ]);

  // APK & Device Analytics State (Real-time Firebase)
  const [apkAnalytics, setApkAnalytics] = useState<ApkAnalytics>({ totalDownloads: 0, totalDevices: 0, activeDevices: 0 });
  const [installedDevices, setInstalledDevices] = useState<InstalledDevice[]>([]);
  const [deviceSearch, setDeviceSearch] = useState('');

  // Subscribe to real-time device telemetry when admin is logged in
  useEffect(() => {
    if (isAdminLoggedIn) {
      const unsubAnalytics = subscribeToApkAnalytics(setApkAnalytics);
      const unsubDevices = subscribeToInstalledDevices(setInstalledDevices);
      return () => {
        unsubAnalytics();
        unsubDevices();
      };
    }
  }, [isAdminLoggedIn]);

  if (!adminModalOpen) return null;

  const showToast = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // APK Direct Download & Share Handlers
  const handleDownloadApkFile = () => {
    recordApkDownload(); // Update live Firebase download counter
    if (settingsForm.apkDownloadUrl?.trim()) {
      window.open(settingsForm.apkDownloadUrl.trim(), '_blank');
      showToast('success', 'APK ডাউনলোড লিংক ওপেন হচ্ছে...');
    } else {
      window.open('https://github.com/nishatmatubbar454-alt/Vidmax-/releases', '_blank');
      showToast('success', 'গিটহাব রিলিজ পেজ ওপেন হচ্ছে...');
    }
  };

  const handleCopyApkLink = () => {
    const link = settingsForm.apkDownloadUrl?.trim() 
      ? settingsForm.apkDownloadUrl.trim() 
      : 'https://github.com/nishatmatubbar454-alt/Vidmax-/releases';
    navigator.clipboard.writeText(link);
    showToast('success', 'APK ডাউনলোড লিংক ক্লিপবোর্ডে কপি হয়েছে!');
  };

  const handleShareApk = async () => {
    const link = settingsForm.apkDownloadUrl?.trim() 
      ? settingsForm.apkDownloadUrl.trim() 
      : 'https://github.com/nishatmatubbar454-alt/Vidmax-/releases';
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CineStream BD Official Android App',
          text: `CineStream BD অফিসিয়াল অ্যান্ড্রয়েড APK ডাউনলোড করুন (${settingsForm.apkVersion || 'v2.1.0'}):`,
          url: link,
        });
      } catch {}
    } else {
      const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent('CineStream BD অফিসিয়াল অ্যান্ড্রয়েড অ্যাপ ডাউনলোড করুন: ' + link)}`;
      window.open(shareUrl, '_blank');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await loginAdmin(passwordInput);
    if (ok) {
      setAuthError('');
      setPasswordInput('');
      setSettingsForm(settings);
      showToast('success', 'এডমিন লগইন সফল হয়েছে!');
    } else {
      setAuthError('ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিয়ে চেষ্টা করুন।');
    }
  };

  const handleSaveMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieForm.title || !movieForm.category) {
      showToast('error', 'মুভির নাম ও ক্যাটাগরি দেওয়া বাধ্যতামূলক।');
      return;
    }

    const assignedColor = BADGE_COLOR_CYCLE[movies.length % BADGE_COLOR_CYCLE.length];
    const cleanScreenshots = screenshotList.map(s => s.trim()).filter(Boolean);
    const mainDownloadUrl = movieForm.downloadUrl || movieForm.fastDownloadUrl || movieForm.teraboxUrl || movieForm.driveUrl || '';

    const payload: Partial<Movie> = {
      ...movieForm,
      title: movieForm.title.trim(),
      category: movieForm.category,
      badgeLabel: movieForm.badgeLabel || 'South Hindi Dubbed Movie',
      badgeColor: editingMovieId ? (movieForm.badgeColor || assignedColor) : assignedColor,
      titleColor: editingMovieId ? (movieForm.titleColor || assignedColor) : assignedColor,
      year: movieForm.year || '2026',
      poster: movieForm.poster || '',
      quality: movieForm.quality || '480p 720p 1080p [HD]',
      duration: movieForm.duration || '140 মিনিট',
      downloadUrl: mainDownloadUrl,
      fastDownloadUrl: mainDownloadUrl,
      teraboxUrl: mainDownloadUrl,
      driveUrl: mainDownloadUrl,
      description: movieForm.description || '',
      screenshots: cleanScreenshots,
      genres: movieForm.genres && movieForm.genres.length > 0 ? movieForm.genres : ['Action', 'Drama'],
      audio: movieForm.audio || 'Hindi Dubbed',
      rating: movieForm.rating || '8.5',
      views: movieForm.views || 25000,
    };

    if (editingMovieId) {
      await updateMovie(editingMovieId, payload);
      showToast('success', 'মুভি সফলভাবে ফায়ারবেসে আপডেট হয়েছে!');
      setEditingMovieId(null);
    } else {
      await addMovie(payload as any);
      showToast('success', 'নতুন মুভি ফায়ারবেসে পোস্ট হয়েছে!');
    }

    // Reset Form & Clear Draft
    try {
      localStorage.removeItem('flickcove_movie_draft');
      localStorage.removeItem('flickcove_screenshot_draft');
    } catch {}

    setMovieForm({
      title: '',
      category: 'South Hindi Dubbed',
      badgeLabel: 'South Hindi Dubbed Movie',
      year: '2026',
      poster: '',
      quality: '480p 720p 1080p [HD]',
      duration: '140 মিনিট',
      downloadUrl: '',
      description: '',
      screenshots: [],
    });
    setScreenshotList(['']);
    setActiveTab('movies');
  };

  const handleStartEdit = (movie: Movie) => {
    setEditingMovieId(movie.id);
    const mainDl = movie.downloadUrl || movie.fastDownloadUrl || movie.teraboxUrl || movie.driveUrl || '';
    setMovieForm({
      ...movie,
      downloadUrl: mainDl,
    });
    setScreenshotList(
      movie.screenshots && movie.screenshots.length > 0
        ? [...movie.screenshots]
        : ['']
    );
    setActiveTab('add');
  };

  const handleDeleteMovie = async (id: string, title: string) => {
    await deleteMovie(id);
    showToast('success', `"${title}" মুভিটি ফায়ারবেস থেকে তাৎক্ষণিকভাবে ডিলিট হয়েছে।`);
  };

  const handleSaveAppShortcut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appForm.title || !appForm.url) {
      showToast('error', 'অ্যাপের নাম ও লিংক দেওয়া বাধ্যতামূলক।');
      return;
    }

    const finalSection = appForm.section === 'custom' 
      ? (customSection.trim() || 'Other') 
      : (appForm.section || 'Favorite');

    const appData = {
      title: appForm.title.trim(),
      url: appForm.url.trim(),
      iconUrl: appForm.iconUrl?.trim() || 'https://cdn-icons-png.flaticon.com/512/1055/1055666.png',
      section: finalSection,
      badge: appForm.badge?.trim() || '',
      order: Number(appForm.order) || 99,
      active: appForm.active !== false,
    };

    if (editingAppId) {
      await updateAppShortcut(editingAppId, appData);
      showToast('success', 'অ্যাপটি সফলভাবে ফায়ারবেসে আপডেট হয়েছে!');
      setEditingAppId(null);
    } else {
      await addAppShortcut(appData);
      showToast('success', 'নতুন অ্যাপ শর্টকাট সফলভাবে ফায়ারবেসে যোগ হয়েছে!');
    }

    // Reset Form
    setAppForm({
      title: '',
      url: 'https://videodownloader.site',
      iconUrl: '',
      section: 'Favorite',
      badge: '',
      order: appShortcuts.length + 1,
      active: true,
    });
    setCustomSection('');
  };

  const handleStartEditApp = (app: AppShortcut) => {
    setEditingAppId(app.id);
    setAppForm({
      title: app.title,
      url: app.url,
      iconUrl: app.iconUrl,
      section: app.section === 'Favorite' || app.section === 'Paisa Kamao' ? app.section : 'custom',
      badge: app.badge || '',
      order: app.order || 1,
      active: app.active !== false,
    });
    if (app.section !== 'Favorite' && app.section !== 'Paisa Kamao') {
      setCustomSection(app.section);
    }
    // Scroll to top of tab container
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteApp = async (id: string, title: string) => {
    await deleteAppShortcut(id);
    showToast('success', `"${title}" অ্যাপটি ফায়ারবেস থেকে তাৎক্ষণিকভাবে মুছে ফেলা হয়েছে।`);
  };

  const handleResetAppForm = () => {
    setEditingAppId(null);
    setAppForm({
      title: '',
      url: 'https://videodownloader.site',
      iconUrl: '',
      section: 'Favorite',
      badge: '',
      order: appShortcuts.length + 1,
      active: true,
    });
    setCustomSection('');
  };

  // Series Management Handlers
  const handleAddEpisodeRow = () => {
    const nextNum = seriesEpisodes.length + 1;
    setSeriesEpisodes([
      ...seriesEpisodes,
      {
        id: 'ep-' + Date.now() + '-' + nextNum,
        episodeNumber: nextNum,
        title: `পর্ব ${nextNum}: `,
        badge: `পার্ট ${nextNum} • ফুল এইচডি`,
        youtubeUrl: '',
        youtubeId: '',
        thumbnail: '',
        duration: '2h 15min',
        description: '',
      }
    ]);
  };

  const handleRemoveEpisodeRow = (index: number) => {
    if (seriesEpisodes.length <= 1) {
      showToast('error', 'কমপক্ষে ১টি পর্ব থাকতে হবে।');
      return;
    }
    const updated = seriesEpisodes.filter((_, i) => i !== index).map((ep, idx) => ({
      ...ep,
      episodeNumber: idx + 1
    }));
    setSeriesEpisodes(updated);
  };

  const handleUpdateEpisodeRow = (index: number, updates: Partial<SeriesEpisode>) => {
    const updated = [...seriesEpisodes];
    const target = { ...updated[index], ...updates };

    // Auto extract YouTube ID and auto-generate thumbnail
    if (updates.youtubeUrl !== undefined) {
      const cleanId = extractYouTubeId(updates.youtubeUrl);
      target.youtubeId = cleanId;
      if (!target.thumbnail || target.thumbnail.includes('img.youtube.com')) {
        target.thumbnail = cleanId ? `https://img.youtube.com/vi/${cleanId}/hqdefault.jpg` : '';
      }
    }

    updated[index] = target;
    setSeriesEpisodes(updated);
  };

  const handleStartEditSeries = (s: Series) => {
    setEditingSeriesId(s.id);
    setSeriesForm({
      title: s.title,
      category: s.category,
      badgeLabel: s.badgeLabel || 'মুভি সিরিজ',
      badgeColor: s.badgeColor || 'blue',
      poster: s.poster,
      year: s.year || '2026',
      quality: s.quality || '1080p [HD]',
      description: s.description || '',
    });
    setSeriesEpisodes(
      s.episodes && s.episodes.length > 0
        ? [...s.episodes]
        : [
            {
              id: 'ep-' + Date.now(),
              episodeNumber: 1,
              title: 'পর্ব ১: ',
              badge: 'পার্ট ১ • ফুল এইচডি',
              youtubeUrl: '',
              youtubeId: '',
              thumbnail: '',
              duration: '2h 15min',
              description: '',
            }
          ]
    );
    setIsSeriesFormOpen(true);
  };

  const handleDeleteSeries = async (id: string, title: string) => {
    await deleteSeries(id);
    showToast('success', `"${title}" সিরিজটি ফায়ারবেস থেকে তাৎক্ষণিকভাবে মুছে ফেলা হয়েছে।`);
  };

  const handleResetSeriesForm = () => {
    setEditingSeriesId(null);
    setIsSeriesFormOpen(false);
    setSeriesForm({
      title: '',
      category: 'South Hindi Dubbed',
      badgeLabel: 'মুভি সিরিজ • ২ পর্ব',
      badgeColor: 'blue',
      poster: '',
      year: '2026',
      quality: '1080p [HD]',
      description: '',
    });
    setSeriesEpisodes([
      {
        id: 'ep-' + Date.now(),
        episodeNumber: 1,
        title: 'পর্ব ১: ',
        badge: 'পার্ট ১ • ফুল এইচডি',
        youtubeUrl: '',
        youtubeId: '',
        thumbnail: '',
        duration: '2h 15min',
        description: '',
      }
    ]);
  };

  const handleSeedSeries = async () => {
    await seedDefaultSeries();
    showToast('success', 'ডেমো ইউটিউব সিরিজ ফায়ারবেসে লোড হয়েছে!');
  };

  const handleSaveSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seriesForm.title || !seriesForm.category) {
      showToast('error', 'সিরিজের নাম ও ক্যাটাগরি দেওয়া বাধ্যতামূলক।');
      return;
    }

    const cleanEpisodes: SeriesEpisode[] = seriesEpisodes.map((ep, idx) => {
      const cleanYtId = ep.youtubeId || extractYouTubeId(ep.youtubeUrl);
      return {
        ...ep,
        episodeNumber: idx + 1,
        title: ep.title.trim() || `পর্ব ${idx + 1}`,
        youtubeId: cleanYtId,
        youtubeUrl: ep.youtubeUrl.trim(),
        thumbnail: ep.thumbnail?.trim() || (cleanYtId ? `https://img.youtube.com/vi/${cleanYtId}/hqdefault.jpg` : ''),
        badge: ep.badge?.trim() || `পর্ব ${idx + 1}`,
        duration: ep.duration?.trim() || '45 মিনিট',
        description: ep.description?.trim() || '',
      };
    });

    const payload: Omit<Series, 'id' | 'createdAt'> = {
      title: seriesForm.title.trim(),
      category: seriesForm.category,
      badgeLabel: seriesForm.badgeLabel || `মুভি সিরিজ • ${cleanEpisodes.length} পর্ব`,
      badgeColor: seriesForm.badgeColor || 'blue',
      poster: seriesForm.poster?.trim() || 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300',
      year: seriesForm.year || '2026',
      quality: seriesForm.quality || '1080p [HD]',
      description: seriesForm.description?.trim() || '',
      isYouTubeSeries: true,
      episodes: cleanEpisodes,
    };

    if (editingSeriesId) {
      await updateSeries(editingSeriesId, payload);
      showToast('success', 'ভিডিও সিরিজ সফলভাবে ফায়ারবেসে আপডেট হয়েছে!');
    } else {
      await addSeries(payload);
      showToast('success', 'নতুন ভিডিও সিরিজ সফলভাবে ফায়ারবেসে তৈরি হয়েছে!');
    }

    handleResetSeriesForm();
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(settingsForm);
    showToast('success', 'সমস্ত পরিবর্তন ফায়ারবেসে রিয়েল-টাইম সেভ হয়েছে!');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newPass.length < 4) {
      setPassError('পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('উভয় পাসওয়ার্ড মিলছে না।');
      return;
    }

    const success = await changeAdminPassword(newPass);
    if (success) {
      setPassSuccess('এডমিন পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!');
      setNewPass('');
      setConfirmPass('');
    } else {
      setPassError('পাসওয়ার্ড আপডেট ব্যর্থ হয়েছে।');
    }
  };

  const handleSeed = async () => {
    await seedDefaultMovies();
    showToast('success', 'সব মুভি ফায়ারবেসে লোড হয়েছে!');
  };

  const filteredMovies = movies.filter(m => 
    !movieSearch || 
    m.title.toLowerCase().includes(movieSearch.toLowerCase()) ||
    m.category.toLowerCase().includes(movieSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex justify-center animate-fadeIn">
      {/* Mobile-Native Container Frame */}
      <div 
        className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-2xl relative border-x border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-slate-950 text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-sm flex items-center gap-1.5 leading-tight">
                <span>এডমিন মাস্টার কন্ট্রোল</span>
                <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                  FIREBASE LIVE
                </span>
              </div>
              <div className="text-[10px] text-gray-400">
                মুভি পোস্ট, এডস, এপিআই ও ইমেজ হোস্টিং
              </div>
            </div>
          </div>

          <button
            onClick={() => setAdminModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div className={`px-4 py-2 text-xs font-bold flex items-center gap-2 shrink-0 ${
            statusMessage.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* 1. AUTH SCREEN (If Not Logged In) */}
        {!isAdminLoggedIn ? (
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4 border border-amber-200 shadow-sm">
              <KeyRound className="w-8 h-8 text-amber-500" />
            </div>

            <h4 className="text-base font-extrabold text-gray-900 mb-1">
              এডমিন সিকিউরিটি লগইন
            </h4>
            <p className="text-xs text-gray-500 max-w-xs mb-6">
              প্যানেল এক্সেস করতে এডমিন সিক্রেট কোড প্রবেশ করান। কোডটি সুরক্ষিত ও ফায়ারবেসে এনক্রিপ্ট করা রয়েছে।
            </p>

            <form onSubmit={handleLogin} className="w-full max-w-xs space-y-3">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="এডমিন পাসওয়ার্ড দিন"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white text-center font-mono font-bold tracking-widest"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {authError && (
                <div className="text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-xl border border-red-200 flex items-center gap-1.5 justify-center">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-slate-950 hover:bg-black text-white text-xs font-extrabold shadow-md active:scale-98 transition-all cursor-pointer"
              >
                লগইন করুন (Enter Admin)
              </button>
            </form>
          </div>
        ) : (
          /* 2. MOBILE LOGGED-IN DASHBOARD WITH DEDICATED SYSTEM MENUS */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Quick APK Download Action Banner - Always visible at top of Admin */}
            <div className="mx-3 mt-2 px-3 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white rounded-2xl flex items-center justify-between shadow-sm shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black truncate">APK ডাউনলোড সেন্টার</div>
                  <div className="text-[10px] text-emerald-100 truncate">ভার্সন {settingsForm.apkVersion || 'v2.1.0'} • Play Protect Clean</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadApkFile}
                  className="px-3 py-1.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-[11px] font-black shadow-xs cursor-pointer active:scale-95 flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>এখনই ডাউনলোড</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('apk')}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-colors ${
                    activeTab === 'apk' ? 'bg-emerald-900 text-white font-black' : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                >
                  ম্যানেজ
                </button>
              </div>
            </div>

            {/* Scrollable Horizontal Navigation Bar */}
            <div className="flex items-center gap-1.5 border-b border-gray-200 bg-gray-100/95 px-3 py-2 overflow-x-auto text-xs font-bold scrollbar-none shrink-0 mt-1">
              
              {/* 1. APK Download Center Tab - FIRST POSITION FOR INSTANT VISIBILITY */}
              <button
                onClick={() => setActiveTab('apk')}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'apk' 
                    ? 'bg-emerald-600 text-white shadow-md font-black ring-2 ring-emerald-300' 
                    : 'text-emerald-900 bg-emerald-50 border border-emerald-300 font-bold hover:bg-emerald-100'
                }`}
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>📥 APK ডাউনলোড</span>
              </button>

              {/* 2. Movies Tab */}
              <button
                onClick={() => { setActiveTab('movies'); setEditingMovieId(null); }}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'movies' ? 'bg-white text-blue-600 shadow-xs border border-gray-200' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>মুভি ({movies.length})</span>
              </button>

              {/* 3. Add / Edit Movie Tab */}
              <button
                onClick={() => setActiveTab('add')}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'add' ? 'bg-white text-emerald-600 shadow-xs border border-gray-200' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{editingMovieId ? 'মুভি এডিট' : 'মুভি পোস্ট'}</span>
              </button>

              {/* 3.5. YouTube Video / Movie Series Tab (নতুন মেনু) */}
              <button
                onClick={() => { setActiveTab('series'); handleResetSeriesForm(); }}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'series' 
                    ? 'bg-red-600 text-white shadow-md font-bold' 
                    : 'text-red-700 bg-red-50 hover:bg-red-100 border border-red-200'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>ভিডিও সিরিজ ({series.length})</span>
              </button>

              {/* 4. Apps Hub / Shortcuts Tab */}
              <button
                onClick={() => { setActiveTab('apps'); handleResetAppForm(); }}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'apps' ? 'bg-white text-purple-600 shadow-xs border border-gray-200' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-purple-600" />
                <span>অ্যাপস হাব ({appShortcuts.length})</span>
              </button>

              {/* 5. Devices & Downloads Analytics Tab */}
              <button
                onClick={() => setActiveTab('devices')}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'devices' ? 'bg-white text-emerald-600 shadow-xs border border-gray-200' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
                <span>ডিভাইস ট্র্যাকিং ({installedDevices.length || apkAnalytics.totalDevices || 0})</span>
              </button>

              {/* 6. Ads Management Tab */}
              <button
                onClick={() => setActiveTab('ads')}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'ads' ? 'bg-white text-rose-600 shadow-xs border border-gray-200' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5 text-rose-500" />
                <span>এডস ম্যানেজ</span>
              </button>

              {/* 7. Links & API Hub Tab */}
              <button
                onClick={() => setActiveTab('links')}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'links' ? 'bg-white text-indigo-600 shadow-xs border border-gray-200' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Link2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>বিভিন্ন লিংক ও API</span>
              </button>

              {/* 8. Design & Logo Tab */}
              <button
                onClick={() => setActiveTab('design')}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'design' ? 'bg-white text-amber-600 shadow-xs border border-gray-200' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-amber-500" />
                <span>ডিজাইন ও লোগো</span>
              </button>


              {/* 8. Password Tab */}
              <button
                onClick={() => setActiveTab('password')}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'password' ? 'bg-white text-red-600 shadow-xs border border-gray-200' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>পাসওয়ার্ড</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={logoutAdmin}
                className="ml-auto px-2 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* TAB CONTENT: Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-3.5 pb-24 space-y-3">

              {/* ============================================================== */}
              {/* TAB 1: MOVIES LIST */}
              {/* ============================================================== */}
              {activeTab === 'movies' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
                    <span className="text-xs font-extrabold text-gray-700">
                      মোট মুভি: {movies.length} টি
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleSeed}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-1 cursor-pointer"
                        title="Seed default screenshot movies"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>রিলোড ডেমো</span>
                      </button>
                      <button
                        onClick={() => { setEditingMovieId(null); setActiveTab('add'); }}
                        className="px-2.5 py-1 text-[11px] font-bold bg-blue-600 text-white rounded-lg flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>মুভি পোস্ট</span>
                      </button>
                    </div>
                  </div>

                  {/* Search within movies */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="মুভির নাম দিয়ে খুঁজুন..."
                      value={movieSearch}
                      onChange={(e) => setMovieSearch(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    {filteredMovies.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-2 rounded-xl border border-gray-200 bg-white shadow-2xs gap-2.5 hover:border-gray-300 transition-colors"
                      >
                        <img
                          src={m.poster}
                          alt={m.title}
                          className="w-11 h-14 object-cover rounded-lg shrink-0 border border-gray-200 bg-gray-100"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300';
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <h6 className="text-xs font-extrabold text-gray-900 line-clamp-1">
                            {m.title}
                          </h6>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-gray-500">
                            <span className="font-semibold text-blue-600">{m.category}</span>
                            <span>•</span>
                            <span>{m.year}</span>
                            <span>•</span>
                            <span className="text-amber-600 font-bold">★ {m.rating}</span>
                          </div>
                          <div className="text-[9px] text-gray-400 mt-0.5 truncate">
                            {m.audio}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleStartEdit(m)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMovie(m.id, m.title)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 2: ADD / EDIT MOVIE (EXACT REQUIRED FIELDS) */}
              {/* ============================================================== */}
              {activeTab === 'add' && (
                <div className="space-y-3 pb-6">
                  <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
                    <h4 className="text-xs font-extrabold text-gray-900">
                      {editingMovieId ? 'মুভি তথ্য পরিবর্তন করুন' : 'নতুন মুভি পোস্ট করুন'}
                    </h4>
                    {editingMovieId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMovieId(null);
                          setMovieForm({
                            title: '',
                            category: 'South Hindi Dubbed',
                            badgeLabel: 'South Hindi Dubbed Movie',
                            year: '2026',
                            poster: '',
                            quality: '480p 720p 1080p [HD]',
                            duration: '140 মিনিট',
                            downloadUrl: '',
                            description: '',
                            screenshots: [],
                          });
                          setScreenshotList(['']);
                        }}
                        className="text-[11px] text-gray-500 hover:text-gray-800 cursor-pointer"
                      >
                        বাতিল
                      </button>
                    )}
                  </div>

                  {/* 1. Title */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      *Title (মুভির নাম) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: Udaala (2025) Dual Audio UnCut..."
                      value={movieForm.title || ''}
                      onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-hidden focus:bg-white"
                    />
                  </div>

                  {/* 2. পোস্ট ইমেজ (ImgBB Hosting) */}
                  <ImageUploader
                    label="*পোস্ট ইমেজ (Post Image) *"
                    value={movieForm.poster || ''}
                    onChange={(url) => setMovieForm({ ...movieForm, poster: url })}
                    apiKey={settings.imgbbApiKey}
                    placeholder="https://i.ibb.co/... বা ছবি সিলেক্ট করুন"
                    description="ছবি সিলেক্ট করলে ImgBB এপিআই-তে আপলোড হয়ে ফায়ারবেজে সেভ হবে।"
                  />

                  {/* 3. ক্যাটাগরি */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      *ক্যাটাগরি <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={movieForm.category || 'South Hindi Dubbed'}
                      onChange={(e) => setMovieForm({ ...movieForm, category: e.target.value })}
                      className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl cursor-pointer"
                    >
                      {CATEGORIES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* 4 & 5. ব্যাজ টেক্স (ব্যাজ কালার অটোমেটিক সিরিয়াল বসবে) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-gray-700">
                        *ব্যাজ টেক্স (Badge Text)
                      </label>
                      <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        ব্যাজ কালার অটোমেটিক সিরিয়াল মেইনটেইন করবে
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="যেমন: South Hindi Dubbed Movie, Bollywood Hindi Movies"
                      value={movieForm.badgeLabel || ''}
                      onChange={(e) => setMovieForm({ ...movieForm, badgeLabel: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-hidden focus:bg-white"
                    />
                  </div>

                  {/* 6 & 7. মুভি সাল & কোয়ালিটি */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        *মুভি সাল (Year) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="যেমন: 2026"
                        value={movieForm.year || ''}
                        onChange={(e) => setMovieForm({ ...movieForm, year: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        *কোয়ালিটি (Quality) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="যেমন: 480p 720p 1080p [HD]"
                        value={movieForm.quality || ''}
                        onChange={(e) => setMovieForm({ ...movieForm, quality: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* 8. কত মিনিট মুভি সময় */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      *কত মিনিট মুভি সময় (Duration) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: 140 মিনিট অথবা 2h 20min"
                      value={movieForm.duration || ''}
                      onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl"
                    />
                  </div>

                  {/* 9. ডাউনলোড লিংক (একটাই ডাউনলোড লিংক থাকবে) */}
                  <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-1">
                    <label className="block text-[11px] font-extrabold text-blue-900">
                      *ডাউনলোড লিংক (Download Link) <span className="text-red-500">*</span>
                    </label>
                    <p className="text-[10px] text-blue-700">
                      একটিই ডাউনলোড লিংক থাকবে (TeraBox, Drive বা যেকোনো ক্লাউড লিংক)
                    </p>
                    <input
                      type="url"
                      placeholder="https://... সরাসরি ডাউনলোড লিংক"
                      value={movieForm.downloadUrl || movieForm.fastDownloadUrl || movieForm.teraboxUrl || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMovieForm({ 
                          ...movieForm, 
                          downloadUrl: val,
                          fastDownloadUrl: val,
                          teraboxUrl: val,
                          driveUrl: val
                        });
                      }}
                      required
                      className="w-full px-3 py-2 text-xs bg-white border border-blue-300 rounded-xl font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* 10. মুভির বিবরণ */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      *মুভির বিবরণ (Description)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="মুভির কাহিনী সংক্ষেপ বা বিবরণ লিখুন..."
                      value={movieForm.description || ''}
                      onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-hidden focus:bg-white"
                    />
                  </div>

                  {/* 11. নিচের ইমেজ গুলো (স্ক্রিনশট: ১টি অথবা সর্বোচ্চ ৪টি ইমেজ) */}
                  <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-extrabold text-gray-800 block">
                          *নিচের স্ক্রিনশট ইমেজ (১ থেকে ৪টি ইমেজ)
                        </span>
                        <span className="text-[10px] text-gray-500">
                          এখানে ১টি ইমেজও থাকতে পারে আবার ৪টি ইমেজও থাকতে পারে
                        </span>
                      </div>
                      {screenshotList.length < 4 && (
                        <button
                          type="button"
                          onClick={handleAddScreenshot}
                          className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-[10px] font-bold border border-purple-200 cursor-pointer flex items-center gap-1 active:scale-95 transition-all"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ ইমেজ যোগ করুন</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {screenshotList.map((url, index) => (
                        <div key={index} className="relative p-2.5 bg-white rounded-xl border border-gray-200 shadow-2xs">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold text-gray-700">
                              স্ক্রিনশট {index + 1} {index === 0 ? '(১ম ইমেজ)' : '(অপশনাল)'}
                            </span>
                            {screenshotList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveScreenshot(index)}
                                className="text-gray-400 hover:text-red-500 text-[10px] flex items-center gap-0.5 cursor-pointer"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>মুছুন</span>
                              </button>
                            )}
                          </div>
                          <ImageUploader
                            label=""
                            value={url}
                            onChange={(newUrl) => handleUpdateScreenshot(index, newUrl)}
                            apiKey={settings.imgbbApiKey}
                            placeholder={`স্ক্রিনশট ${index + 1} লিংক বা ছবি সিলেক্ট করুন`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveMovie}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingMovieId ? 'ফায়ারবেসে আপডেট করুন' : 'ফায়ারবেসে পোস্ট করুন'}</span>
                  </button>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB: YOUTUBE VIDEO / MOVIE SERIES MANAGEMENT (নতুন মেনু) */}
              {/* ============================================================== */}
              {activeTab === 'series' && (
                <div className="space-y-3 pb-8">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div>
                      <h4 className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                        <Tv className="w-4 h-4 text-red-600" />
                        <span>ইউটিউব মুভি ও ভিডিও সিরিজ</span>
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        এক বা একাধিক পর্বসহ ইউটিউব ভিডিও সিরিজ যুক্ত করুন
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!isSeriesFormOpen && (
                        <>
                          <button
                            type="button"
                            onClick={handleSeedSeries}
                            className="px-2 py-1 text-[10px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-1 cursor-pointer"
                            title="ডেমো সিরিজ লোড করুন"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>ডেমো লোড</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { handleResetSeriesForm(); setIsSeriesFormOpen(true); }}
                            className="px-2.5 py-1 text-[11px] font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>নতুন সিরিজ</span>
                          </button>
                        </>
                      )}
                      {isSeriesFormOpen && (
                        <button
                          type="button"
                          onClick={handleResetSeriesForm}
                          className="px-2.5 py-1 text-[11px] font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg cursor-pointer"
                        >
                          তালিকায় ফিরুন
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 1. CREATE / EDIT SERIES FORM */}
                  {isSeriesFormOpen ? (
                    <form onSubmit={handleSaveSeries} className="space-y-3.5 bg-gray-50/70 p-3 rounded-2xl border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-gray-900">
                          {editingSeriesId ? 'সিরিজের তথ্য ও পর্ব এডিট করুন' : 'নতুন ভিডিও সিরিজ তৈরি করুন'}
                        </span>
                        <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          {seriesEpisodes.length} টি পর্ব
                        </span>
                      </div>

                      {/* Series Title */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          *সিরিজ / মুভির নাম <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="যেমন: কেজিএফ মেগা সাগা সিরিজ অথবা এইচএসসি প্রোগ্রামিং ও আইসিটি"
                          value={seriesForm.title || ''}
                          onChange={(e) => setSeriesForm({ ...seriesForm, title: e.target.value })}
                          required
                          className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500"
                        />
                      </div>

                      {/* Poster Image with ImgBB */}
                      <ImageUploader
                        label="*সিরিজ পোস্টার ইমেজ (Square Poster) *"
                        value={seriesForm.poster || ''}
                        onChange={(url) => setSeriesForm({ ...seriesForm, poster: url })}
                        apiKey={settings.imgbbApiKey}
                        placeholder="পোস্টার ছবির লিংক বা ImgBB-তে আপলোড করুন"
                        description="হোম ফিডে মুভি কার্ডের মতো স্কয়ার পোস্টার হিসেবে প্রদর্শিত হবে।"
                      />

                      {/* Category & Badge */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            *ক্যাটাগরি <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={seriesForm.category || 'South Hindi Dubbed'}
                            onChange={(e) => setSeriesForm({ ...seriesForm, category: e.target.value })}
                            className="w-full px-2.5 py-2 text-xs bg-white border border-gray-300 rounded-xl cursor-pointer"
                          >
                            {CATEGORIES.filter(c => c !== 'All').map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            *ব্যাজ কালার
                          </label>
                          <select
                            value={seriesForm.badgeColor || 'blue'}
                            onChange={(e) => setSeriesForm({ ...seriesForm, badgeColor: e.target.value as any })}
                            className="w-full px-2.5 py-2 text-xs bg-white border border-gray-300 rounded-xl cursor-pointer"
                          >
                            <option value="blue">Blue (নীল)</option>
                            <option value="red">Red (লাল)</option>
                            <option value="green">Green (সবুজ)</option>
                            <option value="orange">Orange (কমলা)</option>
                            <option value="purple">Purple (বেগুনি)</option>
                          </select>
                        </div>
                      </div>

                      {/* Badge Label */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          ফিড ব্যাজ টেক্সট
                        </label>
                        <input
                          type="text"
                          placeholder="যেমন: মুভি সিরিজ • ২ পর্ব অথবা YouTube Exclusive Series"
                          value={seriesForm.badgeLabel || ''}
                          onChange={(e) => setSeriesForm({ ...seriesForm, badgeLabel: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-hidden"
                        />
                      </div>

                      {/* Quality & Year */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            মুভি সাল (Year)
                          </label>
                          <input
                            type="text"
                            placeholder="যেমন: 2026"
                            value={seriesForm.year || '2026'}
                            onChange={(e) => setSeriesForm({ ...seriesForm, year: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            কোয়ালিটি (Quality)
                          </label>
                          <input
                            type="text"
                            placeholder="যেমন: 1080p [HD]"
                            value={seriesForm.quality || '1080p [HD]'}
                            onChange={(e) => setSeriesForm({ ...seriesForm, quality: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          সিরিজের বিবরণ (Description)
                        </label>
                        <textarea
                          rows={2}
                          placeholder="সিরিজের গল্প বা পরিচিতি সংক্ষেপে লিখুন..."
                          value={seriesForm.description || ''}
                          onChange={(e) => setSeriesForm({ ...seriesForm, description: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-hidden"
                        />
                      </div>

                      {/* ============================================== */}
                      {/* DYNAMIC EPISODES LIST (সিরিয়াল পর্বসমূহ) */}
                      {/* ============================================== */}
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h5 className="text-xs font-black text-gray-900 flex items-center gap-1">
                              <PlaySquare className="w-3.5 h-3.5 text-red-600" />
                              <span>সিরিজের পর্বসমূহ (Episodes / Classes)</span>
                            </h5>
                            <p className="text-[10px] text-gray-500">
                              ইউটিউব লিংক পেস্ট করলে স্বয়ংক্রিয়ভাবে ভিডিও আইডি ও থাম্বনেল সেট হবে
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddEpisodeRow}
                            className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            <span>আরও পর্ব যোগ</span>
                          </button>
                        </div>

                        <div className="space-y-3">
                          {seriesEpisodes.map((ep, idx) => {
                            const cleanYt = ep.youtubeId || extractYouTubeId(ep.youtubeUrl);
                            const thumbPreview = getYouTubeThumbnail(cleanYt, ep.thumbnail);

                            return (
                              <div
                                key={ep.id}
                                className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs space-y-2 relative"
                              >
                                <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center">
                                      {idx + 1}
                                    </span>
                                    <span className="text-[11px] font-extrabold text-gray-800">
                                      পর্ব নং {idx + 1}
                                    </span>
                                  </div>

                                  {seriesEpisodes.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveEpisodeRow(idx)}
                                      className="text-red-500 hover:text-red-700 text-[10px] font-bold flex items-center gap-1 hover:bg-red-50 px-2 py-0.5 rounded cursor-pointer transition-colors"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      <span>বাদ দিন</span>
                                    </button>
                                  )}
                                </div>

                                {/* Episode Title */}
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                                    পর্বের নাম / লেকচার টাইটেল <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="যেমন: লেকচার ১: বিশ্ব ও বাংলাদেশ প্রেক্ষিত অথবা পর্ব ১: K.G.F Chapter 1"
                                    value={ep.title}
                                    onChange={(e) => handleUpdateEpisodeRow(idx, { title: e.target.value })}
                                    required
                                    className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:bg-white"
                                  />
                                </div>

                                {/* YouTube URL */}
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                                    ইউটিউব ভিডিও লিংক বা ভিডিও আইডি <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="https://www.youtube.com/watch?v=... বা youtu.be/..."
                                    value={ep.youtubeUrl}
                                    onChange={(e) => handleUpdateEpisodeRow(idx, { youtubeUrl: e.target.value })}
                                    required
                                    className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg font-mono focus:outline-hidden focus:bg-white"
                                  />
                                </div>

                                {/* Badge & Duration */}
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                                      সাব-টাইটেল / ব্যাজ (Badge)
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="যেমন: প্রথম অধ্যায় • আইসিটি"
                                      value={ep.badge || ''}
                                      onChange={(e) => handleUpdateEpisodeRow(idx, { badge: e.target.value })}
                                      className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                                      সময়সীমা (Duration)
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="যেমন: 22:15 বা 2h 30m"
                                      value={ep.duration || ''}
                                      onChange={(e) => handleUpdateEpisodeRow(idx, { duration: e.target.value })}
                                      className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg"
                                    />
                                  </div>
                                </div>

                                {/* Thumbnail Preview */}
                                {cleanYt && (
                                  <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                                    <div className="w-16 aspect-video rounded-md overflow-hidden bg-black shrink-0 relative">
                                      <img
                                        src={thumbPreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                        <Play className="w-3 h-3 text-white fill-white" />
                                      </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>ইউটিউব থাম্বনেল তৈরি হয়েছে</span>
                                      </div>
                                      <div className="text-[9px] text-gray-400 font-mono truncate">
                                        ID: {cleanYt}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          onClick={handleAddEpisodeRow}
                          className="w-full mt-2 py-2 rounded-xl border border-dashed border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>➕ আরও একটি পর্ব যুক্ত করুন</span>
                        </button>
                      </div>

                      {/* Submit Actions */}
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="submit"
                          className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>{editingSeriesId ? 'সিরিজ ফায়ারবেসে আপডেট করুন' : 'সিরিজ ফায়ারবেসে সেভ করুন'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleResetSeriesForm}
                          className="px-4 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold cursor-pointer"
                        >
                          বাতিল
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* 2. SERIES LIST VIEW */
                    <div className="space-y-2.5">
                      {/* Search Bar */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="সিরিজের নাম দিয়ে খুঁজুন..."
                          value={seriesSearch}
                          onChange={(e) => setSeriesSearch(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:bg-white"
                        />
                      </div>

                      {series.length === 0 ? (
                        <div className="py-10 text-center bg-gray-50 rounded-2xl border border-gray-200 p-4">
                          <Tv className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                          <h5 className="text-xs font-bold text-gray-800">
                            কোনো ভিডিও সিরিজ পাওয়া যায়নি
                          </h5>
                          <p className="text-[10px] text-gray-500 mt-1 mb-3">
                            ইউটিউব ভিডিও বা মুভি সিরিজ যুক্ত করতে নিচের বাটনে চাপ দিন।
                          </p>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => { handleResetSeriesForm(); setIsSeriesFormOpen(true); }}
                              className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 cursor-pointer"
                            >
                              নতুন সিরিজ তৈরি করুন
                            </button>
                            <button
                              type="button"
                              onClick={handleSeedSeries}
                              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-300 cursor-pointer"
                            >
                              ডেমো লোড করুন
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {series
                            .filter(s => !seriesSearch || s.title.toLowerCase().includes(seriesSearch.toLowerCase()) || s.category.toLowerCase().includes(seriesSearch.toLowerCase()))
                            .map((s) => (
                              <div
                                key={s.id}
                                className="p-2.5 rounded-xl border border-gray-200 bg-white shadow-2xs hover:border-gray-300 transition-colors"
                              >
                                <div className="flex items-center justify-between gap-2.5">
                                  <img
                                    src={s.poster}
                                    alt={s.title}
                                    className="w-12 h-14 object-cover rounded-lg shrink-0 border border-gray-200 bg-gray-100"
                                    onError={(e) => {
                                      e.currentTarget.src = 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300';
                                    }}
                                  />
                                  <div className="min-w-0 flex-1">
                                    <h6 className="text-xs font-extrabold text-gray-900 line-clamp-1">
                                      {s.title}
                                    </h6>
                                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-gray-500 flex-wrap">
                                      <span className="font-semibold text-blue-600">{s.category}</span>
                                      <span>•</span>
                                      <span className="font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                                        {s.episodes?.length || 0}টি পর্ব
                                      </span>
                                    </div>
                                    <div className="text-[9px] text-gray-400 mt-0.5 truncate">
                                      {s.badgeLabel || 'YouTube Exclusive Series'}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditSeries(s)}
                                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                      title="Edit"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSeries(s.id, s.title)}
                                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Preview of episodes inside this series */}
                                {s.episodes && s.episodes.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[9px]">
                                    {s.episodes.map((ep, idx) => (
                                      <span
                                        key={ep.id}
                                        className="shrink-0 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium max-w-[140px] truncate"
                                      >
                                        #{idx + 1} {ep.title}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB: APPS HUB MANAGEMENT (অ্যাপস হাব ও শর্টকাট ম্যানেজমেন্ট) */}
              {/* ============================================================== */}
              {activeTab === 'apps' && (
                <div className="space-y-4 pb-8">
                  {/* Header Title & Seeding button */}
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div>
                      <h4 className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                        <LayoutGrid className="w-4 h-4 text-purple-600" />
                        <span>অ্যাপস হাব ও শর্টকাট কন্ট্রোল</span>
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Favorite ও Paisa Kamao সেকশনে অ্যাপ ও গেম পোস্ট করুন।
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm('আপনি কি ডিফল্ট অ্যাপ ও গেমগুলো ফায়ারবেসে রিস্টোর করতে চান?')) {
                          await seedDefaultAppShortcuts();
                          showToast('success', 'ডিফল্ট অ্যাপগুলো ফায়ারবেসে সফলভাবে লোড হয়েছে!');
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-[10px] font-bold border border-purple-200 cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>ডিফল্ট অ্যাপ রিস্টোর</span>
                    </button>
                  </div>

                  {/* 1. App Post / Edit Form */}
                  <form onSubmit={handleSaveAppShortcut} className="p-3.5 bg-gray-50/90 border border-gray-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                      <span className="text-xs font-extrabold text-gray-800 flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5 text-purple-600" />
                        <span>{editingAppId ? 'অ্যাপ এডিট করুন' : 'নতুন অ্যাপ বা গেম যোগ করুন'}</span>
                      </span>
                      {editingAppId && (
                        <button
                          type="button"
                          onClick={handleResetAppForm}
                          className="text-[10px] text-red-600 hover:underline font-bold"
                        >
                          এডিট বাতিল
                        </button>
                      )}
                    </div>

                    {/* App Title & Badge */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          অ্যাপ / গেমের নাম <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="যেমন: YouTube, PKPK-88, 777BD"
                          value={appForm.title || ''}
                          onChange={(e) => setAppForm({ ...appForm, title: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          ব্যাজ / ট্যাগ
                        </label>
                        <input
                          type="text"
                          placeholder="HOT / 18+ / NEW"
                          value={appForm.badge || ''}
                          onChange={(e) => setAppForm({ ...appForm, badge: e.target.value })}
                          className="w-full px-2 py-2 text-xs bg-white border border-gray-300 rounded-xl uppercase text-red-600 font-bold"
                        />
                      </div>
                    </div>

                    {/* Section Selection */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        সেকশন নির্বাচন করুন
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setAppForm({ ...appForm, section: 'Favorite' })}
                          className={`py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            appForm.section === 'Favorite'
                              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          Favorite
                        </button>
                        <button
                          type="button"
                          onClick={() => setAppForm({ ...appForm, section: 'Paisa Kamao' })}
                          className={`py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            appForm.section === 'Paisa Kamao'
                              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          Paisa Kamao
                        </button>
                        <button
                          type="button"
                          onClick={() => setAppForm({ ...appForm, section: 'custom' })}
                          className={`py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            appForm.section === 'custom'
                              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          অন্যান্য / নতুন
                        </button>
                      </div>

                      {appForm.section === 'custom' && (
                        <input
                          type="text"
                          placeholder="নতুন সেকশনের নাম লিখুন..."
                          value={customSection}
                          onChange={(e) => setCustomSection(e.target.value)}
                          className="w-full mt-2 px-3 py-1.5 text-xs bg-white border border-purple-300 rounded-xl"
                        />
                      )}
                    </div>

                    {/* Target Link */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        টার্গেট লিঙ্ক (ক্লিক করলে যে সাইট বা অ্যাপে নিয়ে যাবে) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={appForm.url || ''}
                        onChange={(e) => setAppForm({ ...appForm, url: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl font-mono"
                        required
                      />
                    </div>

                    {/* App Icon Upload via ImgBB API */}
                    <div>
                      <ImageUploader
                        label="অ্যাপ আইকন ইমেজ (ImgBB এপিআই হোস্টিং)"
                        value={appForm.iconUrl || ''}
                        onChange={(url) => setAppForm({ ...appForm, iconUrl: url })}
                        apiKey={settingsForm.imgbbApiKey}
                        placeholder="আইকন ইমেজ সিলেক্ট বা লিংক পেস্ট করুন"
                        description="আইকনটি সরাসরি ImgBB এপিআইতে আপলোড হয়ে ফায়ারবেসে সেভ হবে।"
                      />
                    </div>

                    {/* Order & Active */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                          ডিসপ্লে ক্রম (Order)
                        </label>
                        <input
                          type="number"
                          value={appForm.order ?? 1}
                          onChange={(e) => setAppForm({ ...appForm, order: parseInt(e.target.value) || 1 })}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-xl"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-4">
                        <input
                          type="checkbox"
                          id="appActiveCheck"
                          checked={appForm.active !== false}
                          onChange={(e) => setAppForm({ ...appForm, active: e.target.checked })}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <label htmlFor="appActiveCheck" className="text-xs font-bold text-gray-700 cursor-pointer">
                          অ্যাপ চালু রাখুন
                        </label>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-98 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingAppId ? 'ফায়ারবেসে আপডেট করুন' : 'ফায়ারবেসে অ্যাপ সেভ করুন'}</span>
                    </button>
                  </form>

                  {/* 2. Middle Sponsored Ad Settings */}
                  <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-xs text-gray-800">
                        স্পন্সরড ব্যানার এড (Middle Sponsored Card)
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.appsSponsoredAd?.active ?? true}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            appsSponsoredAd: {
                              ...settingsForm.appsSponsoredAd,
                              active: e.target.checked,
                              title: settingsForm.appsSponsoredAd?.title || 'MEXC: Buy Bitcoin & Crypto',
                              subtitle: settingsForm.appsSponsoredAd?.subtitle || '31,000,000 KSKD Up for Grabs',
                              imageUrl: settingsForm.appsSponsoredAd?.imageUrl || '',
                              iconUrl: settingsForm.appsSponsoredAd?.iconUrl || '',
                              targetUrl: settingsForm.appsSponsoredAd?.targetUrl || 'https://videodownloader.site',
                              buttonText: settingsForm.appsSponsoredAd?.buttonText || 'INSTALL'
                            }
                          })}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="text-xs font-bold text-gray-700">চালু রাখুন</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                          এড টাইটেল
                        </label>
                        <input
                          type="text"
                          value={settingsForm.appsSponsoredAd?.title || ''}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            appsSponsoredAd: {
                              ...settingsForm.appsSponsoredAd,
                              active: settingsForm.appsSponsoredAd?.active ?? true,
                              title: e.target.value,
                              subtitle: settingsForm.appsSponsoredAd?.subtitle || '',
                              imageUrl: settingsForm.appsSponsoredAd?.imageUrl || '',
                              iconUrl: settingsForm.appsSponsoredAd?.iconUrl || '',
                              targetUrl: settingsForm.appsSponsoredAd?.targetUrl || '',
                              buttonText: settingsForm.appsSponsoredAd?.buttonText || 'INSTALL'
                            }
                          })}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-gray-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                          বাটন টেক্সট
                        </label>
                        <input
                          type="text"
                          value={settingsForm.appsSponsoredAd?.buttonText || 'INSTALL'}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            appsSponsoredAd: {
                              ...settingsForm.appsSponsoredAd,
                              active: settingsForm.appsSponsoredAd?.active ?? true,
                              title: settingsForm.appsSponsoredAd?.title || '',
                              subtitle: settingsForm.appsSponsoredAd?.subtitle || '',
                              imageUrl: settingsForm.appsSponsoredAd?.imageUrl || '',
                              iconUrl: settingsForm.appsSponsoredAd?.iconUrl || '',
                              targetUrl: settingsForm.appsSponsoredAd?.targetUrl || '',
                              buttonText: e.target.value
                            }
                          })}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-gray-300 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                        স্ক্রিপ্ট এড কোড (Script Tag / Banner Code) - অপশনাল
                      </label>
                      <textarea
                        rows={3}
                        placeholder="<script> ... </script> (এখানে স্ক্রিপ্ট কোড দিলে সরাসরি স্ক্রিপ্ট ব্যানার শো করবে)"
                        value={settingsForm.appsSponsoredAd?.scriptCode ?? DEFAULT_FEED_AD_SCRIPT}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          appsSponsoredAd: {
                            ...settingsForm.appsSponsoredAd,
                            active: settingsForm.appsSponsoredAd?.active ?? true,
                            title: settingsForm.appsSponsoredAd?.title || '',
                            subtitle: settingsForm.appsSponsoredAd?.subtitle || '',
                            imageUrl: settingsForm.appsSponsoredAd?.imageUrl || '',
                            iconUrl: settingsForm.appsSponsoredAd?.iconUrl || '',
                            targetUrl: settingsForm.appsSponsoredAd?.targetUrl || '',
                            buttonText: settingsForm.appsSponsoredAd?.buttonText || 'INSTALL',
                            scriptCode: e.target.value
                          }
                        })}
                        className="w-full px-2.5 py-1.5 text-[11px] font-mono bg-white border border-gray-300 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                        টার্গেট লিংক (ক্লিক করলে যাবে)
                      </label>
                      <input
                        type="text"
                        value={settingsForm.appsSponsoredAd?.targetUrl || ''}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          appsSponsoredAd: {
                            ...settingsForm.appsSponsoredAd,
                            active: settingsForm.appsSponsoredAd?.active ?? true,
                            title: settingsForm.appsSponsoredAd?.title || '',
                            subtitle: settingsForm.appsSponsoredAd?.subtitle || '',
                            imageUrl: settingsForm.appsSponsoredAd?.imageUrl || '',
                            iconUrl: settingsForm.appsSponsoredAd?.iconUrl || '',
                            targetUrl: e.target.value,
                            buttonText: settingsForm.appsSponsoredAd?.buttonText || 'INSTALL',
                            scriptCode: settingsForm.appsSponsoredAd?.scriptCode || ''
                          }
                        })}
                        className="w-full px-2 py-1.5 text-xs bg-white border border-gray-300 rounded-xl font-mono"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      স্পন্সরড এড ফায়ারবেসে সেভ করুন
                    </button>
                  </div>

                  {/* 3. Existing Apps List */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-gray-800">
                        বিদ্যমান অ্যাপ ও গেমসমূহ ({appShortcuts.length})
                      </span>
                      <input
                        type="text"
                        placeholder="অ্যাপ খুঁজুন..."
                        value={appSearch}
                        onChange={(e) => setAppSearch(e.target.value)}
                        className="px-2.5 py-1 text-xs bg-white border border-gray-300 rounded-lg w-32"
                      />
                    </div>

                    <div className="space-y-1.5 max-h-72 overflow-y-auto">
                      {appShortcuts
                        .filter((a) => !appSearch || a.title.toLowerCase().includes(appSearch.toLowerCase()) || a.section?.toLowerCase().includes(appSearch.toLowerCase()))
                        .map((app) => (
                          <div
                            key={app.id}
                            className="p-2 bg-white border border-gray-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs hover:border-purple-300 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                                {app.iconUrl ? (
                                  <img
                                    src={app.iconUrl}
                                    alt={app.title}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/1055/1055666.png';
                                    }}
                                  />
                                ) : (
                                  <LayoutGrid className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-gray-900 truncate">
                                    {app.title}
                                  </span>
                                  <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded-md font-bold">
                                    {app.section}
                                  </span>
                                  {app.badge && (
                                    <span className="text-[8px] bg-red-100 text-red-600 px-1 py-0.2 rounded font-black">
                                      {app.badge}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-gray-400 truncate font-mono block">
                                  {app.url}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEditApp(app)}
                                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-purple-100 text-gray-600 hover:text-purple-700 flex items-center justify-center cursor-pointer transition-colors"
                                title="এডিট করুন"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteApp(app.id, app.title)}
                                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-700 flex items-center justify-center cursor-pointer transition-colors"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 4: ADS MANAGEMENT MENU (এডস ও বিজ্ঞাপন ম্যানেজমেন্ট) */}
              {/* ============================================================== */}
              {activeTab === 'ads' && (
                <form onSubmit={handleSaveSettings} className="space-y-4 pb-8">
                  <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
                    <div>
                      <h4 className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                        <Megaphone className="w-4 h-4 text-rose-600" />
                        <span>এডস ও বিজ্ঞাপন কন্ট্রোল প্যানেল (পেজ অনুযায়ী সিরিয়াল)</span>
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        প্রতিটি পেজের বিজ্ঞাপন আলাদা আলাদা সেকশনে সিরিয়াল অনুযায়ী সাজানো রয়েছে।
                      </p>
                    </div>
                  </div>

                  {/* ============================================================== */}
                  {/* ১. হোম পেজ এডস (HOME PAGE ADS) */}
                  {/* ============================================================== */}
                  <div className="p-3.5 bg-gradient-to-br from-rose-50/50 to-orange-50/30 border border-rose-200/90 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between pb-1.5 border-b border-rose-200/60">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-rose-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                          ১
                        </span>
                        <div>
                          <div className="font-extrabold text-xs text-gray-900">
                            হোম পেজ এডস (Home Page Ads)
                          </div>
                          <div className="text-[10px] text-rose-700 font-medium">
                            ফিডের মধ্যে একটা পর পর এড এবং টপ ব্যানার
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ১.১ হোম ইন-ফিড স্ক্রিপ্ট এডস (একটা মুভি একটা এডস) */}
                    <div className="p-3 bg-white border border-rose-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-gray-900 block">
                            ১.১ মুভি ফিড স্ক্রিপ্ট এড (একটা মুভি একটা এডস)
                          </span>
                          <span className="text-[10px] text-emerald-600 font-semibold">
                            ★ প্রতিটি মুভির পরে পরে একটি করে এই এডস আসবে
                          </span>
                        </div>
                        <label className="flex items-center gap-1.5 cursor-pointer bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                          <input
                            type="checkbox"
                            checked={settingsForm.homeFeedAd?.active ?? true}
                            onChange={(e) => setSettingsForm({
                              ...settingsForm,
                              homeFeedAd: {
                                active: e.target.checked,
                                scriptCode: settingsForm.homeFeedAd?.scriptCode || DEFAULT_FEED_AD_SCRIPT,
                                interval: 1
                              }
                            })}
                            className="w-4 h-4 text-rose-600 rounded"
                          />
                          <span className="text-[11px] font-bold text-rose-900">চালু রাখুন</span>
                        </label>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          স্ক্রিপ্ট এড কোড (Script Tag / HTML Code)
                        </label>
                        <textarea
                          rows={6}
                          placeholder="<script> ... </script>"
                          value={settingsForm.homeFeedAd?.scriptCode ?? DEFAULT_FEED_AD_SCRIPT}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            homeFeedAd: {
                              active: settingsForm.homeFeedAd?.active ?? true,
                              scriptCode: e.target.value,
                              interval: 1
                            }
                          })}
                          className="w-full px-3 py-2 text-[11px] font-mono bg-gray-50 border border-gray-300 rounded-xl focus:outline-hidden focus:bg-white focus:border-rose-500 leading-relaxed"
                        />
                        <p className="text-[10px] text-gray-500 mt-1">
                          এখানে আপনার দেওয়া Brijmohan / Monetag / Google AdSense ইত্যাদি যেকোনো স্ক্রিপ্ট কোড পেস্ট করলে প্রতিটি মুভির নিচে নিরাপদে লোড হবে।
                        </p>
                      </div>
                    </div>

                    {/* ১.২ হোম টপ ব্যানার এড */}
                    <div className="p-3 bg-white border border-gray-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-800">
                          ১.২ হোম পেজ টপ ব্যানার এড (Top Banner Ad)
                        </span>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settingsForm.bannerAd?.active || false}
                            onChange={(e) => setSettingsForm({
                              ...settingsForm,
                              bannerAd: {
                                active: e.target.checked,
                                imageUrl: settingsForm.bannerAd?.imageUrl || '',
                                targetUrl: settingsForm.bannerAd?.targetUrl || 'https://videodownloader.site',
                                scriptCode: settingsForm.bannerAd?.scriptCode || ''
                              }
                            })}
                            className="w-4 h-4 text-rose-600 rounded"
                          />
                          <span className="text-xs font-bold text-gray-700">চালু রাখুন</span>
                        </label>
                      </div>

                      <ImageUploader
                        label="ব্যানার ইমেজ (ImgBB হোস্টিং)"
                        value={settingsForm.bannerAd?.imageUrl || ''}
                        onChange={(url) => setSettingsForm({
                          ...settingsForm,
                          bannerAd: {
                            ...settingsForm.bannerAd,
                            active: settingsForm.bannerAd?.active ?? true,
                            imageUrl: url,
                            targetUrl: settingsForm.bannerAd?.targetUrl || 'https://videodownloader.site',
                            scriptCode: settingsForm.bannerAd?.scriptCode || ''
                          }
                        })}
                        apiKey={settingsForm.imgbbApiKey}
                        placeholder="ব্যানার ছবি আপলোড করুন বা লিংক দিন"
                      />

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          ব্যানারে ক্লিক করলে কোন লিংকে যাবে (Target URL)
                        </label>
                        <input
                          type="text"
                          placeholder="https://..."
                          value={settingsForm.bannerAd?.targetUrl || ''}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            bannerAd: {
                              ...settingsForm.bannerAd,
                              active: settingsForm.bannerAd?.active ?? true,
                              imageUrl: settingsForm.bannerAd?.imageUrl || '',
                              targetUrl: e.target.value,
                              scriptCode: settingsForm.bannerAd?.scriptCode || ''
                            }
                          })}
                          className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-xl font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ============================================================== */}
                  {/* ২. মুভি ডিটেইলস পেজ এডস (MOVIE DETAILS PAGE ADS) */}
                  {/* ============================================================== */}
                  <div className="p-3.5 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 border border-blue-200/90 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between pb-1.5 border-b border-blue-200/60">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                          ২
                        </span>
                        <div>
                          <div className="font-extrabold text-xs text-gray-900">
                            মুভি ডিটেইলস পেজ এডস (Movie Details Page Ads)
                          </div>
                          <div className="text-[10px] text-blue-700 font-medium">
                            ডাউনলোড বাটনের নিচে প্রদর্শিত হবে
                          </div>
                        </div>
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
                        <input
                          type="checkbox"
                          checked={settingsForm.movieDetailAd ? settingsForm.movieDetailAd.active !== false : true}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            movieDetailAd: {
                              active: e.target.checked,
                              scriptCode: settingsForm.movieDetailAd?.scriptCode || settingsForm.homeFeedAd?.scriptCode || DEFAULT_FEED_AD_SCRIPT,
                              imageUrl: settingsForm.movieDetailAd?.imageUrl || '',
                              targetUrl: settingsForm.movieDetailAd?.targetUrl || 'https://videodownloader.site'
                            }
                          })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-[11px] font-bold text-blue-900">চালু রাখুন</span>
                      </label>
                    </div>

                    <div className="p-3 bg-white border border-blue-100 rounded-xl space-y-2">
                      <div className="text-[10px] text-gray-500">
                        ★ এই এডসটি মুভি ডিটেইলস পেজের উপরে, ডাউনলোড বাটনের নিচে, স্ক্রিনশটের নিচে এবং রিলেটেড মুভির মাঝে লাইভ লোড হবে।
                      </div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        ডিটেইলস পেজ স্ক্রিপ্ট এড কোড (Script Tag / Banner Code)
                      </label>
                      <textarea
                        rows={4}
                        placeholder="ফাঁকা রাখলে স্বয়ংক্রিয়ভাবে ডিফল্ট স্ক্রিপ্ট এড দেখাবে..."
                        value={settingsForm.movieDetailAd?.scriptCode ?? DEFAULT_MOVIE_DETAIL_AD_SCRIPT}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          movieDetailAd: {
                            active: settingsForm.movieDetailAd?.active ?? true,
                            scriptCode: e.target.value,
                            imageUrl: settingsForm.movieDetailAd?.imageUrl || '',
                            targetUrl: settingsForm.movieDetailAd?.targetUrl || ''
                          }
                        })}
                        className="w-full px-3 py-2 text-[11px] font-mono bg-gray-50 border border-gray-300 rounded-xl focus:outline-hidden focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* ============================================================== */}
                  {/* ৩. অ্যাপস ও গেমস হাব পেজ এডস (APPS HUB ADS) */}
                  {/* ============================================================== */}
                  <div className="p-3.5 bg-gradient-to-br from-purple-50/50 to-pink-50/30 border border-purple-200/90 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between pb-1.5 border-b border-purple-200/60">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                          ৩
                        </span>
                        <div>
                          <div className="font-extrabold text-xs text-gray-900">
                            অ্যাপস ও গেমস হাব পেজ এডস (Apps Hub Sponsored)
                          </div>
                          <div className="text-[10px] text-purple-700 font-medium">
                            মাঝের গোল বাটনে ঢোকার পর Favorite এবং Paisa Kamao-র মাঝের বিজ্ঞাপন
                          </div>
                        </div>
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer bg-purple-50 px-2 py-1 rounded-lg border border-purple-200">
                        <input
                          type="checkbox"
                          checked={settingsForm.appsSponsoredAd?.active ?? true}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            appsSponsoredAd: {
                              ...settingsForm.appsSponsoredAd,
                              active: e.target.checked,
                              title: settingsForm.appsSponsoredAd?.title || 'MEXC: Buy Bitcoin & Crypto',
                              subtitle: settingsForm.appsSponsoredAd?.subtitle || '31,000,000 KSKD Up for Grabs',
                              imageUrl: settingsForm.appsSponsoredAd?.imageUrl || '',
                              iconUrl: settingsForm.appsSponsoredAd?.iconUrl || '',
                              targetUrl: settingsForm.appsSponsoredAd?.targetUrl || 'https://videodownloader.site',
                              buttonText: settingsForm.appsSponsoredAd?.buttonText || 'INSTALL',
                              scriptCode: settingsForm.appsSponsoredAd?.scriptCode || ''
                            }
                          })}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="text-[11px] font-bold text-purple-900">চালু রাখুন</span>
                      </label>
                    </div>

                    <div className="p-3 bg-white border border-purple-100 rounded-xl space-y-2.5">
                      {/* Optional Custom Script Code */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          স্ক্রিপ্ট এড কোড (Script Tag / HTML Code) - অপশনাল
                        </label>
                        <textarea
                          rows={4}
                          placeholder="<script> ... </script> (এখানে স্ক্রিপ্ট কোড দিলে সরাসরি এড শো করবে)"
                          value={settingsForm.appsSponsoredAd?.scriptCode ?? DEFAULT_FEED_AD_SCRIPT}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            appsSponsoredAd: {
                              ...settingsForm.appsSponsoredAd,
                              active: settingsForm.appsSponsoredAd?.active ?? true,
                              title: settingsForm.appsSponsoredAd?.title || '',
                              subtitle: settingsForm.appsSponsoredAd?.subtitle || '',
                              imageUrl: settingsForm.appsSponsoredAd?.imageUrl || '',
                              iconUrl: settingsForm.appsSponsoredAd?.iconUrl || '',
                              targetUrl: settingsForm.appsSponsoredAd?.targetUrl || '',
                              buttonText: settingsForm.appsSponsoredAd?.buttonText || 'INSTALL',
                              scriptCode: e.target.value
                            }
                          })}
                          className="w-full px-3 py-2 text-[11px] font-mono bg-gray-50 border border-gray-300 rounded-xl focus:outline-hidden focus:bg-white focus:border-purple-500 leading-relaxed"
                        />
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          স্ক্রিপ্ট কোড দিলে স্বয়ংক্রিয়ভাবে ব্যানার স্ক্রিপ্ট লোড হবে। ফাঁকা রাখলে নিচের স্পন্সরড কার্ডটি দেখাবে।
                        </p>
                      </div>

                      <div className="pt-1 border-t border-gray-100">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-2">
                          অথবা স্পন্সরড কার্ড কনফিগারেশন:
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
                              এড টাইটেল
                            </label>
                            <input
                              type="text"
                              value={settingsForm.appsSponsoredAd?.title || ''}
                              onChange={(e) => setSettingsForm({
                                ...settingsForm,
                                appsSponsoredAd: {
                                  ...settingsForm.appsSponsoredAd,
                                  active: settingsForm.appsSponsoredAd?.active ?? true,
                                  title: e.target.value,
                                  subtitle: settingsForm.appsSponsoredAd?.subtitle || '',
                                  imageUrl: settingsForm.appsSponsoredAd?.imageUrl || '',
                                  iconUrl: settingsForm.appsSponsoredAd?.iconUrl || '',
                                  targetUrl: settingsForm.appsSponsoredAd?.targetUrl || '',
                                  buttonText: settingsForm.appsSponsoredAd?.buttonText || 'INSTALL',
                                  scriptCode: settingsForm.appsSponsoredAd?.scriptCode || ''
                                }
                              })}
                              className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
                              বাটন টেক্সট
                            </label>
                            <input
                              type="text"
                              value={settingsForm.appsSponsoredAd?.buttonText || 'INSTALL'}
                              onChange={(e) => setSettingsForm({
                                ...settingsForm,
                                appsSponsoredAd: {
                                  ...settingsForm.appsSponsoredAd,
                                  active: settingsForm.appsSponsoredAd?.active ?? true,
                                  title: settingsForm.appsSponsoredAd?.title || '',
                                  subtitle: settingsForm.appsSponsoredAd?.subtitle || '',
                                  imageUrl: settingsForm.appsSponsoredAd?.imageUrl || '',
                                  iconUrl: settingsForm.appsSponsoredAd?.iconUrl || '',
                                  targetUrl: settingsForm.appsSponsoredAd?.targetUrl || '',
                                  buttonText: e.target.value,
                                  scriptCode: settingsForm.appsSponsoredAd?.scriptCode || ''
                                }
                              })}
                              className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="mt-2">
                          <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
                            টার্গেট লিংক (ক্লিক করলে যাবে)
                          </label>
                          <input
                            type="text"
                            value={settingsForm.appsSponsoredAd?.targetUrl || ''}
                            onChange={(e) => setSettingsForm({
                              ...settingsForm,
                              appsSponsoredAd: {
                                ...settingsForm.appsSponsoredAd,
                                active: settingsForm.appsSponsoredAd?.active ?? true,
                                title: settingsForm.appsSponsoredAd?.title || '',
                                subtitle: settingsForm.appsSponsoredAd?.subtitle || '',
                                imageUrl: settingsForm.appsSponsoredAd?.imageUrl || '',
                                iconUrl: settingsForm.appsSponsoredAd?.iconUrl || '',
                                targetUrl: e.target.value,
                                buttonText: settingsForm.appsSponsoredAd?.buttonText || 'INSTALL',
                                scriptCode: settingsForm.appsSponsoredAd?.scriptCode || ''
                              }
                            })}
                            className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-xl font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ============================================================== */}
                  {/* ৪. ডাউনলোড পেজ এডস (DOWNLOAD PAGE ADS - 300x250) */}
                  {/* ============================================================== */}
                  <div className="p-3.5 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border border-emerald-200/90 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200/60">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                          ৪
                        </span>
                        <div>
                          <div className="font-extrabold text-xs text-gray-900">
                            ডাউনলোড পেজ এডস (Download Page 300x250 Ads)
                          </div>
                          <div className="text-[10px] text-emerald-700 font-medium">
                            ডাউনলোড পেজের সোশাল আইকনগুলোর নিচে প্রদর্শিত বিজ্ঞাপন
                          </div>
                        </div>
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                        <input
                          type="checkbox"
                          checked={settingsForm.downloadPageAd?.active ?? true}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            downloadPageAd: {
                              active: e.target.checked,
                              scriptCode: settingsForm.downloadPageAd?.scriptCode || DEFAULT_DOWNLOAD_AD_SCRIPT,
                              count: settingsForm.downloadPageAd?.count || 5
                            }
                          })}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span className="text-[11px] font-bold text-emerald-900">চালু রাখুন</span>
                      </label>
                    </div>

                    <div className="p-3 bg-white border border-emerald-100 rounded-xl space-y-2">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          ডাউনলোড পেজ স্ক্রিপ্ট এড কোড (Script Tag / HTML Code)
                        </label>
                        <textarea
                          rows={6}
                          placeholder="<script> ... </script>"
                          value={settingsForm.downloadPageAd?.scriptCode ?? DEFAULT_DOWNLOAD_AD_SCRIPT}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            downloadPageAd: {
                              active: settingsForm.downloadPageAd?.active ?? true,
                              scriptCode: e.target.value,
                              count: settingsForm.downloadPageAd?.count || 5
                            }
                          })}
                          className="w-full px-3 py-2 text-[11px] font-mono bg-gray-50 border border-gray-300 rounded-xl focus:outline-hidden focus:bg-white focus:border-emerald-500 leading-relaxed"
                        />
                        <p className="text-[10px] text-gray-500 mt-1">
                          এখানে আপনার দেওয়া GlamourPicklesSteward / AdSense / ইত্যাদি যেকোনো 300x250 স্ক্রিপ্ট কোড সেভ করলে ডাউনলোড পেজে ফায়ারবেস থেকে সাথে সাথে আপডেট হবে।
                        </p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          কয়টি এডস দেখাবে (Ad Count)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={15}
                          value={settingsForm.downloadPageAd?.count || 5}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            downloadPageAd: {
                              active: settingsForm.downloadPageAd?.active ?? true,
                              scriptCode: settingsForm.downloadPageAd?.scriptCode || DEFAULT_DOWNLOAD_AD_SCRIPT,
                              count: parseInt(e.target.value) || 5
                            }
                          })}
                          className="w-32 px-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ============================================================== */}
                  {/* ৫. মিউজিক পেজ এড (MUSIC PAGE AD - 300x250) */}
                  {/* ============================================================== */}
                  <div className="p-3.5 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 border border-indigo-200/90 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between pb-1.5 border-b border-indigo-200/60">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                          M
                        </span>
                        <div>
                          <div className="font-extrabold text-xs text-gray-900">
                            মিউজিক পেজ এড (Music Page 300x250 Ad)
                          </div>
                          <div className="text-[10px] text-indigo-700 font-medium">
                            মিউজিক পেজে ফায়ারবেস থেকে সরাসরি রিয়েল-টাইম লোড হবে
                          </div>
                        </div>
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-200">
                        <input
                          type="checkbox"
                          checked={settingsForm.musicPageAd?.active ?? true}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            musicPageAd: {
                              active: e.target.checked,
                              scriptCode: settingsForm.musicPageAd?.scriptCode || DEFAULT_MUSIC_PAGE_AD_SCRIPT,
                              scriptCode1: settingsForm.musicPageAd?.scriptCode1 || DEFAULT_MUSIC_PAGE_AD_SCRIPT,
                              scriptCode2: ''
                            }
                          })}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <span className="text-[11px] font-bold text-indigo-900">চালু রাখুন</span>
                      </label>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          অ্যাডস্ স্ক্রিপ্ট কোড (Ad Script Code)
                        </label>
                        <textarea
                          rows={4}
                          value={settingsForm.musicPageAd?.scriptCode ?? settingsForm.musicPageAd?.scriptCode1 ?? DEFAULT_MUSIC_PAGE_AD_SCRIPT}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            musicPageAd: {
                              active: settingsForm.musicPageAd?.active ?? true,
                              scriptCode: e.target.value,
                              scriptCode1: e.target.value,
                              scriptCode2: ''
                            }
                          })}
                          className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-xl font-mono text-gray-700 focus:bg-white"
                          placeholder="<script>...</script>"
                        />
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          এখানে দেওয়া 300x250 স্ক্রিপ্ট কোড মিউজিক পেজে সরাসরি ফায়ারবেস রিয়েল-টাইম থেকে চলবে।
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ============================================================== */}
                  {/* ৬. পপ-আপ এডস (POPUP AD MODAL) */}
                  {/* ============================================================== */}
                  <div className="p-3.5 bg-gradient-to-br from-amber-50/50 to-yellow-50/30 border border-amber-200/90 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between pb-1.5 border-b border-amber-200/60">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-amber-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                          ৫
                        </span>
                        <div>
                          <div className="font-extrabold text-xs text-gray-900">
                            পপ-আপ / ইন্টারস্টিশিয়াল এড (Popup Ad Modal)
                          </div>
                          <div className="text-[10px] text-amber-800 font-medium">
                            সাইট ওপেন করলে ভেসে ওঠা মডাল বিজ্ঞাপন
                          </div>
                        </div>
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                        <input
                          type="checkbox"
                          checked={settingsForm.popupAd?.active || false}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            popupAd: {
                              active: e.target.checked,
                              title: settingsForm.popupAd?.title || 'স্পেশাল অফার ও আপডেট',
                              imageUrl: settingsForm.popupAd?.imageUrl || '',
                              targetUrl: settingsForm.popupAd?.targetUrl || 'https://videodownloader.site',
                              buttonText: settingsForm.popupAd?.buttonText || 'এখনই দেখুন'
                            }
                          })}
                          className="w-4 h-4 text-amber-600 rounded"
                        />
                        <span className="text-[11px] font-bold text-amber-900">চালু রাখুন</span>
                      </label>
                    </div>

                    <div className="p-3 bg-white border border-amber-100 rounded-xl space-y-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
                          পপআপ টাইটেল
                        </label>
                        <input
                          type="text"
                          value={settingsForm.popupAd?.title || ''}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            popupAd: {
                              ...settingsForm.popupAd,
                              active: settingsForm.popupAd?.active ?? true,
                              title: e.target.value,
                              imageUrl: settingsForm.popupAd?.imageUrl || '',
                              targetUrl: settingsForm.popupAd?.targetUrl || '',
                              buttonText: settingsForm.popupAd?.buttonText || 'এখনই দেখুন'
                            }
                          })}
                          className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-xl"
                        />
                      </div>

                      <ImageUploader
                        label="পপআপ ইমেজ (ImgBB হোস্টিং)"
                        value={settingsForm.popupAd?.imageUrl || ''}
                        onChange={(url) => setSettingsForm({
                          ...settingsForm,
                          popupAd: {
                            ...settingsForm.popupAd,
                            active: settingsForm.popupAd?.active ?? true,
                            title: settingsForm.popupAd?.title || 'স্পেশাল অফার',
                            imageUrl: url,
                            targetUrl: settingsForm.popupAd?.targetUrl || '',
                            buttonText: settingsForm.popupAd?.buttonText || 'এখনই দেখুন'
                          }
                        })}
                        apiKey={settingsForm.imgbbApiKey}
                        placeholder="পপআপ ইমেজ আপলোড করুন"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
                            টার্গেট লিংক
                          </label>
                          <input
                            type="text"
                            value={settingsForm.popupAd?.targetUrl || ''}
                            onChange={(e) => setSettingsForm({
                              ...settingsForm,
                              popupAd: {
                                ...settingsForm.popupAd,
                                active: settingsForm.popupAd?.active ?? true,
                                title: settingsForm.popupAd?.title || '',
                                imageUrl: settingsForm.popupAd?.imageUrl || '',
                                targetUrl: e.target.value,
                                buttonText: settingsForm.popupAd?.buttonText || 'এখনই দেখুন'
                              }
                            })}
                            className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-xl font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
                            বাটন টেক্সট
                          </label>
                          <input
                            type="text"
                            value={settingsForm.popupAd?.buttonText || 'এখনই দেখুন'}
                            onChange={(e) => setSettingsForm({
                              ...settingsForm,
                              popupAd: {
                                ...settingsForm.popupAd,
                                active: settingsForm.popupAd?.active ?? true,
                                title: settingsForm.popupAd?.title || '',
                                imageUrl: settingsForm.popupAd?.imageUrl || '',
                                targetUrl: settingsForm.popupAd?.targetUrl || '',
                                buttonText: e.target.value
                              }
                            })}
                            className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ============================================================== */}
                  {/* ৬. ডিরেক্ট এড নেটওয়ার্ক লিংক (DIRECT AD NETWORK LINK) */}
                  {/* ============================================================== */}
                  <div className="p-3.5 bg-gradient-to-br from-cyan-50/50 to-sky-50/30 border border-cyan-200/90 rounded-2xl space-y-2.5">
                    <div className="flex items-center gap-2 pb-1 border-b border-cyan-200/60">
                      <span className="w-6 h-6 rounded-lg bg-cyan-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        ৬
                      </span>
                      <div>
                        <div className="font-extrabold text-xs text-gray-900">
                          ডিরেক্ট এড নেটওয়ার্ক লিংক (Monetag / Adsterra / Direct Link)
                        </div>
                        <div className="text-[10px] text-cyan-800 font-medium">
                          যেকোনো বিজ্ঞাপন নেটওয়ার্কের ডিরেক্ট ট্রাফিক লিংক
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-emerald-100 rounded-xl space-y-1.5">
                      <input
                        type="text"
                        placeholder="https://..."
                        value={settingsForm.directAdLink || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, directAdLink: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl font-mono"
                      />
                      <p className="text-[10px] text-gray-500">
                        যেকোনো থার্ড-পার্টি এড নেটওয়ার্কের ডিরেক্ট লিংক এখানে দিলে তা রিয়েল-টাইমে আপডেট হবে।
                      </p>
                    </div>
                  </div>

                  {/* ============================================================== */}
                  {/* ৭. গ্লোবাল কাস্টম এড স্ক্রিপ্ট (GLOBAL AD CODE) */}
                  {/* ============================================================== */}
                  <div className="p-3.5 bg-gradient-to-br from-gray-50 to-slate-100 border border-gray-200 rounded-2xl space-y-2.5">
                    <div className="flex items-center gap-2 pb-1 border-b border-gray-200">
                      <span className="w-6 h-6 rounded-lg bg-slate-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        ৭
                      </span>
                      <div>
                        <div className="font-extrabold text-xs text-gray-900">
                          গ্লোবাল কাস্টম এড স্ক্রিপ্ট (Global Ad Code / Popunder)
                        </div>
                        <div className="text-[10px] text-gray-500 font-medium">
                          পুরো ওয়েবসাইটের ব্যাকগ্রাউন্ড পপআন্ডার বা অটো-এডস কোড
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-gray-200 rounded-xl space-y-1.5">
                      <textarea
                        rows={3}
                        placeholder="<script> ... </script>"
                        value={settingsForm.customAdCode || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, customAdCode: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white text-xs font-black shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>এডস সেটিংস ফায়ারবেসে সেভ করুন (Firebase Live Save)</span>
                  </button>
                </form>
              )}

              {/* ============================================================== */}
              {/* TAB 4: ALL LINKS & API HUB MENU (বিভিন্ন লিংক ও এপিআই সেটিংস) */}
              {/* ============================================================== */}
              {activeTab === 'links' && (
                <form onSubmit={handleSaveSettings} className="space-y-3.5 pb-6">
                  <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
                    <h4 className="text-xs font-extrabold text-gray-900 flex items-center gap-1.5">
                      <Link2 className="w-4 h-4 text-indigo-600" />
                      <span>সকল ওয়েবসাইট লিংক ও API হাব</span>
                    </h4>
                  </div>

                  {/* ImgBB Image Hosting API Key */}
                  <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-1.5">
                    <label className="block text-[11px] font-black text-indigo-950 flex items-center gap-1.5">
                      <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
                      <span>ImgBB ইমেজ হোস্টিং API Key (মূল এপিআই)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e7b8f8955ab261abec0ccdce4c38d9a9"
                      value={settingsForm.imgbbApiKey || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, imgbbApiKey: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-indigo-300 rounded-xl font-mono text-indigo-900 font-bold"
                    />
                    <p className="text-[10px] text-indigo-800 leading-tight">
                      সমস্ত পোস্টার, লোগো এবং ব্যানার ইমেজ এই এপিআই-এর মাধ্যমে ক্লাউডে হোস্ট হয়ে স্বয়ংক্রিয়ভাবে ফায়ারবেসে জমা হবে।
                    </p>
                  </div>

                  {/* Search Bar Redirect URL */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      উপরে সার্চ বারে ক্লিক করলে যে লিংকে যাবে (Search Redirect URL)
                    </label>
                    <input
                      type="text"
                      placeholder="https://videodownloader.site"
                      value={settingsForm.searchRedirectUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, searchRedirectUrl: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl font-mono"
                    />
                  </div>

                  {/* Quick Action Box 1: Tanning movie */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        বক্স ১ টাইটেল (Tanning movie)
                      </label>
                      <input
                        type="text"
                        placeholder="Tanning movie"
                        value={settingsForm.quickBox1Text || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, quickBox1Text: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        বক্স ১ লিংক (ঐচ্ছিক)
                      </label>
                      <input
                        type="text"
                        placeholder="https://videodownloader.site"
                        value={settingsForm.quickBox1Url || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, quickBox1Url: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  {/* Quick Action Box 2: 18+ */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        বক্স ২ টাইটেল (18+)
                      </label>
                      <input
                        type="text"
                        placeholder="18+"
                        value={settingsForm.quickBox2Text || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, quickBox2Text: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl text-red-600 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        18+ রিডাইরেক্ট লিংক
                      </label>
                      <input
                        type="text"
                        placeholder="https://tinyurl.com/2waz6wm2"
                        value={settingsForm.quickBox2Url || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, quickBox2Url: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  {/* Realtime Firebase Connected Contact Channels */}
                  <div className="p-3.5 bg-sky-50/60 border border-sky-200 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4 text-sky-600" />
                      <span className="text-xs font-black text-sky-950">
                        যোগাযোগ মাধ্যম সেটিংস (Contact & Telegram - Firebase Realtime)
                      </span>
                    </div>
                    <p className="text-[10px] text-sky-800 leading-tight">
                      এখানে যে লিংক ও নাম দেবেন তা সরাসরি ফায়ারবেসে সেভ হবে এবং মেনুতে রিয়েল-টাইমে আপডেট হয়ে যাবে।
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {/* Telegram Label */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-700 mb-1">
                          টেলিগ্রাম বাটনের নাম
                        </label>
                        <input
                          type="text"
                          placeholder="Telegram"
                          value={settingsForm.telegramLabel || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, telegramLabel: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl"
                        />
                      </div>

                      {/* Telegram URL */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-700 mb-1">
                          টেলিগ্রাম লিংক
                        </label>
                        <input
                          type="text"
                          placeholder="https://t.me/flickcove_official"
                          value={settingsForm.telegramUrl || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, telegramUrl: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl font-mono"
                        />
                      </div>

                      {/* Contact Label */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-700 mb-1">
                          কন্টাক্ট বাটনের নাম
                        </label>
                        <input
                          type="text"
                          placeholder="Contact"
                          value={settingsForm.contactLabel || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, contactLabel: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl"
                        />
                      </div>

                      {/* Contact URL */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-700 mb-1">
                          কন্টাক্ট / সাপোর্ট লিংক (WhatsApp / Phone / Web URL)
                        </label>
                        <input
                          type="text"
                          placeholder="https://chat.whatsapp.com/sample"
                          value={settingsForm.contactUrl ?? settingsForm.whatsappUrl ?? ''}
                          onChange={(e) => setSettingsForm({ 
                            ...settingsForm, 
                            contactUrl: e.target.value,
                            whatsappUrl: e.target.value 
                          })}
                          className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Share / Invite Friends Link */}
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1.5">
                    <label className="block text-[11px] font-black text-emerald-950 flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>বন্ধুদের আমন্ত্রণ শেয়ার লিংক (Invite / Share Link)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={settingsForm.shareInviteUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, shareInviteUrl: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-emerald-300 rounded-xl font-mono text-emerald-950 font-bold"
                    />
                    <p className="text-[10px] text-emerald-800 leading-tight">
                      মেনু থেকে "বন্ধুদের আমন্ত্রণ জানান" অপশনে ক্লিক করলে এই লিংকটি শেয়ার হবে। এখানে পরিবর্তন করলে তা সাথে সাথে ফায়ারবেসে আপডেট হয়ে যাবে।
                    </p>
                  </div>

                  {/* YouTube Data API Key */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      YouTube Data API v3 Key (ঐচ্ছিক)
                    </label>
                    <input
                      type="text"
                      placeholder="AIzaSy..."
                      value={settingsForm.youtubeApiKey || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, youtubeApiKey: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>সকল লিংক ফায়ারবেসে সেভ করুন</span>
                  </button>
                </form>
              )}

              {/* ============================================================== */}
              {/* TAB 5: DESIGN & BRANDING MENU (ডিজাইন ও লোগো) */}
              {/* ============================================================== */}
              {activeTab === 'design' && (
                <form onSubmit={handleSaveSettings} className="space-y-4 pb-6">
                  <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
                    <h4 className="text-xs font-extrabold text-gray-900 flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-amber-600" />
                      <span>ওয়েবসাইট ডিজাইন, লোগো ও ব্র্যান্ডিং</span>
                    </h4>
                  </div>

                  {/* Website Title */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      ওয়েবসাইট টাইটেল / নাম
                    </label>
                    <input
                      type="text"
                      value={settingsForm.siteTitle || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, siteTitle: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl"
                    />
                  </div>

                  {/* Header Logo Upload */}
                  <ImageUploader
                    label="হেডার অ্যাপ লোগো (Header Logo Image)"
                    value={settingsForm.headerLogoUrl || ''}
                    onChange={(url) => setSettingsForm({ ...settingsForm, headerLogoUrl: url })}
                    apiKey={settingsForm.imgbbApiKey}
                    placeholder="লোগো সিলেক্ট বা পেস্ট করুন"
                    description="নতুন লোগো আপলোড করলে সাথে সাথে হেডারে রিয়েল-টাইম পরিবর্তন হবে।"
                  />

                  {/* Bottom APK Icon Logo */}
                  <ImageUploader
                    label="বটম ন্যাভিগেশন সেন্টার APK লোগো"
                    value={settingsForm.appLogoUrl || ''}
                    onChange={(url) => setSettingsForm({ ...settingsForm, appLogoUrl: url })}
                    apiKey={settingsForm.imgbbApiKey}
                    placeholder="APK লোগো সিলেক্ট বা পেস্ট করুন"
                  />

                  {/* Notice Banner */}
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800">
                        নোটিশ ব্যানার (Notice Bar)
                      </span>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.showNotice}
                          onChange={(e) => setSettingsForm({ ...settingsForm, showNotice: e.target.checked })}
                          className="w-4 h-4 text-amber-600 rounded"
                        />
                        <span className="text-xs font-bold text-gray-700">চালু রাখুন</span>
                      </label>
                    </div>
                    <textarea
                      rows={2}
                      value={settingsForm.noticeBanner}
                      onChange={(e) => setSettingsForm({ ...settingsForm, noticeBanner: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl"
                    />
                  </div>

                  {/* Quick Action Boxes Controls */}
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                    <span className="text-xs font-bold text-gray-800 block">
                      কুইক অ্যাকশন বাটন কন্ট্রোল
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                          বক্স ১ টেক্সট (Tanning movie)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.quickBox1Text || 'Tanning movie'}
                          onChange={(e) => setSettingsForm({ ...settingsForm, quickBox1Text: e.target.value })}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-gray-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                          বক্স ২ টেক্সট (18+)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.quickBox2Text || '18+'}
                          onChange={(e) => setSettingsForm({ ...settingsForm, quickBox2Text: e.target.value })}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-gray-300 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>ডিজাইন ও লোগো ফায়ারবেসে সেভ করুন</span>
                  </button>
                </form>
              )}

              {/* ============================================================== */}
              {/* TAB 6: APK DOWNLOAD & RELEASE MANAGEMENT HUB */}
              {/* ============================================================== */}
              {activeTab === 'apk' && (
                <div className="space-y-4 pb-8 animate-fadeIn">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div>
                      <h4 className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                        <Download className="w-4 h-4 text-emerald-600" />
                        <span>অ্যান্ড্রয়েড APK ডাউনলোড সেন্টার ও রিলিজ কন্ট্রোল</span>
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        সরাসরি APK ফাইল ডাউনলোড করুন, ডাউনলোড লিংক পরিবর্তন করুন এবং ইউজারদের সাথে শেয়ার করুন।
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{settingsForm.apkVersion || 'v2.1.0'}</span>
                    </div>
                  </div>

                  {/* 1. HERO DIRECT DOWNLOAD STATION CARD */}
                  <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950 p-4 sm:p-5 text-white border border-emerald-500/30 shadow-xl">
                    <div className="absolute -right-8 -top-8 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10 space-y-3.5">
                      {/* App Identity Row */}
                      <div className="flex items-center gap-3">
                        <img 
                          src={settingsForm.appLogoUrl || "https://i.ibb.co/Fqs3RwWH/file-00000000bf7881f4911ee0ce9ad5fa1e.png"} 
                          alt="APK Logo" 
                          className="w-14 h-14 rounded-2xl shadow-lg border-2 border-emerald-400/80 object-cover shrink-0 bg-slate-800"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-black text-white tracking-wide truncate">
                              CineStream BD Official APK
                            </h3>
                            <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-emerald-500 text-slate-950">
                              {settingsForm.apkVersion || 'v2.1.0'}
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-200/90 font-medium mt-0.5">
                            মোবাইল-ফ্রেন্ডলি Android APK • প্যাকেজ: com.cinestream.app
                          </p>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 mt-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>গুগল প্লে প্রোটেক্ট ১০০% ক্লিন ও ভেরিফাইড (কোনো ওয়ার্নিং নেই)</span>
                          </div>
                        </div>
                      </div>

                      {/* Specs Badge Grid */}
                      <div className="grid grid-cols-3 gap-1.5 py-1 text-center">
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                          <div className="text-[9px] text-gray-400 font-semibold">ফাইল সাইজ</div>
                          <div className="text-xs font-black text-emerald-300">4.3 MB (রিলিজ)</div>
                        </div>
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                          <div className="text-[9px] text-gray-400 font-semibold">অ্যান্ড্রয়েড ভার্সন</div>
                          <div className="text-xs font-black text-white">5.1 – 15+</div>
                        </div>
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                          <div className="text-[9px] text-gray-400 font-semibold">মোট ডাউনলোড</div>
                          <div className="text-xs font-black text-emerald-400">{apkAnalytics.totalDownloads} বার</div>
                        </div>
                      </div>

                      {/* PRIMARY ACTION: DIRECT APK DOWNLOAD BUTTON */}
                      <button
                        type="button"
                        onClick={handleDownloadApkFile}
                        className="w-full py-3.5 px-4 rounded-2xl bg-linear-to-r from-emerald-500 via-teal-500 to-green-500 hover:from-emerald-600 hover:to-green-600 active:scale-98 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer group"
                      >
                        <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                        <span>📥 সরাসরি APK ফাইল ডাউনলোড করুন ({settingsForm.apkVersion || 'v2.1.0'})</span>
                      </button>

                      {/* Quick Action Buttons */}
                      <div className="grid grid-cols-3 gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={handleCopyApkLink}
                          className="py-2 px-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-white/10 active:scale-95"
                        >
                          <Copy className="w-3.5 h-3.5 text-emerald-300" />
                          <span>লিংক কপি</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleShareApk}
                          className="py-2 px-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-white/10 active:scale-95"
                        >
                          <Share2 className="w-3.5 h-3.5 text-teal-300" />
                          <span>শেয়ার করুন</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab('devices')}
                          className="py-2 px-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-white/10 active:scale-95"
                        >
                          <BarChart3 className="w-3.5 h-3.5 text-cyan-300" />
                          <span>লাইভ ট্র্যাকিং</span>
                        </button>
                      </div>

                      {/* Active Download Target Note */}
                      <div className="text-[10px] text-gray-300/80 bg-white/5 rounded-xl px-2.5 py-1.5 flex items-center justify-between border border-white/5 truncate">
                        <span className="truncate">
                          ডাউনলোড সোর্স: <span className="text-emerald-300 font-mono">{settingsForm.apkDownloadUrl ? settingsForm.apkDownloadUrl : 'GitHub Actions Release / কাস্টম APK'}</span>
                        </span>
                        {settingsForm.apkDownloadUrl && (
                          <a 
                            href={settingsForm.apkDownloadUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 underline font-bold shrink-0 ml-2"
                          >
                            টেস্ট ওপেন
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. APK CONFIGURATION FORM (FIREBASE REAL-TIME SAVED) */}
                  <form onSubmit={handleSaveSettings} className="space-y-3 pt-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
                      <h4 className="text-xs font-extrabold text-gray-900 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                        <span>APK ডাউনলোড লিংক ও ভার্সন সেটিংস</span>
                      </h4>
                      <span className="text-[10px] text-gray-500 font-semibold">Firebase সিঙ্ক</span>
                    </div>

                    {/* APK Logo */}
                    <ImageUploader
                      label="APK অ্যাপ লোগো (APK App Logo)"
                      value={settingsForm.appLogoUrl || ''}
                      onChange={(url) => setSettingsForm({ ...settingsForm, appLogoUrl: url })}
                      apiKey={settingsForm.imgbbApiKey}
                      placeholder="APK লোগো লিংক বা ফাইল আপলোড করুন"
                      description="APK ডাউনলোড কার্ড, PWA ইনস্টল মোডাল এবং অ্যান্ড্রয়েড অ্যাপ আইকন হিসেবে এটি ব্যবহৃত হবে।"
                    />

                    {/* APK Direct Download URL */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-gray-700">
                          APK ফাইল ডাউনলোড ডিরেক্ট লিংক (Direct Download URL)
                        </label>
                        {settingsForm.apkDownloadUrl && (
                          <a
                            href={settingsForm.apkDownloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5"
                          >
                            <span>লিংক টেস্ট করুন</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="https://drive.google.com/... অথবা Mediafire লিংক (খালি রাখলে ডিফল্ট ইন্টারনাল APK নামবে)"
                        value={settingsForm.apkDownloadUrl}
                        onChange={(e) => setSettingsForm({ ...settingsForm, apkDownloadUrl: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl font-mono"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">
                        * গুগল ড্রাইভ, মিডিয়াফায়ার, ফায়ারবেস স্টোরেজ বা গিটহাবের ডিরেক্ট ডাউনলোড লিংক এখানে বসিয়ে সেভ করতে পারবেন।
                      </p>
                    </div>

                    {/* Version Code */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        বর্তমান APK ভার্সন কোড (Version Code)
                      </label>
                      <input
                        type="text"
                        placeholder="v2.1.0"
                        value={settingsForm.apkVersion}
                        onChange={(e) => setSettingsForm({ ...settingsForm, apkVersion: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl font-mono font-bold"
                      />
                    </div>

                    {/* Changelog */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        আপডেট চেঞ্জলগ (নতুন কী সুবিধা যোগ হলো)
                      </label>
                      <textarea
                        rows={3}
                        value={settingsForm.apkUpdateChangelog}
                        onChange={(e) => setSettingsForm({ ...settingsForm, apkUpdateChangelog: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl"
                        placeholder="• নতুন মুভি ডাউনলোড ও স্ক্রিনশট ভিউ&#10;• আল্ট্রা ফাস্ট প্লেয়ার ও লাইটওয়েট APK"
                      />
                    </div>

                    {/* Force Update Modal */}
                    <div className="flex items-center gap-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                      <input
                        type="checkbox"
                        id="forceUpdate"
                        checked={settingsForm.forceApkUpdate}
                        onChange={(e) => setSettingsForm({ ...settingsForm, forceApkUpdate: e.target.checked })}
                        className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                      />
                      <label htmlFor="forceUpdate" className="text-xs font-bold text-amber-900 cursor-pointer">
                        ইউজারদের জন্য বাধ্যতামূলক আপডেট পপআপ চালু করুন (Force Update Modal)
                      </label>
                    </div>

                    {/* Save to Firebase */}
                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>APK সেটিংস ও লিংক ফায়ারবেসে সেভ করুন</span>
                    </button>
                  </form>

                  {/* 3. GOOGLE PLAY PROTECT COMPLIANCE CARD */}
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>প্লে প্রোটেক্ট ১০০% ক্লিন থাকার প্রযুক্তিগত নিশ্চয়তা:</span>
                    </div>
                    <ul className="text-[11px] text-emerald-800/90 space-y-1 pl-5 list-disc font-medium">
                      <li>কোনো বিপজ্জনক বা অনাকাঙ্ক্ষিত পারমিশন নেই (শুধুমাত্র সাধারণ ইন্টারনেট পারমিশন)।</li>
                      <li>আধুনিক Android SDK 34 (Android 14/15) সম্পূর্ণ কমপ্লায়েন্ট।</li>
                      <li>V2 এবং V3 সাইনিং স্কিম সমর্থিত নিজস্ব কী-স্টোর সুরক্ষা।</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 7: DEVICES & DOWNLOADS ANALYTICS (REAL-TIME FIREBASE) */}
              {/* ============================================================== */}
              {activeTab === 'devices' && (
                <div className="space-y-3.5 pb-8 animate-fadeIn">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div>
                      <h4 className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                        <BarChart3 className="w-4 h-4 text-emerald-600" />
                        <span>ডিভাইস ও APK ডাউনলোড লাইভ ট্র্যাকিং</span>
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Firebase Realtime ডাটাবেজ থেকে সরাসরি সিঙ্ক হচ্ছে।
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>LIVE SYNC</span>
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Card 1: Total Downloads */}
                    <div className="p-3 rounded-2xl bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-200 shadow-2xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                          মোট APK ডাউনলোড
                        </span>
                        <div className="w-6 h-6 rounded-lg bg-emerald-200/60 text-emerald-700 flex items-center justify-center">
                          <Download className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-emerald-950">
                        {apkAnalytics.totalDownloads}
                      </div>
                      <div className="text-[10px] text-emerald-700/80 mt-0.5">
                        ডাউনলোড বাটনে মোট ক্লিক
                      </div>
                    </div>

                    {/* Card 2: Total Installed Phones */}
                    <div className="p-3 rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-2xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                          মোট ইনস্টল ফোন
                        </span>
                        <div className="w-6 h-6 rounded-lg bg-blue-200/60 text-blue-700 flex items-center justify-center">
                          <Smartphone className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-blue-950">
                        {Math.max(apkAnalytics.totalDevices, installedDevices.length)}
                      </div>
                      <div className="text-[10px] text-blue-700/80 mt-0.5">
                        ইউনিক ফোনে অ্যাপ সক্রিয়
                      </div>
                    </div>

                    {/* Card 3: Active Recently */}
                    <div className="p-3 rounded-2xl bg-linear-to-br from-purple-50 to-pink-50 border border-purple-200 shadow-2xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">
                          সক্রিয় ফোন
                        </span>
                        <div className="w-6 h-6 rounded-lg bg-purple-200/60 text-purple-700 flex items-center justify-center">
                          <Radio className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-purple-950">
                        {installedDevices.filter(d => {
                          if (!d.lastSeen) return false;
                          const diffHours = (Date.now() - new Date(d.lastSeen).getTime()) / (1000 * 60 * 60);
                          return diffHours <= 24;
                        }).length || Math.min(1, Math.max(apkAnalytics.totalDevices, installedDevices.length))}
                      </div>
                      <div className="text-[10px] text-purple-700/80 mt-0.5">
                        গত ২৪ ঘণ্টায় সক্রিয়
                      </div>
                    </div>

                    {/* Card 4: Native APK vs PWA Ratio */}
                    <div className="p-3 rounded-2xl bg-linear-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-2xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                          APK বনাম ওয়েব
                        </span>
                        <div className="w-6 h-6 rounded-lg bg-amber-200/60 text-amber-700 flex items-center justify-center">
                          <Users className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div className="text-sm font-black text-amber-950 flex items-center gap-1.5 mt-1">
                        <span className="text-emerald-700 font-extrabold">
                          APK: {installedDevices.filter(d => d.isApk || d.platform?.includes('APK')).length}
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="text-blue-700 font-extrabold">
                          PWA: {installedDevices.filter(d => !d.isApk && !d.platform?.includes('APK')).length}
                        </span>
                      </div>
                      <div className="text-[10px] text-amber-700/80 mt-1">
                        ইনস্টলেশন টাইপ ব্রেকডাউন
                      </div>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                        <span>সংযুক্ত ফোনের তালিকা ({installedDevices.length})</span>
                      </span>
                      {apkAnalytics.lastUpdated && (
                        <span className="text-[10px] text-gray-400">
                          আপডেট: {new Date(apkAnalytics.lastUpdated).toLocaleTimeString('bn-BD')}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="ফোন মডেল (Samsung, Xiaomi, Vivo) বা ID দিয়ে সার্চ..."
                      value={deviceSearch}
                      onChange={(e) => setDeviceSearch(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-hidden focus:bg-white"
                    />
                  </div>

                  {/* Devices List */}
                  {installedDevices.length === 0 ? (
                    <div className="py-8 px-4 text-center bg-gray-50 rounded-2xl border border-gray-200">
                      <Smartphone className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <h5 className="text-xs font-bold text-gray-800">
                        এখনো কোনো ফোন রেকর্ড জমা হয়নি
                      </h5>
                      <p className="text-[11px] text-gray-500 mt-1 max-w-xs mx-auto">
                        ইউজাররা যখন ব্রাউজার বা ফোনে APK অ্যাপ ওপেন করবে, তখন রিয়েল-টাইমে ফায়ারবেস তাদের মডেল ও ইনফো সেভ করবে।
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {installedDevices
                        .filter(dev => 
                          !deviceSearch || 
                          dev.deviceModel?.toLowerCase().includes(deviceSearch.toLowerCase()) ||
                          dev.platform?.toLowerCase().includes(deviceSearch.toLowerCase()) ||
                          dev.deviceId?.toLowerCase().includes(deviceSearch.toLowerCase())
                        )
                        .map((dev, idx) => {
                          const isOnline = dev.lastSeen && (Date.now() - new Date(dev.lastSeen).getTime()) < 5 * 60 * 1000;
                          return (
                            <div 
                              key={dev.deviceId || idx}
                              className="p-3 bg-white rounded-2xl border border-gray-200 shadow-2xs hover:border-gray-300 transition-all space-y-1.5"
                            >
                              {/* Top Bar: Model & Status */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                    isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'
                                  }`} title={isOnline ? 'বর্তমানে অনলাইন' : 'অফলাইন'} />
                                  <span className="text-xs font-extrabold text-gray-900 truncate">
                                    {dev.deviceModel || 'অজানা ফোন মডেল'}
                                  </span>
                                </div>

                                <div className="shrink-0">
                                  {dev.isApk || dev.platform?.includes('APK') ? (
                                    <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                      <Smartphone className="w-2.5 h-2.5" />
                                      Android APK
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                                      {dev.platform || 'PWA / Web'}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Middle Details Grid */}
                              <div className="grid grid-cols-3 gap-1 py-1 px-2 bg-gray-50 rounded-xl text-[10px] text-gray-600 font-medium">
                                <div>
                                  <span className="text-gray-400 block text-[9px]">ভার্সন:</span>
                                  <span className="font-bold text-gray-800">v{dev.appVersion || '1.2.0'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400 block text-[9px]">ওপেন সংখ্যা:</span>
                                  <span className="font-bold text-gray-800">{dev.totalOpens || 1} বার</span>
                                </div>
                                <div>
                                  <span className="text-gray-400 block text-[9px]">ডিসপ্লে:</span>
                                  <span className="font-bold text-gray-800 truncate block">{dev.screenResolution || 'মোবাইল'}</span>
                                </div>
                              </div>

                              {/* Timestamps */}
                              <div className="flex items-center justify-between text-[10px] text-gray-500 pt-0.5">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-gray-400" />
                                  <span>
                                    প্রথম ইন্সটল: {dev.installedAt ? new Date(dev.installedAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' }) : 'আজ'}
                                  </span>
                                </div>

                                <div className="font-semibold text-gray-700">
                                  {isOnline ? (
                                    <span className="text-emerald-600 font-bold">এখনই সক্রিয়</span>
                                  ) : (
                                    <span>
                                      লাস্ট একটিভ: {dev.lastSeen ? new Date(dev.lastSeen).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) : 'অজানা'}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-[9px] text-gray-400 font-mono truncate border-t border-gray-100 pt-1">
                                Device ID: {dev.deviceId}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 8: CHANGE PASSWORD */}
              {/* ============================================================== */}
              {activeTab === 'password' && (
                <form onSubmit={handleChangePassword} className="space-y-3 max-w-xs mx-auto py-4">
                  <div className="text-center pb-1.5 border-b border-gray-100">
                    <h4 className="text-xs font-extrabold text-gray-900">
                      এডমিন পাসওয়ার্ড পরিবর্তন
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      নিরাপদ পিন বা পাসওয়ার্ড দিয়ে পরিবর্তন করুন।
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      নতুন পাসওয়ার্ড দিন
                    </label>
                    <input
                      type="password"
                      placeholder="নতুন পাসওয়ার্ড"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      নতুন পাসওয়ার্ড পুনরায় লিখুন
                    </label>
                    <input
                      type="password"
                      placeholder="পুনরায় পাসওয়ার্ড"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl font-mono"
                    />
                  </div>

                  {passError && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                      {passError}
                    </div>
                  )}

                  {passSuccess && (
                    <div className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      {passSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md active:scale-98 transition-all cursor-pointer"
                  >
                    পাসওয়ার্ড সেভ করুন
                  </button>
                </form>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
};
