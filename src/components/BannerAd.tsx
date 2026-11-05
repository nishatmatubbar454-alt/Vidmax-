import React from 'react';
import { useMovieContext } from '../context/MovieContext';
import { ScriptAdBanner } from './ScriptAdBanner';

export const BannerAd: React.FC = () => {
  const { settings, openInAppBrowser } = useMovieContext();

  if (!settings.bannerAd?.active) return null;

  if (settings.bannerAd.scriptCode) {
    return (
      <div className="mb-2">
        <ScriptAdBanner scriptCode={settings.bannerAd.scriptCode} />
      </div>
    );
  }

  if (!settings.bannerAd.imageUrl) return null;

  return (
    <div className="mb-2.5 overflow-hidden rounded-xl border border-gray-200/80 shadow-2xs bg-gray-50">
      <button
        type="button"
        onClick={() => {
          const url = settings.bannerAd?.targetUrl || 'https://videodownloader.site';
          window.open(url, '_blank', 'noopener,noreferrer');
        }}
        className="w-full text-left block relative group cursor-pointer bg-transparent border-0 p-0"
      >
        <img
          src={settings.bannerAd.imageUrl}
          alt="Sponsored Banner"
          className="w-full h-auto max-h-28 object-cover rounded-xl"
        />
        <span className="absolute top-1 right-1 bg-black/60 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm backdrop-blur-xs">
          AD
        </span>
      </button>
    </div>
  );
};
