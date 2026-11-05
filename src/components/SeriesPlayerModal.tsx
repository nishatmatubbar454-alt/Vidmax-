import React, { useState } from 'react';
import { useMovieContext } from '../context/MovieContext';
import { ChevronLeft, Play, ArrowLeft, Radio } from 'lucide-react';
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from '../utils/youtube';

export const SeriesPlayerModal: React.FC = () => {
  const { selectedEpisode, setSelectedEpisode, setSelectedSeries, settings } = useMovieContext();
  const [showFullPlaylist, setShowFullPlaylist] = useState(false);

  if (!selectedEpisode) return null;

  const { series, episode } = selectedEpisode;
  const embedUrl = getYouTubeEmbedUrl(episode.youtubeId, true);

  const handleReturnToSeriesList = () => {
    // Keep series selected, just clear episode so SeriesDetailModal is visible
    setSelectedEpisode(null);
  };

  const handleCloseAll = () => {
    setSelectedEpisode(null);
    setSelectedSeries(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex justify-center animate-fadeIn overflow-y-auto"
      onClick={handleReturnToSeriesList}
    >
      <div 
        className="w-full max-w-md bg-gray-50 min-h-screen flex flex-col shadow-2xl relative border-x border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header - Exact match to Screenshot 2 */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2.5 flex items-center justify-between border-b border-gray-200 shadow-2xs">
          {/* Circular Back Button (Screenshot 2 left) */}
          <button
            onClick={handleReturnToSeriesList}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="তালিকায় ফিরে যান"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>

          {/* Center Brand / Logo (Screenshot 2 center) */}
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={handleReturnToSeriesList}>
            {settings.headerLogoUrl ? (
              <img
                src={settings.headerLogoUrl}
                alt={settings.siteTitle}
                className="h-7 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-sm font-black text-blue-600 tracking-tight">Smart</span>
                <span className="text-sm font-black text-amber-500 tracking-tight">Study</span>
              </div>
            )}
          </div>

          {/* Right Status Badge: "ভিডিও চলছে" (Screenshot 2 right) */}
          <div className="flex items-center gap-1.5 bg-gray-100/90 text-gray-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-gray-200 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span>ভিডিও চলছে</span>
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 p-3.5 space-y-3 pb-20">
          {/* Video Player Card Container - Matching Screenshot 2 */}
          <div className="bg-black rounded-2xl overflow-hidden shadow-lg border border-gray-800 relative aspect-video w-full">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={episode.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white p-4 text-center">
                <Radio className="w-8 h-8 text-red-500 mb-2 animate-pulse" />
                <p className="text-xs font-bold">ভিডিও লিঙ্ক লোড হতে সমস্যা হয়েছে</p>
              </div>
            )}
          </div>

          {/* Episode Info Box - Matching Screenshot 2 */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-2xs">
            {/* Pill Badge matching Screenshot 2 */}
            <div className="mb-2">
              <span className="inline-block text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-3 py-1 rounded-full shadow-2xs">
                {episode.badge || series.badgeLabel || 'প্রথম অধ্যায় • আইসিটি (ICT)'}
              </span>
            </div>

            {/* Episode Title matching Screenshot 2 */}
            <h3 className="text-sm sm:text-base font-extrabold text-gray-900 leading-snug">
              {episode.title}
            </h3>

            {episode.description && (
              <p className="text-xs text-gray-600 mt-2 leading-relaxed border-t border-gray-100 pt-2">
                {episode.description}
              </p>
            )}
          </div>

          {/* Return to Playlist Action Card - Exact Match to Screenshot 2 */}
          <button
            onClick={handleReturnToSeriesList}
            className="w-full bg-white hover:bg-gray-50 text-amber-900 border border-amber-200/80 rounded-2xl p-3.5 shadow-2xs flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all duration-150 cursor-pointer active:scale-[0.99] group"
          >
            <ChevronLeft className="w-4 h-4 text-amber-600 group-hover:-translate-x-0.5 transition-transform" />
            <span>
              {series.category.includes('South') || series.title.includes('কেজিএফ') 
                ? 'অন্যান্য পর্ব বা মুভি তালিকা দেখতে ফিরে যান' 
                : 'অধ্যায়ের অন্যান্য ক্লাস তালিকা দেখতে ফিরে যান'}
            </span>
          </button>

          {/* Quick Playlist Switcher: Other Episodes in this Series */}
          {series.episodes && series.episodes.length > 1 && (
            <div className="bg-white rounded-2xl p-3 border border-gray-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-extrabold text-gray-800">
                  সিরিজের অন্যান্য পর্বসমূহ ({series.episodes.length}টি)
                </span>
                <span className="text-[10px] text-gray-500 font-semibold">
                  ক্লিক করে প্লে করুন
                </span>
              </div>

              <div className="space-y-2">
                {series.episodes.map((otherEp) => {
                  const isCurrent = otherEp.id === episode.id;
                  const thumb = getYouTubeThumbnail(otherEp.youtubeId, otherEp.thumbnail);

                  return (
                    <div
                      key={otherEp.id}
                      onClick={() => setSelectedEpisode({ series, episode: otherEp })}
                      className={`flex items-center gap-2.5 p-2 rounded-xl transition-all cursor-pointer border ${
                        isCurrent 
                          ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-300' 
                          : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                      }`}
                    >
                      <div className="relative w-18 aspect-video rounded-lg overflow-hidden bg-black shrink-0">
                        <img 
                          src={thumb} 
                          alt={otherEp.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play className={`w-3.5 h-3.5 ${isCurrent ? 'text-amber-500 fill-amber-500' : 'text-white fill-white'}`} />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-gray-200 text-gray-700">
                            পর্ব {otherEp.episodeNumber}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded-md border border-red-200">
                              চলছে
                            </span>
                          )}
                        </div>
                        <h5 className="text-[11px] font-bold text-gray-900 truncate mt-0.5">
                          {otherEp.title}
                        </h5>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
