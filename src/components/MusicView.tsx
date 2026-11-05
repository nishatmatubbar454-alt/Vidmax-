import React from 'react';
import { useMovieContext } from '../context/MovieContext';
import { ScriptAdBanner } from './ScriptAdBanner';

export const DEFAULT_MUSIC_PAGE_AD_SCRIPT = `<script>
  atOptions = {
    'key' : '911ee250303f0d466e6e2cab58b077e0',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
</script>
<script src="https://bauval.org/22/911ee250303f0d466e6e2cab58b077e0"></script>`;

export const MusicView: React.FC = () => {
  const { settings } = useMovieContext();
  const musicAdConfig = settings.musicPageAd;

  const isAdActive = musicAdConfig ? musicAdConfig.active !== false : true;
  const script = (musicAdConfig?.scriptCode && musicAdConfig.scriptCode.trim() !== '')
    ? musicAdConfig.scriptCode
    : ((musicAdConfig?.scriptCode1 && musicAdConfig.scriptCode1.trim() !== '')
        ? musicAdConfig.scriptCode1
        : DEFAULT_MUSIC_PAGE_AD_SCRIPT);

  return (
    <div className="py-4 px-2 flex flex-col items-center justify-start min-h-[50vh]">
      {isAdActive && (
        <div className="w-full flex justify-center items-center overflow-hidden">
          <ScriptAdBanner scriptCode={script} height={250} />
        </div>
      )}
    </div>
  );
};
