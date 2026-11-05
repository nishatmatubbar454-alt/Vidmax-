import React from 'react';
import { useMovieContext } from '../context/MovieContext';
import { Smartphone, Download, CheckCircle2, Sparkles, X } from 'lucide-react';
import { recordApkDownload } from '../utils/deviceTracker';

export const ApkUpdateModal: React.FC = () => {
  const { apkUpdateModalOpen, setApkUpdateModalOpen, settings } = useMovieContext();

  if (!apkUpdateModalOpen && !settings.forceApkUpdate) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-gray-100 flex flex-col items-center text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3 border border-amber-500/20 shadow-inner overflow-hidden p-1 bg-white">
          {settings.appLogoUrl ? (
            <img 
              src={settings.appLogoUrl} 
              alt="APK Logo" 
              className="w-full h-full object-contain rounded-xl"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <Smartphone className="w-8 h-8 text-amber-500 animate-bounce" />
          )}
        </div>

        <span className="text-[11px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 px-3 py-0.5 rounded-full mb-1.5">
          New Version Available
        </span>

        <h3 className="text-lg font-black text-gray-900 leading-tight">
          FlickCove APK {settings.apkVersion || 'v2.2.0'}
        </h3>

        <p className="text-xs text-gray-500 mt-1 mb-3">
          নতুন ভার্সন রিলিজ হয়েছে! অ্যাপটি আপডেট করে সকল নতুন মুভি ও ফাস্ট সার্ভার উপভোগ করুন।
        </p>

        {settings.apkUpdateChangelog && (
          <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-left text-xs text-gray-700 mb-4 space-y-1">
            <div className="font-bold text-gray-900 flex items-center gap-1 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>What's New (নতুন ফিচার):</span>
            </div>
            <div className="text-[11px] text-gray-600 whitespace-pre-line leading-relaxed">
              {settings.apkUpdateChangelog}
            </div>
          </div>
        )}

        <div className="w-full space-y-2">
          {settings.apkDownloadUrl ? (
            <a
              href={settings.apkDownloadUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => recordApkDownload()}
              className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>সরাসরি APK ডাউনলোড করুন ({settings.apkVersion})</span>
            </a>
          ) : (
            <button
              onClick={() => {
                setApkUpdateModalOpen(false);
              }}
              className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Sparkles className="w-4 h-4" />
              <span>ঠিক আছে (Close)</span>
            </button>
          )}

          {!settings.forceApkUpdate && (
            <button
              onClick={() => setApkUpdateModalOpen(false)}
              className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
            >
              পরে আপডেট করব (Later)
            </button>
          )}
        </div>

        {!settings.forceApkUpdate && (
          <button
            onClick={() => setApkUpdateModalOpen(false)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
