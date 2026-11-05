import React from 'react';
import { MovieProvider, useMovieContext } from './context/MovieContext';
import { Header } from './components/Header';
import { MovieCard } from './components/MovieCard';
import { SeriesCard } from './components/SeriesCard';
import { SeriesDetailModal } from './components/SeriesDetailModal';
import { SeriesPlayerModal } from './components/SeriesPlayerModal';
import { BottomNav } from './components/BottomNav';
import { MovieDetailModal } from './components/MovieDetailModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { ApkUpdateModal } from './components/ApkUpdateModal';
import { InstallPwaModal } from './components/InstallPwaModal';
import { QuickActionBoxes } from './components/QuickActionBoxes';
import { DownloadsView } from './components/DownloadsView';
import { MoreView } from './components/MoreView';
import { AppsHubView } from './components/AppsHubView';
import { BannerAd } from './components/BannerAd';
import { PopupAdModal } from './components/PopupAdModal';
import { ScriptAdBanner, DEFAULT_FEED_AD_SCRIPT } from './components/ScriptAdBanner';
import { InAppBrowserModal } from './components/InAppBrowserModal';
import { VidMaxAiView } from './components/VidMaxAiView';
import { MusicView } from './components/MusicView';
import { Film } from 'lucide-react';
import { recordAppLaunch } from './utils/deviceTracker';

const MainContent: React.FC = () => {
  const { 
    movies, 
    series,
    activeCategory, 
    searchQuery, 
    setSearchQuery, 
    setActiveCategory,
    activeTab,
    settings
  } = useMovieContext();

  // Register device telemetry and ping on app launch
  React.useEffect(() => {
    recordAppLaunch(settings.apkVersion || '1.2.0');
  }, [settings.apkVersion]);

  // Filter movies by category and search query
  const filteredMovies = movies.filter((movie) => {
    const matchesCategory = 
      activeCategory === 'All' ||
      movie.category.toLowerCase() === activeCategory.toLowerCase() ||
      movie.genres?.some((g) => g.toLowerCase() === activeCategory.toLowerCase());

    const matchesSearch = 
      !searchQuery ||
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.year.includes(searchQuery) ||
      (movie.audio && movie.audio.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // Filter series by category and search query
  const filteredSeries = series.filter((item) => {
    const matchesCategory = 
      activeCategory === 'All' ||
      item.category.toLowerCase() === activeCategory.toLowerCase();

    const matchesSearch = 
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.episodes.some((e) => e.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const hasAnyItems = filteredMovies.length > 0 || filteredSeries.length > 0;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center text-gray-900 font-sans antialiased selection:bg-red-500 selection:text-white">
      {/* Mobile-optimized Container matching Android APK frame */}
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-2xl relative border-x border-gray-200">
        {/* Sticky Header */}
        <Header />

        {/* Scrollable Main View Area */}
        <main className="flex-1 overflow-y-auto pb-20 px-3 pt-2">
          {/* Real-time Banner Ad from Firebase */}
          <BannerAd />

          {activeTab === 'home' && (
            <>
              {/* Quick Action Boxes (Trending Movie & 18+) */}
              <QuickActionBoxes />

              {/* Feed - Instant real-time display from Firebase */}
              {!hasAnyItems ? (
                <div className="py-12 px-4 text-center bg-gray-50 rounded-2xl border border-gray-200">
                  <Film className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-gray-800">
                    কোনো মুভি বা ভিডিও পাওয়া যায়নি
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 mb-3">
                    অন্য ক্যাটাগরি বা অন্য নাম দিয়ে সার্চ করে দেখুন।
                  </p>
                  <button
                    onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                    className="px-3.5 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
                  >
                    সকল মুভি ও সিরিজ দেখুন
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {/* 1. YouTube Video / Movie Series (Matching User's Request: হোম ফিডে সিরিয়াল মুভি ও ভিডিও চলে আসবে) */}
                  {filteredSeries.map((s) => (
                    <React.Fragment key={s.id}>
                      <SeriesCard series={s} />
                      {settings.homeFeedAd?.active !== false && (
                        <ScriptAdBanner 
                          scriptCode={settings.homeFeedAd?.scriptCode || DEFAULT_FEED_AD_SCRIPT} 
                        />
                      )}
                    </React.Fragment>
                  ))}

                  {/* 2. Direct Movies Feed */}
                  {filteredMovies.map((movie) => (
                    <React.Fragment key={movie.id}>
                      <MovieCard movie={movie} />
                      {/* একটা পরে পরে: একটা মুভি একটা এডস */}
                      {settings.homeFeedAd?.active !== false && (
                        <ScriptAdBanner 
                          scriptCode={settings.homeFeedAd?.scriptCode || DEFAULT_FEED_AD_SCRIPT} 
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Music Tab: মিউজিক পেজে আপাতত ফায়ারবেস থেকে রিয়াল-টাইম ২টা অ্যাডস */}
          {activeTab === 'music' && <MusicView />}

          {/* Apps & Games Hub View (when tapping the center round button) */}
          {activeTab === 'apps' && <AppsHubView />}

          {/* VidMax AI View */}
          {activeTab === 'ai' && <VidMaxAiView />}

          {activeTab === 'download' && <DownloadsView />}
          {activeTab === 'more' && <MoreView />}
        </main>

        {/* Floating / Sticky Bottom Navigation */}
        <BottomNav />

        {/* Global Modals */}
        <SeriesDetailModal />
        <SeriesPlayerModal />
        <MovieDetailModal />
        <PopupAdModal />
        <AdminPanelModal />
        <ApkUpdateModal />
        <InstallPwaModal />
        <InAppBrowserModal />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <MovieProvider>
      <MainContent />
    </MovieProvider>
  );
}
