import React from 'react';
import { Series } from '../types';
import { useMovieContext } from '../context/MovieContext';
import { PlayCircle } from 'lucide-react';

interface SeriesCardProps {
  series: Series;
}

export const SeriesCard: React.FC<SeriesCardProps> = ({ series }) => {
  const { setSelectedSeries } = useMovieContext();

  const getTitleColor = () => {
    if (series.badgeColor === 'green') return 'text-[#008040]';
    if (series.badgeColor === 'blue') return 'text-[#0055cc]';
    if (series.badgeColor === 'orange') return 'text-[#ea580c]';
    if (series.badgeColor === 'purple') return 'text-[#7c3aed]';
    return 'text-[#b30000]';
  };

  const getBadgeStyle = () => {
    if (series.badgeColor === 'green') return 'bg-[#008040] text-white';
    if (series.badgeColor === 'blue') return 'bg-[#0055cc] text-white';
    if (series.badgeColor === 'orange') return 'bg-[#ea580c] text-white';
    if (series.badgeColor === 'purple') return 'bg-[#7c3aed] text-white';
    return 'bg-[#b30000] text-white';
  };

  const badgeText = series.badgeLabel || `ইউটিউব ভিডিও সিরিজ • ${series.episodes?.length || 1} পর্ব`;

  return (
    <div 
      onClick={() => setSelectedSeries(series)}
      className="bg-white border border-gray-200/90 rounded-md p-2 flex items-center gap-3 hover:bg-gray-50/90 transition-all cursor-pointer shadow-2xs group mb-1.5 relative overflow-hidden"
    >
      {/* Series Square Poster */}
      <div className="w-[72px] h-[72px] sm:w-20 sm:h-20 shrink-0 rounded-md overflow-hidden bg-gray-900 border border-gray-200/80 shadow-2xs relative">
        <img
          src={series.poster || 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300'}
          alt={series.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300';
          }}
        />

        {/* Small YouTube Play Indicator Overlay on corner */}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/35 transition-colors">
          <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
            <PlayCircle className="w-4 h-4 fill-white text-red-600" />
          </div>
        </div>

        {/* Episode count tag */}
        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[8px] font-black px-1 rounded-sm">
          {series.episodes?.length || 1}EP
        </div>
      </div>

      {/* Title & Badge */}
      <div className="flex-1 min-w-0 pr-1">
        <h3 className={`font-bold text-[13px] sm:text-[14px] leading-snug line-clamp-2 ${getTitleColor()}`}>
          {series.title}
        </h3>

        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
          <span className={`inline-block text-[11px] font-bold px-3 py-0.5 rounded-full shadow-2xs ${getBadgeStyle()}`}>
            {badgeText}
          </span>
          <span className="text-[10px] text-gray-400 font-semibold">
            {series.quality || 'HD'}
          </span>
        </div>
      </div>
    </div>
  );
};
