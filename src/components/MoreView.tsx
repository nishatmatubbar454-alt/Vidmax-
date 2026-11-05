import React from 'react';
import { useMovieContext } from '../context/MovieContext';
import { 
  Smartphone, 
  Download, 
  MessageCircle, 
  Send, 
  Info, 
  ChevronRight
} from 'lucide-react';

export const MoreView: React.FC = () => {
  const { 
    settings, 
    setAdminModalOpen,
    setApkUpdateModalOpen, 
    setInstallPwaModalOpen,
    setActiveTab,
  } = useMovieContext();

  return (
    <div className="animate-fadeIn pb-16 space-y-3 pt-1">


      {/* Main Action Links */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs divide-y divide-gray-100 overflow-hidden">
        {/* Install APK / PWA */}
        <button
          onClick={() => setInstallPwaModalOpen(true)}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900 group-hover:text-emerald-600">
                ডাউনলোড ও ইন্সটল এপিকে (Download APK)
              </div>
              <div className="text-[11px] text-gray-500">
                অ্যান্ড্রয়েড ফোনের হোম স্ক্রিনে অফলাইন অ্যাপ মোড
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700" />
        </button>

        {/* Check APK Updates */}
        <button
          onClick={() => setApkUpdateModalOpen(true)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900 group-hover:text-amber-600">
                চেক এপিকে আপডেট (Check APK Updates)
              </div>
              <div className="text-[11px] text-gray-500">
                বর্তমান ভার্সন: {settings.apkVersion}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700" />
        </button>
      </div>

      {/* Community Links */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs divide-y divide-gray-100 overflow-hidden">
        {settings.telegramUrl && (
          <a
            href={settings.telegramUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900 group-hover:text-sky-600">
                  অফিসিয়াল টেলিগ্রাম চ্যানেল
                </div>
                <div className="text-[11px] text-gray-500">
                  সবার আগে নতুন মুভির ডিরেক্ট লিঙ্ক পেতে জয়েন করুন
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </a>
        )}

        {settings.whatsappUrl && (
          <a
            href={settings.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900 group-hover:text-emerald-600">
                  হোয়াটসঅ্যাপ কমিউনিটি
                </div>
                <div className="text-[11px] text-gray-500">
                  যেকোনো সমস্যা বা মুভি রিকুয়েস্ট করতে পারেন
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </a>
        )}
      </div>

      {/* About & Disclaimer */}
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-center text-xs text-gray-500 space-y-1.5">
        <div className="flex items-center justify-center gap-1 font-bold text-gray-700">
          <Info className="w-3.5 h-3.5" />
          <span>FlickCove Movie Entertainment Hub</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          সমস্ত ফাইল এবং লিংক ক্লাউড ড্রাইভ ও থার্ড পার্টি সার্ভার (TeraBox / Google Drive) থেকে প্রদান করা হয়।
        </p>
        <p 
          onClick={() => setAdminModalOpen(true)}
          className="text-[10px] text-gray-400 cursor-pointer hover:text-gray-600 transition-colors py-1 select-none"
          title="Admin Access"
        >
          Powered by Firebase Realtime Sync • Version {settings.apkVersion}
        </p>
      </div>
    </div>
  );
};
