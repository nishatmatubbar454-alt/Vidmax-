import React from 'react';
import { useMovieContext } from '../context/MovieContext';
import { Flame } from 'lucide-react';

export const QuickActionBoxes: React.FC = () => {
  const { settings } = useMovieContext();

  const box1Text = settings.quickBox1Text || 'Tanning movie';
  const box2Text = settings.quickBox2Text || '18+';
  const box2Url = settings.quickBox2Url || 'https://tinyurl.com/2waz6wm2';

  const handleOpen18Plus = () => {
    const target = box2Url || 'https://tinyurl.com/2waz6wm2';
    const a = document.createElement('a');
    a.href = target;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) document.body.removeChild(a);
    }, 100);
  };

  return (
    <div className="flex items-center justify-between mb-2.5 px-3 py-2 bg-white rounded-xl border border-gray-200 shadow-2xs select-none">
      {/* Left: Tanning movie text - no navigation link as requested */}
      <div className="flex items-center gap-1.5 cursor-default">
        <Flame className="w-4 h-4 text-orange-500" />
        <span className="text-xs sm:text-sm font-black text-gray-900 tracking-tight">
          {box1Text}
        </span>
      </div>

      {/* Right: 18+ text / badge opening directly in Chrome / external browser */}
      <button
        type="button"
        onClick={handleOpen18Plus}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-black text-xs border border-red-200 active:scale-95 transition-transform cursor-pointer"
        title="18+"
      >
        <span>🔞</span>
        <span>{box2Text}</span>
      </button>
    </div>
  );
};
