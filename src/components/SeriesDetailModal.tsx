import React from 'react';
import { useMovieContext } from '../context/MovieContext';
import { ChevronLeft, Play, Film } from 'lucide-react';
import { getYouTubeThumbnail, extractYouTubeId } from '../utils/youtube';

export const SeriesDetailModal: React.FC = () => {
  const { selectedSeries, setSelectedSeries, selectedEpisode, setSelectedEpisode, settings } = useMovieContext();

  // If no series is selected, or if player modal is currently playing an episode, hide detail modal
  if (!selectedSeries || selectedEpisode) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex justify-center animate-fadeIn overflow-y-auto"
      onClick={() => setSelectedSeries(null)}
    >
      <div 
        className="w-full max-w-md bg-gray-50 min-h-screen flex flex-col shadow-2xl relative border-x border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header - Erased text, centered app logo with back button */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2.5 flex items-center justify-between border-b border-gray-200 shadow-2xs">
          <button
            onClick={() => setSelectedSeries(null)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="ফিরে যান"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>

          {/* Centered App Logo */}
          <div className="flex items-center justify-center cursor-pointer" onClick={() => setSelectedSeries(null)}>
            {settings?.headerLogoUrl ? (
              <img
                src={settings.headerLogoUrl}
                alt={settings.siteTitle || 'MovieDownload'}
                className="h-8 sm:h-9 w-auto max-w-[170px] object-contain drop-shadow-xs"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fb = document.getElementById('series-detail-logo-fallback');
                  if (fb) fb.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              id="series-detail-logo-fallback"
              className={`items-center gap-1.5 ${settings?.headerLogoUrl ? 'hidden' : 'flex'}`}
            >
              <div className="w-7 h-7 rounded-lg bg-linear-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-2xs">
                <Film className="w-4 h-4" />
              </div>
              <span className="font-black text-base tracking-tight text-gray-900">
                Movie<span className="text-amber-500">Download</span>
              </span>
            </div>
          </div>

          {/* Right Spacer to keep logo perfectly centered */}
          <div className="w-8 shrink-0" />
        </div>

        {/* Episodes / Classes List - Direct Match to Screenshot 1 */}
        <div className="flex-1 p-3.5 space-y-3.5 pb-20">

          {selectedSeries.episodes.length === 0 ? (
            <div className="py-12 px-4 text-center bg-white rounded-2xl border border-gray-200">
              <Film className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500 font-semibold">
                এই সিরিজে এখনও কোনো ভিডিও পর্ব যুক্ত করা হয়নি।
              </p>
            </div>
          ) : (
            selectedSeries.episodes.map((ep) => {
              // Automatically resolve official YouTube thumbnail
              const thumbnailSrc = getYouTubeThumbnail(ep.youtubeId || ep.youtubeUrl, ep.thumbnail);

              return (
                <div
                  key={ep.id}
                  onClick={() => setSelectedEpisode({ series: selectedSeries, episode: ep })}
                  className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all duration-200 p-3 cursor-pointer group active:scale-[0.99]"
                >
                  {/* 16:9 Thumbnail with Centered Play Button (Screenshot 1) */}
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900 border border-gray-100 shadow-xs">
                    <img
                      src={thumbnailSrc}
                      alt={ep.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const ytId = extractYouTubeId(ep.youtubeId || ep.youtubeUrl);
                        if (ytId && !e.currentTarget.src.includes('mqdefault')) {
                          e.currentTarget.src = `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
                        }
                      }}
                    />

                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors" />

                    {/* Centered White Play Button Overlay (Exact Match to Screenshot 1) */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center border border-white/50 shadow-lg group-hover:scale-110 group-hover:bg-red-600 transition-all duration-200">
                        <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                      </div>
                    </div>

                    {/* Duration badge at bottom right */}
                    {ep.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {ep.duration}
                      </div>
                    )}
                  </div>

                  {/* Title and Badge below thumbnail (Screenshot 1) */}
                  <div className="mt-2.5">
                    {ep.badge && (
                      <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 mb-1">
                        {ep.badge}
                      </span>
                    )}
                    <h4 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                      {ep.title}
                    </h4>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
