import React, { useState, useEffect } from 'react';
import { useMovieContext } from '../context/MovieContext';
import { Smartphone, Download, CheckCircle, ShieldCheck, X } from 'lucide-react';
import { recordApkDownload } from '../utils/deviceTracker';

export const InstallPwaModal: React.FC = () => {
  const { installPwaModalOpen, setInstallPwaModalOpen, settings } = useMovieContext();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!installPwaModalOpen) return null;

  const handleInstallClick = async () => {
    recordApkDownload();
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn('Install prompt error:', err);
        setShowManualGuide(true);
      }
    } else if (settings.apkDownloadUrl) {
      window.open(settings.apkDownloadUrl, '_blank');
    } else {
      setShowManualGuide(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-gray-100 flex flex-col items-center text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* App Logo */}
        <div className="w-20 h-20 rounded-2xl bg-slate-900 p-2 shadow-lg mb-3 flex items-center justify-center border-2 border-amber-400">
          <img
            src={settings.appLogoUrl || '/assets/app-logo.png'}
            alt="FlickCove APK"
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full mb-1">
          Official Mobile App / PWA
        </span>

        <h3 className="text-lg font-black text-gray-900 leading-tight">
          {settings.siteTitle || 'FlickCove'} Mobile App
        </h3>

        <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
          আপনার ফোনে ইন্সটল করে সরাসরি অ্যাপের মতো ব্যবহার করুন। কোনো ব্রাউজার বার থাকবে না এবং দ্রুততম স্পিড পাবেন।
        </p>

        {/* Benefits List */}
        <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3 text-left space-y-2 mb-4 text-xs text-gray-700">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>ফোনের হোম স্ক্রিনে সরাসরি অ্যাপ আইকন যোগ হবে</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>ফুল-স্ক্রিন মোড ও সুপার-ফাস্ট ব্রাউজিং</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>ফায়ারবেস থেকে স্বয়ংক্রিয় রিয়েল-টাইম আপডেট</span>
          </div>
        </div>

        {/* Manual guide if deferredPrompt not ready or user requested */}
        {showManualGuide && (
          <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-3 text-left text-xs text-amber-900 mb-3 space-y-1.5 animate-fadeIn">
            <div className="font-extrabold flex items-center gap-1.5 text-amber-800">
              <Smartphone className="w-4 h-4 text-amber-600" />
              <span>মোবাইলে অ্যাপ ইনস্টল করার নিয়ম:</span>
            </div>
            <ol className="list-decimal list-inside text-[11px] text-amber-900/90 space-y-1 font-medium">
              <li>ব্রাউজারের ডানদিকের ৩-ডট মেনু (⋮) তে ট্যাপ করুন।</li>
              <li><strong className="font-bold">"Add to Home screen"</strong> বা <strong className="font-bold">"Install App"</strong> চাপুন।</li>
              <li>সাথে সাথে এটি ফোনের অ্যাপ লিস্টে যুক্ত হবে!</li>
            </ol>
            {!settings.apkDownloadUrl && (
              <p className="text-[10px] text-amber-700 mt-1.5 pt-1.5 border-t border-amber-200/80">
                💡 আপনি যখন হোস্টিংয়ে .apk ফাইল আপলোড করে এডমিন প্যানেলে লিঙ্ক দেবেন, তখন সরাসরি .apk ফাইল ডাউনলোড চালু হবে।
              </p>
            )}
          </div>
        )}

        {/* Install CTA Buttons */}
        <div className="w-full space-y-2">
          {/* 1. Official 1-Tap Native Install (WebAPK) */}
          <button
            onClick={handleInstallClick}
            className="w-full py-3.5 px-4 rounded-2xl bg-linear-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isInstalled ? '✓ অ্যাপ ফোনে ইনস্টল করা আছে' : '১-ট্যাপে সরাসরি ফোনে ইনস্টল করুন (Install)'}</span>
          </button>

          {/* 2. Direct APK Download (Custom URL or GitHub Releases) */}
          {settings.apkDownloadUrl ? (
            <a
              href={settings.apkDownloadUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => recordApkDownload()}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>সরাসরি APK ফাইল ডাউনলোড করুন (.apk)</span>
            </a>
          ) : (
            <a
              href="https://github.com/nishatmatubbar454-alt/Vidmax-/releases"
              target="_blank"
              rel="noreferrer"
              onClick={() => recordApkDownload()}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>GitHub Actions থেকে আসল APK নামান (.apk)</span>
            </a>
          )}
        </div>

        <button
          onClick={() => setInstallPwaModalOpen(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
