import React, { useState } from 'react';
import { useMovieContext } from '../context/MovieContext';
import { MovieCard } from './MovieCard';
import { ScriptAdBanner, DEFAULT_FEED_AD_SCRIPT } from './ScriptAdBanner';
import { 
  X, 
  ArrowLeft, 
  Download, 
  Share2 
} from 'lucide-react';

export const DEFAULT_MOVIE_DETAIL_AD_SCRIPT = `<script>
  atOptions = {
    'key' : '911ee250303f0d466e6e2cab58b077e0',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
</script>
<script src="https://bauval.org/22/911ee250303f0d466e6e2cab58b077e0"></script>`;

export const MovieDetailModal: React.FC = () => {
  const { 
    selectedMovie, 
    setSelectedMovie, 
    movies, 
    settings,
    addToDownloads,
    openInAppBrowser 
  } = useMovieContext();

  const [copiedLink, setCopiedLink] = useState(false);

  if (!selectedMovie) return null;

  // Related movies excluding current one
  const relatedMovies = movies
    .filter((m) => m.id !== selectedMovie.id)
    .slice(0, 5);

  const isRealUrl = (u?: string) => {
    if (!u || typeof u !== 'string') return false;
    const trimmed = u.trim();
    if (!trimmed || trimmed === '#' || trimmed.includes('flickcove.top') || trimmed.includes('sample')) return false;
    return true;
  };

  const downloadUrl = 
    (isRealUrl(selectedMovie.downloadUrl) ? selectedMovie.downloadUrl : null) ||
    (isRealUrl(selectedMovie.fastDownloadUrl) ? selectedMovie.fastDownloadUrl : null) || 
    (isRealUrl(selectedMovie.driveUrl) ? selectedMovie.driveUrl : null) || 
    (isRealUrl(selectedMovie.teraboxUrl) ? selectedMovie.teraboxUrl : null) || 
    (settings.searchButton1Url || settings.searchRedirectUrl || 'https://videodownloader.site');

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: selectedMovie.title,
        text: `Download ${selectedMovie.title} on ${settings.siteTitle}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const screenshots = (selectedMovie.screenshots || []).filter(Boolean);

  const adScript = 
    (settings.movieDetailAd?.scriptCode && settings.movieDetailAd.scriptCode.trim() !== '')
      ? settings.movieDetailAd.scriptCode
      : DEFAULT_MOVIE_DETAIL_AD_SCRIPT;

  // Always unconditionally active on this page as requested by user
  const isAdActive = true;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-start justify-center overflow-y-auto animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white min-h-screen sm:min-h-0 sm:my-4 sm:rounded-xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation / Back Bar */}
        <div className="bg-slate-900 text-white px-3 py-2.5 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <button
            onClick={() => setSelectedMovie(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-200 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Movies</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-1 rounded text-gray-300 hover:text-white cursor-pointer"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedMovie(null)}
              className="p-1 rounded text-gray-300 hover:text-white cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {copiedLink && (
          <div className="bg-green-600 text-white text-xs font-bold py-1 text-center">
            Link copied to clipboard!
          </div>
        )}

        {/* 1. Top Ad Banner ("একদম উপর একটা হবে") */}
        {isAdActive && (
          <div className="w-full flex justify-center py-1 bg-transparent">
            <ScriptAdBanner scriptCode={adScript} />
          </div>
        )}

        {/* 2. Large Central Movie Poster matching Screenshot */}
        <div className="p-3 bg-[#e8eef3] flex justify-center border-b border-gray-200">
          <div className="w-full max-w-[280px] bg-white p-1 rounded-sm shadow-md border border-gray-300">
            <img
              src={selectedMovie.poster || 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600'}
              alt={selectedMovie.title}
              className="w-full h-auto object-cover rounded-xs"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600';
              }}
            />
          </div>
        </div>

        {/* 3. Section Bar: 👉 File Info 👈 */}
        <div className="bg-[#d9edf7] border-y border-[#bce8f1] text-[#c00000] font-bold text-center py-1.5 text-xs sm:text-sm">
          👉 File Info 👈
        </div>

        {/* 4. Structured Table: Name, Duration, Release Date, Quality, Description */}
        <div className="bg-white text-xs divide-y divide-gray-200 border-b border-gray-200">
          <div className="py-2 px-3 leading-relaxed">
            <span className="font-extrabold text-black">Name: </span>
            <span className="font-bold text-[#b30000]">{selectedMovie.title}</span>
          </div>

          <div className="py-2 px-3 leading-relaxed">
            <span className="font-extrabold text-black">Duration: </span>
            <span className="font-bold text-[#008040]">{selectedMovie.duration || '2h 40min'}</span>
          </div>

          <div className="py-2 px-3 leading-relaxed">
            <span className="font-extrabold text-black">Release Date: </span>
            <span className="font-bold text-[#0055cc]">{selectedMovie.year || selectedMovie.releaseDate}</span>
          </div>

          <div className="py-2 px-3 leading-relaxed">
            <span className="font-extrabold text-black">Quality: </span>
            <span className="font-bold text-[#008080]">{selectedMovie.quality || '480p 720p 1080p [HD]'}</span>
          </div>

          {selectedMovie.description && (
            <div className="py-2 px-3 leading-relaxed">
              <span className="font-extrabold text-black">Description: </span>
              <span className="text-gray-700">{selectedMovie.description}</span>
            </div>
          )}
        </div>

        {/* 5. Section Bar: DOWNLOAD THIS MOVIE */}
        <div className="bg-[#0275d8] text-white font-extrabold text-center py-2 text-xs uppercase tracking-wider">
          DOWNLOAD THIS MOVIE
        </div>

        {/* 6. Big Green Download Button - Opens DIRECTLY in Chrome / External Browser */}
        <div className="p-3 bg-gray-50 flex flex-col items-center border-b border-gray-200">
          <button
            type="button"
            onClick={() => {
              addToDownloads(selectedMovie);
              // Open DIRECTLY in external Chrome / default browser
              const targetUrl = downloadUrl;
              if (targetUrl) {
                const a = document.createElement('a');
                a.href = targetUrl;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                  if (a.parentNode) document.body.removeChild(a);
                }, 100);
              }
            }}
            className="w-full bg-[#388e3c] hover:bg-[#2e7d32] text-white font-extrabold text-center py-3.5 px-4 rounded-md text-sm sm:text-base shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer border-0"
          >
            <Download className="w-5 h-5 text-white animate-bounce" />
            <span>Download {selectedMovie.quality || '480p 720p 1080p [HD]'}</span>
          </button>
        </div>

        {/* Ad Banner below Download Button ("ডাউনলোড বাটন এর নিচে একটা থাকবে") */}
        {isAdActive && (
          <div className="w-full flex justify-center py-1 bg-transparent">
            <ScriptAdBanner scriptCode={adScript} />
          </div>
        )}

        {/* 7. Section Bar: SCREENSHOT (1 to 4 images supported) */}
        {screenshots.length > 0 && (
          <>
            <div className="bg-[#0275d8] text-white font-extrabold text-center py-2 text-xs uppercase tracking-wider">
              SCREENSHOT
            </div>

            {/* Screenshot Stills: 1 image = full width, 2-4 images = 2 columns */}
            <div className="p-2 bg-black/5 border-b border-gray-200">
              <div className={`grid gap-1.5 ${screenshots.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {screenshots.map((src, idx) => (
                  <div key={idx} className="aspect-16/10 rounded-xs overflow-hidden bg-black border border-gray-300 shadow-2xs">
                    <img
                      src={src}
                      alt={`Screenshot ${idx + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Ad Banner below Screenshots ("স্কিন শট ওইখানে একটা থাকবে") */}
            {isAdActive && (
              <div className="w-full flex justify-center py-1 bg-transparent">
                <ScriptAdBanner scriptCode={adScript} />
              </div>
            )}
          </>
        )}

        {/* 8. Section Bar: RELATED MOVIES */}
        <div className="bg-[#0275d8] text-white font-extrabold text-center py-2 text-xs uppercase tracking-wider">
          RELATED MOVIES
        </div>

        {/* Related movies list: প্রতিটা ভিডিও এর পরে একটা করে ব্যানার এড ("নিচে প্রতিটা ভিডিও একটা পর পর ব্যানার থাকবে") */}
        <div className="p-2 bg-gray-50/50 space-y-2">
          {relatedMovies.map((movie) => (
            <React.Fragment key={movie.id}>
              <MovieCard movie={movie} />
              {isAdActive && (
                <div className="w-full flex justify-center py-1 bg-transparent">
                  <ScriptAdBanner scriptCode={adScript} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Bottom padding for mobile scroll */}
        <div className="py-6 bg-white text-center text-xs text-gray-400">
          Powered by {settings.siteTitle || 'FlickCove'} • Firebase Realtime Catalog
        </div>
      </div>
    </div>
  );
};
