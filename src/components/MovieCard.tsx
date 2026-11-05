import React from 'react';
import { Movie } from '../types';
import { useMovieContext } from '../context/MovieContext';

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const { setSelectedMovie } = useMovieContext();

  // Dynamic title color matching user's screenshot
  const getTitleColor = () => {
    if (movie.titleColor === 'green' || (!movie.titleColor && movie.badgeColor === 'green')) {
      return 'text-[#008040]'; // Green bold title
    }
    if (movie.titleColor === 'blue' || (!movie.titleColor && movie.badgeColor === 'blue')) {
      return 'text-[#0055cc]'; // Blue bold title
    }
    if (movie.titleColor === 'orange' || (!movie.titleColor && movie.badgeColor === 'orange')) {
      return 'text-[#ea580c]'; // Orange bold title
    }
    return 'text-[#b30000]'; // Default red bold title
  };

  // Dynamic pill badge color matching user's screenshot
  const getBadgeStyle = () => {
    if (movie.badgeColor === 'green') {
      return 'bg-[#008040] text-white';
    }
    if (movie.badgeColor === 'blue') {
      return 'bg-[#0055cc] text-white';
    }
    if (movie.badgeColor === 'orange') {
      return 'bg-[#ea580c] text-white';
    }
    return 'bg-[#b30000] text-white';
  };

  const badgeText = movie.badgeLabel || (
    movie.category.includes('South') ? 'South Hindi Dubbed Movie' :
    movie.category.includes('Hollywood') ? 'Hollywood Hindi Movies' :
    'Bollywood Hindi Movies'
  );

  return (
    <div 
      onClick={() => setSelectedMovie(movie)}
      className="bg-white border border-gray-200/90 rounded-md p-2 flex items-center gap-3 hover:bg-gray-50/90 transition-all cursor-pointer shadow-2xs group mb-1.5"
    >
      {/* Square poster image matching Screenshot 1 */}
      <div className="w-[72px] h-[72px] sm:w-20 sm:h-20 shrink-0 rounded-md overflow-hidden bg-gray-100 border border-gray-200/80 shadow-2xs relative">
        <img
          src={movie.poster || 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300'}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300';
          }}
        />
      </div>

      {/* Title & Badge on Right matching Screenshot 1 */}
      <div className="flex-1 min-w-0 pr-1">
        <h3 className={`font-bold text-[13px] sm:text-[14px] leading-snug line-clamp-2 ${getTitleColor()}`}>
          {movie.title}
        </h3>

        <div className="mt-1">
          <span className={`inline-block text-[11px] font-bold px-3 py-0.5 rounded-full shadow-2xs ${getBadgeStyle()}`}>
            {badgeText}
          </span>
        </div>
      </div>
    </div>
  );
};
