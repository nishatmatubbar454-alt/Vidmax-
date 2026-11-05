import React from 'react';
import { useMovieContext } from '../context/MovieContext';
import { ChevronLeft, Play, Film } from 'lucide-react';
import { getYouTubeThumbnail } from '../utils/youtube';

export const SeriesDetailModal: React.FC = () => {
  const { selectedSeries, setSelectedSeries, selectedEpisode, setSelectedEpisode } = useMovieContext();

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
        {/* Top Header - Matching Screenshot 1 style */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-200 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSelectedSeries(null)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
              title="ফিরে যান"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h2 className="text-base font-extrabold text-gray-900 leading-tight">
                {selectedSeries.category.includes('South') || selectedSeries.title.includes('কেজিএফ') 
                  ? 'মুভি ও ভিডিও পর্বসমূহ' 
                  : 'ক্লাস লেকচারসমূহ'}
              </h2>
              <p className="text-[11px] text-gray-500 font-medium truncate max-w-[220px]">
                {selectedSeries.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
              {selectedSeries.episodes.length}টি পর্ব
            </span>
          </div>
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
              const thumbnailSrc = getYouTubeThumbnail(ep.youtubeId, ep.thumbnail);

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
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';
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
