import React, { useState, useRef } from 'react';
import { uploadImageToImgBB } from '../services/imageHosting';
import { UploadCloud, Image as ImageIcon, CheckCircle, AlertCircle, RefreshCw, X } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  apiKey?: string;
  placeholder?: string;
  description?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  value,
  onChange,
  apiKey,
  placeholder = 'https://i.ibb.co/... বা ফাইল সিলেক্ট করুন',
  description = 'ছবি সিলেক্ট করলে স্বয়ংক্রিয়ভাবে ImgBB এপিআই-তে আপলোড হয়ে ফায়ারবেজে সেভ হবে।'
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;

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
      setUploadProgress('ছবি প্রসেসিং ও আপলোড হচ্ছে...');

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
      setError(err?.message || 'ইমেজ আপলোড করতে সমস্যা হয়েছে, লিংক পেস্ট করতে পারেন।');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          onClick={(e) => e.stopPropagation()}
          accept="image/*"
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

        {/* Upload Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          disabled={uploading}
          className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all shrink-0 cursor-pointer"
          title="ডিভাইস থেকে ছবি আপলোড করুন"
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
    </div>
  );
};
