import React, { useState, useRef, useId } from 'react';
import { uploadImageToImgBB, compressImageToDataUrl } from '../services/imageHosting';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  X, 
  Camera, 
  Sparkles,
  Trash2
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
  placeholder = 'https://... বা গ্যালারি থেকে ছবি দিন',
  description = 'গ্যালারি বা ক্যামেরা বাটনে চাপ দিয়ে সরাসরি ফোন থেকে ফটো সিলেক্ট করুন।',
  onUseYouTubeThumb,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string>('');

  const rawId = useId().replace(/[:]/g, '');
  const galleryInputId = `gallery-input-${rawId}`;
  const cameraInputId = `camera-input-${rawId}`;

  // Safe file processor that never crashes and works with zero lag
  const processAndUploadFile = async (file: File) => {
    if (!file) return;

    // Validate image format
    if (!file.type.startsWith('image/')) {
      setError('দয়া করে একটি সঠিক ইমেজ ফাইল (.jpg, .png, .webp) নির্বাচন করুন।');
      return;
    }

    // Size limit check (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      setError('ইমেজ সাইজ ২০ মেগাবাইটের কম হতে হবে।');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadProgress('ছবি প্রস্তুত হচ্ছে...');

      // 1. Immediately create a lightweight object URL for instant UI feedback
      const quickObjectUrl = URL.createObjectURL(file);
      setLocalPreview(quickObjectUrl);

      // 2. Compress image in memory safely (~25KB-40KB, zero mobile OOM crash)
      setUploadProgress('ছবি অপ্টিমাইজ ও আপলোড হচ্ছে...');
      const compressedDataUrl = await compressImageToDataUrl(file, 480, 0.68);

      // 3. Immediately set the value so the user NEVER loses their photo
      if (compressedDataUrl) {
        onChange(compressedDataUrl);
      }

      // 4. Try permanent server-side upload to /api/upload-image
      try {
        const uploadResult = await uploadImageToImgBB(compressedDataUrl || file, apiKey);
        if (uploadResult && uploadResult.url) {
          onChange(uploadResult.url);
          setLocalPreview('');
        }
      } catch (uploadErr) {
        console.warn('Server upload fallback, keeping compressed data URL:', uploadErr);
      }

      setUploadProgress('সফলভাবে ছবি যুক্ত হয়েছে!');
      setTimeout(() => setUploadProgress(''), 3000);
    } catch (err: any) {
      console.error('File process failed:', err);
      setError(err?.message || 'ছবি প্রসেস করতে সমস্যা হয়েছে, আপনি সরাসরি লিংক পেস্ট করতে পারেন।');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
    // Reset input value so the same file can be re-selected if desired
    e.target.value = '';
  };

  const activeDisplayUrl = localPreview || value;

  return (
    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold text-gray-700">
          {label}
        </label>
        {uploading && (
          <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>{uploadProgress || 'প্রসেস হচ্ছে...'}</span>
          </span>
        )}
      </div>

      {/* Hidden Native File Inputs - Activated Directly & Synchronously via Label tags */}
      <input
        id={galleryInputId}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <input
        id={cameraInputId}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Direct Action Buttons: Gallery, Camera & YouTube Thumbnail */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* 1. Direct Gallery Button (Native Label) */}
        <label
          htmlFor={galleryInputId}
          className="flex-1 min-w-[120px] py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98] transition-all cursor-pointer select-none"
          title="ফোনের গ্যালারি থেকে সরাসরি ছবি বাছুন"
        >
          {uploading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ImageIcon className="w-3.5 h-3.5" />
          )}
          <span>গ্যালারি থেকে ফটো</span>
        </label>

        {/* 2. Direct Camera Button (Native Label) */}
        <label
          htmlFor={cameraInputId}
          className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-gray-300 shadow-2xs active:scale-[0.98] transition-all cursor-pointer select-none shrink-0"
          title="ক্যামেরা দিয়ে সরাসরি নতুন ছবি তুলুন"
        >
          <Camera className="w-3.5 h-3.5 text-gray-600" />
          <span>ক্যামেরা</span>
        </label>

        {/* 3. Optional Auto YouTube Thumbnail Button */}
        {onUseYouTubeThumb && (
          <button
            type="button"
            onClick={onUseYouTubeThumb}
            className="py-2 px-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border border-red-200/80 active:scale-[0.98] transition-all cursor-pointer shrink-0"
            title="১ম পর্বের ইউটিউব থাম্বনেল অটো ব্যবহার করুন"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            <span>ইউটিউব থাম্বনেল</span>
          </button>
        )}
      </div>

      {/* Direct URL Input Row */}
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            setLocalPreview('');
            onChange(e.target.value);
          }}
          className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:border-blue-500 font-mono pr-7"
        />
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLocalPreview('');
              onChange('');
            }}
            className="absolute right-2 top-2.5 text-gray-400 hover:text-red-500 cursor-pointer"
            title="ক্লিয়ার করুন"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {description && (
        <p className="text-[10px] text-gray-500 leading-tight">
          {description}
        </p>
      )}

      {error && (
        <div className="text-[10px] text-red-600 flex items-center gap-1 font-medium bg-red-50 p-2 rounded-xl border border-red-200">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {uploadProgress && !error && (
        <div className="text-[10px] text-emerald-700 flex items-center gap-1 font-medium bg-emerald-50 p-2 rounded-xl border border-emerald-200">
          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{uploadProgress}</span>
        </div>
      )}

      {/* Live Preview Box with Remove Action */}
      {activeDisplayUrl && (
        <div className="flex items-center justify-between gap-2.5 p-2 bg-white rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden border border-gray-300 shrink-0 relative">
              <img
                src={activeDisplayUrl}
                alt="Poster Preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-gray-800 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>ফটো যুক্ত হয়েছে</span>
              </div>
              <div className="text-[9px] text-gray-400 font-mono truncate mt-0.5">
                {activeDisplayUrl.startsWith('data:') ? 'লোকাল মেমোরি-সেফ ইমেজ' : activeDisplayUrl}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLocalPreview('');
              onChange('');
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="ছবি মুছে ফেলুন"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
