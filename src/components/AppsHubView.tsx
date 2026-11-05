import React from 'react';
import { useMovieContext } from '../context/MovieContext';
import { MoreVertical, X, Sparkles } from 'lucide-react';
import { ScriptAdBanner } from './ScriptAdBanner';

export const AppsHubView: React.FC = () => {
  const { appShortcuts, settings, openInAppBrowser } = useMovieContext();

  const activeApps = appShortcuts.filter((app) => app.active !== false);

  // Favorite section apps
  const favoriteApps = activeApps.filter(
    (app) => !app.section || app.section.toLowerCase() === 'favorite'
  );

  // Paisa Kamao section apps
  const paisaKamaoApps = activeApps.filter(
    (app) =>
      app.section &&
      (app.section.toLowerCase() === 'paisa kamao' ||
        app.section.toLowerCase() === 'earning' ||
        app.section.toLowerCase() === 'games')
  );

  // Custom sections if added via admin panel
  const otherSections = Array.from(
    new Set(
      activeApps
        .map((app) => app.section)
        .filter(
          (sec) =>
            sec &&
            sec.toLowerCase() !== 'favorite' &&
            sec.toLowerCase() !== 'paisa kamao' &&
            sec.toLowerCase() !== 'earning' &&
            sec.toLowerCase() !== 'games'
        )
    )
  );

  const DEFAULT_APPS_HUB_AD_SCRIPT = `<script>
  atOptions = {
    'key' : '280410b8223e51dae425f09c7a2f0eb1',
    'format' : 'iframe',
    'height' : 60,
    'width' : 468,
    'params' : {}
  };
</script>
<script src="https://brijmohan.org/22/280410b8223e51dae425f09c7a2f0eb1"></script>`;

  const sponsoredAd = settings.appsSponsoredAd || {
    active: true,
    title: 'Sponsored',
    targetUrl: 'https://videodownloader.site',
    buttonText: 'INSTALL',
    scriptCode: DEFAULT_APPS_HUB_AD_SCRIPT,
  };

  const adScriptCode = sponsoredAd.scriptCode ?? DEFAULT_APPS_HUB_AD_SCRIPT;

  const handleAppClick = (url: string, title?: string) => {
    if (!url) return;
    openInAppBrowser(url, title || 'অ্যাপ ব্রাউজার');
  };

  // Ads MUST open in external Chrome browser to generate maximum revenue
  const handleAdClick = (url: string) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="py-3 px-3 select-none pb-20 animate-fadeIn bg-white min-h-[80vh]">
      {/* 1. Favorite Section */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-4 px-1">
          Favorite
        </h2>

        <div className="grid grid-cols-4 gap-y-5 gap-x-2">
          {favoriteApps.map((app) => (
            <div
              key={app.id}
              onClick={() => handleAppClick(app.url, app.title)}
              className="flex flex-col items-center group cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center p-1 overflow-hidden relative">
                {app.iconUrl ? (
                  <img
                    src={app.iconUrl}
                    alt={app.title}
                    className="w-full h-full object-contain rounded-2xl drop-shadow-xs"
                    onError={(e) => {
                      e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/1055/1055666.png';
                    }}
                  />
                ) : (
                  <div className="w-full h-full rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-indigo-500" />
                  </div>
                )}
                {app.badge && (
                  <span className="absolute top-0 right-0 bg-red-600 text-white text-[8px] font-black px-1 py-0.2 rounded-full shadow-xs">
                    {app.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-normal text-gray-800 text-center truncate max-w-full mt-1.5 px-0.5">
                {app.title}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Middle Sponsored Ad matching Screenshot */}
      {sponsoredAd.active !== false && (
        <div className="my-5">
          {adScriptCode ? (
            <ScriptAdBanner scriptCode={adScriptCode} />
          ) : (
            <div className="bg-[#f3f4f6] rounded-xl border border-gray-200/80 p-3 shadow-2xs">
              {/* Top meta */}
              <div className="flex items-center justify-between text-gray-400 mb-2 px-0.5">
                <span className="text-xs font-medium text-gray-500">
                  Sponsored
                </span>
                <div className="flex items-center gap-2">
                  <MoreVertical className="w-4 h-4 text-gray-400 cursor-pointer" />
                  <X className="w-4 h-4 text-gray-400 cursor-pointer" />
                </div>
              </div>

          {/* Ad content body */}
          <div
            onClick={() => handleAdClick(sponsoredAd.targetUrl || 'https://videodownloader.site')}
            className="flex items-center justify-between gap-2.5 cursor-pointer hover:opacity-95 transition-opacity"
          >
            {/* Left promo banner */}
            <div className="w-24 h-13 bg-slate-900 rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center">
              {sponsoredAd.imageUrl ? (
                <img
                  src={sponsoredAd.imageUrl}
                  alt="Promo banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="p-1 text-center">
                  <div className="text-[9px] text-blue-400 font-bold uppercase">MEXC</div>
                  <div className="text-[8px] text-white font-medium">Trade Crypto</div>
                </div>
              )}
              <span className="absolute bottom-0.5 left-0.5 bg-black/80 text-[7px] font-bold text-white px-1 rounded">
                Ad
              </span>
            </div>

            {/* Middle logo + text */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                {sponsoredAd.iconUrl ? (
                  <img
                    src={sponsoredAd.iconUrl}
                    alt="Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-sm font-black text-white">M</span>
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-gray-900 truncate leading-snug">
                  {sponsoredAd.title || 'MEXC: Buy Bitcoin & Crypto'}
                </h4>
                {sponsoredAd.subtitle && (
                  <p className="text-[10px] text-gray-500 truncate leading-tight">
                    {sponsoredAd.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Right Install Action Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAdClick(sponsoredAd.targetUrl || 'https://videodownloader.site');
              }}
              className="shrink-0 px-4 py-2 bg-[#52a447] hover:bg-[#45903b] active:scale-95 text-white text-xs font-black rounded-lg shadow-xs transition-all uppercase tracking-wide cursor-pointer"
            >
              {sponsoredAd.buttonText || 'INSTALL'}
            </button>
          </div>
        </div>
        )}
      </div>
    )}

      {/* 3. Paisa Kamao Section */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-4 px-1">
          Paisa Kamao
        </h2>

        <div className="grid grid-cols-4 gap-y-5 gap-x-2">
          {paisaKamaoApps.map((app) => (
            <div
              key={app.id}
              onClick={() => handleAppClick(app.url, app.title)}
              className="flex flex-col items-center group cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center p-1 overflow-hidden relative">
                {app.iconUrl ? (
                  <img
                    src={app.iconUrl}
                    alt={app.title}
                    className="w-full h-full object-contain rounded-2xl drop-shadow-xs"
                    onError={(e) => {
                      e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/1055/1055666.png';
                    }}
                  />
                ) : (
                  <div className="w-full h-full rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-amber-500" />
                  </div>
                )}
                {app.badge && (
                  <span className="absolute top-0 right-0 bg-red-600 text-white text-[8px] font-black px-1 py-0.2 rounded-full shadow-xs">
                    {app.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-normal text-gray-800 text-center truncate max-w-full mt-1.5 px-0.5">
                {app.title}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Other Custom Sections */}
      {otherSections.map((secName) => {
        const secApps = activeApps.filter((a) => a.section === secName);
        return (
          <section key={secName} className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-4 px-1">
              {secName}
            </h2>

            <div className="grid grid-cols-4 gap-y-5 gap-x-2">
              {secApps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => handleAppClick(app.url, app.title)}
                  className="flex flex-col items-center group cursor-pointer active:scale-95 transition-transform"
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center p-1 overflow-hidden relative">
                    <img
                      src={app.iconUrl || 'https://cdn-icons-png.flaticon.com/512/1055/1055666.png'}
                      alt={app.title}
                      className="w-full h-full object-contain rounded-2xl drop-shadow-xs"
                    />
                  </div>
                  <span className="text-xs font-normal text-gray-800 text-center truncate max-w-full mt-1.5 px-0.5">
                    {app.title}
                  </span>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
