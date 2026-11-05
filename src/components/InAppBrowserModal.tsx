import React, { useState, useEffect, useRef } from 'react';
import { useMovieContext } from '../context/MovieContext';
import { 
  X, 
  RotateCw, 
  ArrowLeft
} from 'lucide-react';

export const InAppBrowserModal: React.FC = () => {
  const { 
    inAppBrowserUrl, 
    inAppBrowserTitle, 
    closeInAppBrowser 
  } = useMovieContext();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (inAppBrowserUrl) {
      setIsLoading(true);
      setIframeKey((prev) => prev + 1);

      // Lock background body scroll
      document.body.style.overflow = 'hidden';

      // Intercept and prevent any web app install prompts
      const preventInstallHandler = (e: Event) => {
        e.preventDefault();
        return false;
      };
      window.addEventListener('beforeinstallprompt', preventInstallHandler);

      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('beforeinstallprompt', preventInstallHandler);
      };
    }
  }, [inAppBrowserUrl]);

  if (!inAppBrowserUrl) return null;

  // Prevent recursive inception of the app itself
  const isSelfUrl = typeof window !== 'undefined' && (
    inAppBrowserUrl === '/' ||
    inAppBrowserUrl === window.location.href ||
    (inAppBrowserUrl.startsWith(window.location.origin) && !inAppBrowserUrl.includes('/api/proxy'))
  );
  if (isSelfUrl) return null;

  // Determine if URL needs the in-app server proxy:
  // videodownloader.site has NO frame restrictions (no X-Frame-Options) and runs Next.js directly.
  // All other external sites (like tinyurl, grabvex, cloudflare workers, ad links) MUST be proxied
  // so that X-Frame-Options and Content-Security-Policy frame-ancestors are stripped!
  const shouldUseProxy = (url: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    if (lower.includes('videodownloader.site')) return false;
    if (url.startsWith('/') || url.startsWith('http://localhost') || url.startsWith('https://localhost')) return false;
    return true;
  };

  const effectiveUrl = shouldUseProxy(inAppBrowserUrl)
    ? `/api/proxy?url=${encodeURIComponent(inAppBrowserUrl)}`
    : inAppBrowserUrl;

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((k) => k + 1);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white animate-fadeIn select-none">
      
      {/* 1. Header Bar: Clean title, back button, reload, and close */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-3 shadow-md shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={closeInAppBrowser}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
            title="ফিরে যান"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.3]" />
          </button>

          <div className="min-w-0">
            <span className="text-sm font-bold text-slate-100 truncate block leading-tight">
              {inAppBrowserTitle || 'ব্রাউজার'}
            </span>
          </div>
        </div>

        {/* Right Actions: Reload & Close */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleReload}
            className={`p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all cursor-pointer ${
              isLoading ? 'animate-spin text-blue-400' : ''
            }`}
            title="রিলোড করুন"
            aria-label="Reload"
          >
            <RotateCw className="w-4 h-4 stroke-[2.3]" />
          </button>

          <button
            onClick={closeInAppBrowser}
            className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            title="বন্ধ করুন"
            aria-label="Close"
          >
            <X className="w-5 h-5 stroke-[2.3]" />
          </button>
        </div>
      </div>

      {/* 2. Top Progress Loading Bar */}
      {isLoading && (
        <div className="w-full h-1 bg-slate-800 overflow-hidden shrink-0">
          <div className="w-full h-full bg-linear-to-r from-blue-500 via-indigo-400 to-emerald-400 animate-pulse origin-left duration-500" />
        </div>
      )}

      {/* 3. High-Speed Direct In-App Browser Frame Body */}
      <div className="flex-1 w-full relative bg-slate-900 overflow-hidden flex flex-col">
        {/* Anti-Web-App Shield Layer: Prevents external PWA install banners */}
        <style>{`
          .smartbanner, .app-banner, [id*="app-banner"], [class*="app-banner"],
          [class*="install-app"], [class*="get-app"], [class*="open-in-app"],
          .mobile-app-banner, [data-testid*="app-banner"], .pwa-prompt {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
          }
        `}</style>

        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={effectiveUrl}
          title={inAppBrowserTitle || 'In-App Webview'}
          onLoad={handleIframeLoad}
          loading="eager"
          className="w-full h-full border-0 bg-white"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        />
      </div>
    </div>
  );
};
