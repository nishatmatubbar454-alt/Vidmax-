import React, { useState, useEffect } from 'react';
import { useMovieContext } from '../context/MovieContext';
import { X, ExternalLink } from 'lucide-react';

export const PopupAdModal: React.FC = () => {
  const { settings, openInAppBrowser } = useMovieContext();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (settings.popupAd?.active && (settings.popupAd.imageUrl || settings.popupAd.title)) {
      // Show once per session after short delay
      const hasShown = sessionStorage.getItem('popup_ad_shown');
      if (!hasShown) {
        const timer = setTimeout(() => {
          setIsOpen(true);
          sessionStorage.setItem('popup_ad_shown', 'true');
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [settings.popupAd]);

  if (!isOpen || !settings.popupAd?.active) return null;

  const { title, imageUrl, targetUrl, buttonText } = settings.popupAd;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
          aria-label="Close Ad"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ad Image (Hosted on ImgBB) */}
        {imageUrl ? (
          <div className="w-full bg-slate-900 aspect-16/9 overflow-hidden relative">
            <img
              src={imageUrl}
              alt={title || 'Special Sponsored Ad'}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-amber-400 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-sm shadow-xs">
              AD
            </div>
          </div>
        ) : null}

        {/* Content */}
        <div className="p-4 text-center space-y-3">
          {title ? (
            <h4 className="text-base font-extrabold text-gray-900 leading-snug">
              {title}
            </h4>
          ) : null}

          {targetUrl ? (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                window.open(targetUrl, '_blank', 'noopener,noreferrer');
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer border-0"
            >
              <span>{buttonText || 'ভিজিট করুন'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          ) : null}

          <button
            onClick={() => setIsOpen(false)}
            className="text-[11px] font-semibold text-gray-400 hover:text-gray-600"
          >
            বিজ্ঞাপনটি বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
