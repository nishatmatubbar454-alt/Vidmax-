import React, { useState, useEffect, useRef } from 'react';
import { useMovieContext } from '../context/MovieContext';
import { 
  Menu, 
  Search, 
  Download, 
  X, 
  Film, 
  Home, 
  Music,
  Smartphone,
  Send,
  Phone,
  Share2,
  Lock
} from 'lucide-react';
import { recordApkDownload } from '../utils/deviceTracker';

export const Header: React.FC = () => {
  const { 
    settings, 
    setAdminModalOpen, 
    setInstallPwaModalOpen,
    setActiveCategory,
    setSearchChoiceModalOpen,
    setActiveTab,
    openInAppBrowser,
    searchQuery,
    setSearchQuery,
  } = useMovieContext();

  const [menuOpen, setMenuOpen] = useState(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleShareInvite = () => {
    setMenuOpen(false);
    const shareUrl = settings.shareInviteUrl || window.location.href;
    if (navigator.share) {
      navigator.share({
        title: settings.siteTitle || 'MovieDownload',
        text: 'সেরা মুভি ও ভিডিও ডাউনলোড অ্যাপ! বন্ধুদের সাথে শেয়ার করুন:',
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareUrl);
      alert('শেয়ার লিংক কপি করা হয়েছে!');
    }
  };

  const handleDownloadApkDirect = () => {
    recordApkDownload();
    if (settings.apkDownloadUrl?.trim()) {
      window.open(settings.apkDownloadUrl.trim(), '_blank');
    } else {
      setInstallPwaModalOpen(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200/90 shadow-2xs">
        <div className="max-w-md mx-auto px-3 h-14 flex items-center justify-between gap-2">
          {/* Left Group: 3-Line Menu Icon + Logo positioned to the left */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setMenuOpen(true)}
              className="p-1.5 rounded-lg text-gray-800 hover:bg-gray-100 transition-colors shrink-0 active:scale-95 cursor-pointer"
              aria-label="Open Menu"
              title="Menu"
            >
              <Menu className="w-6 h-6 stroke-[2.3]" />
            </button>

            <a href="#" className="flex items-center group h-full max-w-[210px] sm:max-w-[250px]">
              {settings.headerLogoUrl ? (
                <img 
                  src={settings.headerLogoUrl} 
                  alt={settings.siteTitle || 'CineStream BD'} 
                  className="h-11 sm:h-12 w-auto max-w-full object-contain drop-shadow-xs transition-transform group-hover:scale-102"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fb = document.getElementById('header-logo-fallback');
                    if (fb) fb.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                id="header-logo-fallback" 
                className={`items-center gap-1.5 ${settings.headerLogoUrl ? 'hidden' : 'flex'}`}
              >
                <div className="w-9 h-9 rounded-lg bg-linear-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-2xs">
                  <Film className="w-5 h-5" />
                </div>
                <span className="font-black text-xl tracking-tight text-gray-900">
                  Movie<span className="text-amber-500">Download</span>
                </span>
              </div>
            </a>
          </div>

          {/* Right Action Icons: Search + Download */}
          <div className="flex items-center gap-1.5 shrink-0">

            {/* Search Button: Opens videodownloader search website inside in-app browser */}
            <button 
              type="button"
              onClick={() => {
                const targetUrl = settings.searchRedirectUrl || 'https://videodownloader.site';
                openInAppBrowser(targetUrl, 'সার্চ ও ভিডিও ডাউনলোডার');
              }}
              className="p-1.5 rounded-lg text-gray-800 hover:text-blue-600 hover:bg-gray-100 transition-colors flex items-center justify-center active:scale-95 cursor-pointer bg-transparent border-0"
              title="সার্চ ও ভিডিও ডাউনলোডার"
              aria-label="Search Movies & Videos"
            >
              <Search className="w-5 h-5 text-gray-800 stroke-[2.3]" />
            </button>

            {/* Download Icon Button: Directly navigates to Download page */}
            <button
              type="button"
              onClick={() => setActiveTab('download')}
              className="p-1.5 rounded-lg text-gray-800 hover:text-emerald-600 hover:bg-gray-100 transition-colors flex items-center justify-center active:scale-95 cursor-pointer bg-transparent border-0"
              title="ডাউনলোড পেজ"
              aria-label="ডাউনলোড পেজ"
            >
              <Download className="w-5 h-5 text-gray-800 stroke-[2.3]" />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Sidebar Drawer matching Screenshot */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer content sliding from left */}
          <aside className="relative w-[285px] max-w-[80vw] h-full bg-white shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            
            {/* Drawer Header with Logo and Close Icon */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center">
                {settings.headerLogoUrl ? (
                  <img
                    src={settings.headerLogoUrl}
                    alt={settings.siteTitle || 'CineStream BD'}
                    className="h-8 max-w-[160px] object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-1 font-black text-gray-900 text-lg">
                    <Film className="w-5 h-5 text-amber-500" />
                    <span>Movie<span className="text-amber-500">Download</span></span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 stroke-[2.3]" />
              </button>
            </div>

            {/* Drawer Body (Clean App Menus) */}
            <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col justify-between">
              
              {/* Menu items */}
              <div className="space-y-1.5">
                {/* 1. Direct Android APK Download Menu Item */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    handleDownloadApkDirect();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 transition-all text-left font-black text-sm cursor-pointer shadow-sm active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-white stroke-[2.5]" />
                    <span>APK ডাউনলোড করুন</span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-white text-emerald-800">
                    {settings.apkVersion || 'v2.1.0'}
                  </span>
                </button>

                {/* 2. Admin Panel Menu Item */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setAdminModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all text-left font-extrabold text-sm cursor-pointer shadow-xs active:scale-98 mb-2"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-amber-400 stroke-[2.2]" />
                    <span>এডমিন প্যানেল</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-300 bg-white/10 px-2 py-0.5 rounded-md">
                    প্রবেশ
                  </span>
                </button>

                {/* 3. Home */}
                <button
                  onClick={() => {
                    setActiveTab('home');
                    setActiveCategory('All');
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-4 px-3.5 py-2 rounded-xl text-gray-800 hover:bg-orange-50/70 hover:text-orange-600 transition-colors text-left font-semibold text-sm cursor-pointer"
                >
                  <Home className="w-5 h-5 text-orange-500 stroke-[2.2]" />
                  <span>হোম (Home)</span>
                </button>

                {/* 2. Music */}
                <button
                  onClick={() => {
                    setActiveTab('music');
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-4 px-3.5 py-2.5 rounded-xl text-gray-800 hover:bg-rose-50/70 hover:text-rose-600 transition-colors text-left font-semibold text-sm cursor-pointer"
                >
                  <Music className="w-5 h-5 text-rose-500 stroke-[2.2]" />
                  <span>মিউজিক (Music)</span>
                </button>

                {/* 3. Apps & Games */}
                <button
                  onClick={() => {
                    setActiveTab('apps');
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-4 px-3.5 py-2.5 rounded-xl text-gray-800 hover:bg-amber-50/70 hover:text-amber-600 transition-colors text-left font-semibold text-sm cursor-pointer"
                >
                  <Smartphone className="w-5 h-5 text-amber-500 stroke-[2.2]" />
                  <span>অ্যাপস ও গেমস (Apps)</span>
                </button>

                {/* 4. Download */}
                <button
                  onClick={() => {
                    setActiveTab('download');
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-4 px-3.5 py-2.5 rounded-xl text-gray-800 hover:bg-emerald-50/70 hover:text-emerald-600 transition-colors text-left font-semibold text-sm cursor-pointer"
                >
                  <Download className="w-5 h-5 text-emerald-500 stroke-[2.2]" />
                  <span>ভিডিও ডাউনলোডার</span>
                </button>

                {/* 5. Invite Friends / Share Link */}
                <button
                  type="button"
                  onClick={handleShareInvite}
                  className="w-full flex items-center gap-4 px-3.5 py-2.5 rounded-xl text-gray-800 hover:bg-emerald-50/70 hover:text-emerald-700 transition-colors text-left font-semibold text-sm cursor-pointer bg-transparent border-0"
                >
                  <Share2 className="w-5 h-5 text-emerald-500 stroke-[2.2]" />
                  <span>বন্ধুদের আমন্ত্রণ জানান</span>
                </button>

                <div className="border-t border-gray-100 my-2" />

                {/* Telegram - Realtime Firebase Connected */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    const tgUrl = settings.telegramUrl || 'https://t.me/flickcove_official';
                    window.open(tgUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="w-full flex items-center gap-4 px-3.5 py-2.5 rounded-xl text-gray-800 hover:bg-sky-50/70 hover:text-sky-600 transition-colors text-left font-semibold text-sm cursor-pointer bg-transparent border-0"
                >
                  <Send className="w-5 h-5 text-sky-500 stroke-[2.2]" />
                  <span>{settings.telegramLabel || 'Telegram'}</span>
                </button>

                {/* Contact - Realtime Firebase Connected */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    const contactTarget = settings.contactUrl || settings.whatsappUrl || (settings.telegramUrl || 'https://t.me/flickcove_official');
                    const lower = contactTarget.toLowerCase();
                    if (
                      contactTarget.startsWith('tel:') || 
                      contactTarget.startsWith('mailto:') || 
                      lower.includes('wa.me') || 
                      lower.includes('whatsapp') || 
                      lower.includes('t.me')
                    ) {
                      window.open(contactTarget, '_blank', 'noopener,noreferrer');
                    } else {
                      openInAppBrowser(contactTarget, settings.contactLabel || 'Contact Us');
                    }
                  }}
                  className="w-full flex items-center gap-4 px-3.5 py-2.5 rounded-xl text-gray-800 hover:bg-emerald-50/70 hover:text-emerald-600 transition-colors text-left font-semibold text-sm cursor-pointer bg-transparent border-0"
                >
                  <Phone className="w-5 h-5 text-emerald-500 stroke-[2.2]" />
                  <span>{settings.contactLabel || 'Contact'}</span>
                </button>
              </div>

            </div>

            {/* Hidden / Camouflaged Secret Admin Access - only owner knows */}
            <div className="py-2.5 px-3 border-t border-gray-100/70 flex items-center justify-center">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setAdminModalOpen(true);
                }}
                className="text-[8px] font-mono tracking-widest text-gray-400 opacity-20 hover:opacity-80 blur-[0.6px] hover:blur-none transition-all cursor-pointer py-1 px-4 select-none"
                title=""
                aria-label="sys-cfg"
              >
                sys.cfg.v2
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
