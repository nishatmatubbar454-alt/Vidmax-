import React from 'react';
import { useMovieContext } from '../context/MovieContext';
import { Home, Music, Download, Sparkles } from 'lucide-react';
import { VidMaxRobotIcon } from './VidMaxAiView';

export const BottomNav: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    downloadList, 
    settings,
    setInstallPwaModalOpen,
  } = useMovieContext();

  return (
    <div className="fixed bottom-1.5 left-0 right-0 z-40 pb-safe pointer-events-none">
      <div className="max-w-[360px] mx-auto px-3">
        <nav className="pointer-events-auto bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-full shadow-lg px-3 py-1 flex items-center justify-between relative">
          
          {/* HOME */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 flex flex-col items-center justify-center py-0.5 transition-colors ${
              activeTab === 'home'
                ? 'text-red-600 font-extrabold'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Home className={`w-4 h-4 ${activeTab === 'home' ? 'text-red-600 stroke-[2.5]' : 'text-gray-500'}`} />
            <span className="text-[9px] tracking-wider uppercase mt-0.5 font-bold">
              HOME
            </span>
          </button>

          {/* MUSIC */}
          <button
            onClick={() => setActiveTab('music')}
            className={`flex-1 flex flex-col items-center justify-center py-0.5 transition-colors ${
              activeTab === 'music'
                ? 'text-red-600 font-extrabold'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Music className={`w-4 h-4 ${activeTab === 'music' ? 'text-red-600 stroke-[2.5]' : 'text-gray-500'}`} />
            <span className="text-[9px] tracking-wider uppercase mt-0.5 font-bold">
              MUSIC
            </span>
          </button>

          {/* Compact Elevated Center Logo Button (Apps Hub) */}
          <div className="relative -top-2.5 px-0.5 flex flex-col items-center">
            <button
              onClick={() => setActiveTab('apps')}
              className={`w-10 h-10 rounded-full bg-linear-to-tr from-amber-400 via-amber-200 to-amber-500 p-0.5 shadow-md hover:scale-105 active:scale-95 transition-transform flex items-center justify-center border-2 border-white cursor-pointer ${
                activeTab === 'apps' ? 'ring-3 ring-amber-500 shadow-amber-300' : 'ring-2 ring-amber-200/80'
              }`}
              title="Apps & Games Hub"
            >
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden p-0.5">
                {settings.appLogoUrl ? (
                  <img
                    src={settings.appLogoUrl}
                    alt="App"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-500" />
                )}
              </div>
            </button>
            <span className={`text-[8px] font-black tracking-tight uppercase -mt-0.5 leading-none ${
              activeTab === 'apps' ? 'text-amber-900 font-black' : 'text-amber-700'
            }`}>
              APK
            </span>
          </div>

          {/* DOWNLOAD */}
          <button
            onClick={() => setActiveTab('download')}
            className={`flex-1 flex flex-col items-center justify-center py-0.5 transition-colors relative ${
              activeTab === 'download'
                ? 'text-red-600 font-extrabold'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <div className="relative">
              <Download className={`w-4 h-4 ${activeTab === 'download' ? 'text-red-600 stroke-[2.5]' : 'text-gray-500'}`} />
            </div>
            <span className="text-[9px] tracking-wider uppercase mt-0.5 font-bold">
              DOWNLOAD
            </span>
          </button>

          {/* VIDMAX AI */}
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 flex flex-col items-center justify-center py-0.5 transition-colors cursor-pointer ${
              activeTab === 'ai'
                ? 'text-black font-extrabold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <div className={`transition-transform ${activeTab === 'ai' ? 'scale-110' : ''}`}>
              <VidMaxRobotIcon className={`w-4 h-4 ${activeTab === 'ai' ? 'text-black' : 'text-gray-500'}`} />
            </div>
            <span className={`text-[9px] tracking-wider uppercase mt-0.5 font-bold ${activeTab === 'ai' ? 'text-black font-black' : 'text-gray-500'}`}>
              AI
            </span>
          </button>

        </nav>
      </div>
    </div>
  );
};
