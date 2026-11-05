import React, { useMemo } from 'react';
import { useMovieContext } from '../context/MovieContext';

export const DEFAULT_DOWNLOAD_AD_SCRIPT = `<script type="text/javascript">
  atOptions = {
    'key' : '911ee250303f0d466e6e2cab58b077e0',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
</script>
<script type="text/javascript" src="https://glamourpicklessteward.com/911ee250303f0d466e6e2cab58b077e0/invoke.js"></script>`;

export const DownloadsView: React.FC = () => {
  const { settings, openInAppBrowser } = useMovieContext();

  const handleOpenDownloader = (url: string, title?: string) => {
    if (!url) return;
    openInAppBrowser(url, title || 'ডাউনলোডার');
  };

  const scriptCode = settings.downloadPageAd?.scriptCode || DEFAULT_DOWNLOAD_AD_SCRIPT;
  const isAdActive = settings.downloadPageAd?.active !== false;
  const adCount = settings.downloadPageAd?.count || 5;

  const adIframeContent = useMemo(() => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      background-color: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
  </style>
</head>
<body>
  ${scriptCode}
</body>
</html>`;
  }, [scriptCode]);

  return (
    <div className="animate-fadeIn pb-20 w-full flex flex-col items-center">
      <div className="w-full max-w-[500px] flex flex-col items-center">
        {/* Top Header Banner Image */}
        <div className="w-full mb-4 flex justify-center">
          <img
            src="https://i.ibb.co.com/8gwrV98V/Screenshot-20260821-224724.jpg"
            alt="GrabVex Banner"
            className="w-full max-w-[480px] h-auto rounded-lg block shadow-xs"
            onError={(e) => {
              e.currentTarget.style.display = 'block';
            }}
          />
        </div>

        {/* Row 1: YouTube, Facebook, Instagram, TikTok */}
        <div className="w-full grid grid-cols-4 gap-3 justify-items-center mb-4">
          {/* YouTube */}
          <button
            type="button"
            onClick={() => handleOpenDownloader('https://grabvex.com/youtube-video-downloader', 'YouTube Downloader')}
            className="flex flex-col items-center no-underline text-inherit cursor-pointer select-none transition-transform active:scale-95 group bg-transparent border-0"
          >
            <div className="w-[52px] h-[52px] rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition-transform flex items-center justify-center bg-white">
              <img
                src="https://i.ibb.co/hFyFKy54/You-Tube-social-white-square-2017-svg.png"
                alt="YouTube"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <span className="mt-1.5 text-[13px] font-medium text-slate-700 text-center">
              YouTube
            </span>
          </button>

          {/* Facebook */}
          <button
            type="button"
            onClick={() => handleOpenDownloader('https://grabvex.com/facebook-video-downloader', 'Facebook Downloader')}
            className="flex flex-col items-center no-underline text-inherit cursor-pointer select-none transition-transform active:scale-95 group bg-transparent border-0"
          >
            <div className="w-[52px] h-[52px] rounded-xl flex items-center justify-center shadow-md bg-[#1877f2] group-hover:scale-105 transition-transform">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.361H7.332v3.209h2.753v8.196h3.312z" />
              </svg>
            </div>
            <span className="mt-1.5 text-[13px] font-medium text-slate-700 text-center">
              Facebook
            </span>
          </button>

          {/* Instagram */}
          <button
            type="button"
            onClick={() => handleOpenDownloader('https://grabvex.com/instagram-video-downloader', 'Instagram Downloader')}
            className="flex flex-col items-center no-underline text-inherit cursor-pointer select-none transition-transform active:scale-95 group bg-transparent border-0"
          >
            <div 
              className="w-[52px] h-[52px] rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform"
              style={{
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)'
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </div>
            <span className="mt-1.5 text-[13px] font-medium text-slate-700 text-center">
              Instagram
            </span>
          </button>

          {/* TikTok */}
          <button
            type="button"
            onClick={() => handleOpenDownloader('https://grabvex.com/tiktok-video-downloader', 'TikTok Downloader')}
            className="flex flex-col items-center no-underline text-inherit cursor-pointer select-none transition-transform active:scale-95 group bg-transparent border-0"
          >
            <div className="w-[52px] h-[52px] rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition-transform flex items-center justify-center bg-black">
              <img
                src="https://i.ibb.co/R8SKJj9/images.png"
                alt="TikTok"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <span className="mt-1.5 text-[13px] font-medium text-slate-700 text-center">
              TikTok
            </span>
          </button>
        </div>

        {/* Row 2: X, Threads, Pinterest, LinkedIn */}
        <div className="w-full grid grid-cols-4 gap-3 justify-items-center mb-4">
          {/* X */}
          <button
            type="button"
            onClick={() => handleOpenDownloader('https://grabvex.com/x-video-downloader', 'X Downloader')}
            className="flex flex-col items-center no-underline text-inherit cursor-pointer select-none transition-transform active:scale-95 group bg-transparent border-0"
          >
            <div className="w-[52px] h-[52px] rounded-xl flex items-center justify-center shadow-md bg-black group-hover:scale-105 transition-transform">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <span className="mt-1.5 text-[13px] font-medium text-slate-700 text-center">
              X
            </span>
          </button>

          {/* Threads */}
          <button
            type="button"
            onClick={() => handleOpenDownloader('https://grabvex.com/threads-video-downloader', 'Threads Downloader')}
            className="flex flex-col items-center no-underline text-inherit cursor-pointer select-none transition-transform active:scale-95 group bg-transparent border-0"
          >
            <div className="w-[52px] h-[52px] rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition-transform flex items-center justify-center bg-black">
              <img
                src="https://i.ibb.co/twy5NppZ/unnamed.png"
                alt="Threads"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <span className="mt-1.5 text-[13px] font-medium text-slate-700 text-center lowercase">
              threads
            </span>
          </button>

          {/* Pinterest */}
          <button
            type="button"
            onClick={() => handleOpenDownloader('https://grabvex.com/pinterest-video-downloader', 'Pinterest Downloader')}
            className="flex flex-col items-center no-underline text-inherit cursor-pointer select-none transition-transform active:scale-95 group bg-transparent border-0"
          >
            <div className="w-[52px] h-[52px] rounded-xl flex items-center justify-center shadow-md bg-[#e60023] group-hover:scale-105 transition-transform">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12.004-5.367 12.004-11.988C24.015 5.367 18.644 0 12.017 0z" />
              </svg>
            </div>
            <span className="mt-1.5 text-[13px] font-medium text-slate-700 text-center">
              Pinterest
            </span>
          </button>

          {/* LinkedIn */}
          <button
            type="button"
            onClick={() => handleOpenDownloader('https://grabvex.com/linkedin-video-downloader', 'LinkedIn Downloader')}
            className="flex flex-col items-center no-underline text-inherit cursor-pointer select-none transition-transform active:scale-95 group bg-transparent border-0"
          >
            <div className="w-[52px] h-[52px] rounded-xl flex items-center justify-center shadow-md bg-[#0a66c2] group-hover:scale-105 transition-transform">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </div>
            <span className="mt-1.5 text-[13px] font-medium text-slate-700 text-center">
              LinkedIn
            </span>
          </button>
        </div>

        {/* Ad Banners (300x250) connected to Firebase */}
        {isAdActive && (
          <div className="w-full flex flex-col items-center gap-3.5 mt-2.5">
            {Array.from({ length: adCount }).map((_, idx) => (
              <div
                key={idx}
                className="w-[300px] h-[250px] max-w-full bg-[#0f172a] rounded-lg border border-[#334155] flex items-center justify-center overflow-hidden shadow-xs relative"
              >
                <iframe
                  srcDoc={adIframeContent}
                  width="300"
                  height="250"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-forms"
                  title={`GrabVex Ad Slot ${idx + 1}`}
                  className="w-[300px] h-[250px] border-0 overflow-hidden"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
