import React, { useState, useRef } from 'react';
import { uploadImageToImgBB } from '../services/imageHosting';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  X, 
  ShieldCheck, 
  Camera, 
  Link as LinkIcon, 
  Sparkles 
} from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  apiKey?: string;
  placeholder?: string;
  description?: string;
  onUseYouTubeThumb?: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  value,
  onChange,
  apiKey,
  placeholder = 'https://i.ibb.co/... বা ফাইল সিলেক্ট করুন',
  description = 'ছবি সিলেক্ট করলে ডিভাইসের মেমোরি-সেফ কম্প্রেশনের মাধ্যমে ফটো যুক্ত হবে।',
  onUseYouTubeThumb,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Safe file handler with mobile anti-crash protection
  const processAndUploadFile = async (file: File) => {
    // Validate image format
    if (!file.type.startsWith('image/')) {
      setError('দয়া করে একটি সঠিক ইমেজ ফাইল (.jpg, .png, .webp) সিলেক্ট করুন।');
      return;
    }

    // Size limit check (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setError('ইমেজ সাইজ ১৫ মেগাবাইটের কম হতে হবে।');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadProgress('ছবি প্রসেসিং ও অপ্টিমাইজ হচ্ছে...');

      const result = await uploadImageToImgBB(file, apiKey);
      if (result && result.url) {
        onChange(result.url);
        setUploadProgress('সফলভাবে ছবি যুক্ত হয়েছে!');
      } else {
        setError('ছবি লোড করা যায়নি, আবার চেষ্টা করুন।');
      }
      setTimeout(() => setUploadProgress(''), 3000);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err?.message || 'ইমেজ আপলোড করতে সমস্যা হয়েছে, সরাসরি লিংক পেস্ট করতে পারেন।');
    } finally {
      setUploading(false);
      setShowPermissionModal(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
  };

  const handleGrantPermissionAndOpenGallery = async () => {
    try {
      // Prompt browser permission if supported
      if (navigator.permissions && navigator.permissions.query) {
        try {
          await navigator.permissions.query({ name: 'camera' as any }).catch(() => {});
        } catch {
          // Ignore
        }
      }
    } catch {
      // Ignore
    }
    // Safely trigger gallery file selection
    galleryInputRef.current?.click();
  };

  const handleGrantPermissionAndOpenCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach((track) => track.stop());
        } catch {
          // Fallback to standard input capture
        }
      }
    } catch {
      // Ignore
    }
    cameraInputRef.current?.click();
  };

  return (
    <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold text-gray-700">
          {label}
        </label>
        {uploading && (
          <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>প্রসেস হচ্ছে...</span>
          </span>
        )}
      </div>

      <div className="flex gap-2 items-center">
        {/* Hidden Gallery Input */}
        <input
          type="file"
          ref={galleryInputRef}
          onChange={handleGalleryChange}
          onClick={(e) => e.stopPropagation()}
          accept="image/*"
          className="hidden"
        />

        {/* Hidden Camera Input */}
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleCameraChange}
          onClick={(e) => e.stopPropagation()}
          accept="image/*"
          capture="environment"
          className="hidden"
        />

        {/* Text input for manual URL or displaying uploaded link */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:border-red-500 font-mono pr-7"
          />
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="absolute right-2 top-2.5 text-gray-400 hover:text-red-500"
              title="ক্লিয়ার করুন"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Main Upload Trigger Button (Opens Permission & Selection Dialog) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowPermissionModal(true);
          }}
          disabled={uploading}
          className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all shrink-0 cursor-pointer"
          title="গ্যালারি পারমিশন দিন ও ছবি আপলোড করুন"
        >
          {uploading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <UploadCloud className="w-3.5 h-3.5" />
          )}
          <span>{uploading ? 'লোড...' : 'আপলোড'}</span>
        </button>
      </div>

      {description && (
        <p className="text-[10px] text-gray-500 leading-tight">
          {description}
        </p>
      )}

      {error && (
        <div className="text-[10px] text-red-600 flex items-center gap-1 font-medium bg-red-50 p-1.5 rounded-lg border border-red-200">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {uploadProgress && !error && (
        <div className="text-[10px] text-emerald-700 flex items-center gap-1 font-medium bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
          <CheckCircle className="w-3 h-3 shrink-0" />
          <span>{uploadProgress}</span>
        </div>
      )}

      {/* Live Preview Box */}
      {value && (
        <div className="mt-1 flex items-center gap-2 p-1.5 bg-gray-50 rounded-xl border border-gray-200">
          <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden border border-gray-300 shrink-0">
            <img
              src={value}
              alt="Preview"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold text-gray-700 truncate">
              ইমেজ লিংক প্রিভিউ
            </div>
            <div className="text-[9px] text-gray-400 font-mono truncate">
              {value}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* GALLERY PERMISSION & PHOTO SELECTION MODAL                */}
      {/* ========================================================= */}
      {showPermissionModal && (
        <div 
          className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowPermissionModal(false)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl border border-gray-200 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setShowPermissionModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-2xs">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-gray-900 leading-snug">
                গ্যালারি ও ফটো অ্যাক্সেস পারমিশন
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                আপনার ডিভাইস থেকে মুভি পোস্টার ছবি নির্বাচন করতে নিচের অপশনে চাপ দিয়ে অনুমতি প্রদান করুন।
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              {/* 1. Gallery Access Button */}
              <button
                type="button"
                onClick={handleGrantPermissionAndOpenGallery}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md active:scale-[0.98] transition-all cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 shrink-0" />
                <span>গ্যালারি পারমিশন দিন ও ছবি বাছুন</span>
              </button>

              {/* 2. Camera Access Button */}
              <button
                type="button"
                onClick={handleGrantPermissionAndOpenCamera}
                className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4 text-gray-600 shrink-0" />
                <span>ক্যামেরা দিয়ে নতুন ছবি তুলুন</span>
              </button>

              {/* 3. Auto YouTube Thumbnail (if provided) */}
              {onUseYouTubeThumb && (
                <button
                  type="button"
                  onClick={() => {
                    onUseYouTubeThumb();
                    setShowPermissionModal(false);
                  }}
                  className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/80 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-red-600 shrink-0" />
                  <span>ইউটিউব থাম্বনেল অটো-সেট করুন</span>
                </button>
              )}

              {/* 4. Cancel / Close */}
              <button
                type="button"
                onClick={() => setShowPermissionModal(false)}
                className="w-full py-2 text-center text-xs text-gray-400 hover:text-gray-600 font-semibold cursor-pointer"
              >
                বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
