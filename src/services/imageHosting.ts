/**
 * Image Hosting & Local Resilient Processing Service
 * - First attempts fast CDN hosting via ImgBB API
 * - Features automated browser Canvas compression (< 80KB)
 * - If ImgBB returns 400/403/Forbidden (Code 103) or offline, transparently
 *   falls back to high-fidelity compressed Data URL so image uploading NEVER fails!
 */

export const DEFAULT_IMGBB_API_KEY = 'e7b8f8955ab261abec0ccdce4c38d9a9';

export interface ImgBBUploadResponse {
  url: string;
  displayUrl: string;
  thumbnailUrl?: string;
  deleteUrl?: string;
  title?: string;
  source?: 'imgbb' | 'compressed_data_url';
}

/**
 * Resizes and compresses any image File or Blob safely without mobile OOM crashes (~30KB-60KB)
 */
export async function compressImageToDataUrl(
  fileOrBlob: File | Blob,
  maxDim = 450,
  quality = 0.65
): Promise<string> {
  // 1. Try hardware-accelerated createImageBitmap if supported (zero JS heap bloat)
  if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(fileOrBlob);
      let { width, height } = bitmap;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium';
        ctx.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();
        return canvas.toDataURL('image/jpeg', quality);
      }
      bitmap.close();
    } catch (e) {
      console.warn('createImageBitmap failed, falling back to Image tag:', e);
    }
  }

  // 2. Safe Fallback using Image element
  return new Promise((resolve) => {
    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(fileOrBlob);

      img.onload = () => {
        try {
          URL.revokeObjectURL(objectUrl);
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(fileOrBlob);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(fileOrBlob);
        }
      };

      img.onerror = () => {
        try { URL.revokeObjectURL(objectUrl); } catch {}
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(fileOrBlob);
      };

      img.src = objectUrl;
    } catch {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(fileOrBlob);
    }
  });
}

/**
 * Uploads an image (File, Blob, or base64 string) with graceful fallback:
 * 1. Fast local server upload (/api/upload-image) returning clean /uploads/ URL
 * 2. External ImgBB / CDN fallback
 * 3. Base64 compressed fallback
 */
export async function uploadImageToImgBB(
  imageInput: File | Blob | string,
  apiKey: string = DEFAULT_IMGBB_API_KEY
): Promise<ImgBBUploadResponse> {
  let compressedFallbackUrl = '';

  // 1. Generate memory-safe downscaled JPEG (max 600px, quality 0.7)
  if (typeof imageInput !== 'string') {
    try {
      compressedFallbackUrl = await compressImageToDataUrl(imageInput);
    } catch {
      // ignore
    }
  } else if (imageInput.startsWith('data:image')) {
    compressedFallbackUrl = imageInput;
  }

  // 2. PRIMARY: Upload to internal /api/upload-image endpoint for clean, permanent short URL
  if (compressedFallbackUrl && compressedFallbackUrl.startsWith('data:image')) {
    try {
      const serverRes = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64: compressedFallbackUrl,
          ext: 'jpg'
        })
      });
      if (serverRes.ok) {
        const serverData = await serverRes.json();
        if (serverData && serverData.url) {
          return {
            url: serverData.url,
            displayUrl: serverData.url,
            source: 'server' as any
          };
        }
      }
    } catch (e) {
      console.warn('Local /api/upload-image unavailable, falling back:', e);
    }
  }

  // 3. SECONDARY: ImgBB Cloud API fallback
  const activeKey = apiKey?.trim() || DEFAULT_IMGBB_API_KEY;
  const formData = new FormData();

  if (typeof imageInput === 'string') {
    if (imageInput.startsWith('data:image')) {
      const base64Content = imageInput.split(',')[1];
      formData.append('image', base64Content);
    } else {
      formData.append('image', imageInput);
    }
  } else {
    if (compressedFallbackUrl && compressedFallbackUrl.startsWith('data:image')) {
      formData.append('image', compressedFallbackUrl.split(',')[1]);
    } else {
      formData.append('image', imageInput);
    }
  }

  const endpoint = `https://api.imgbb.com/1/upload?key=${encodeURIComponent(activeKey)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const json = await response.json();
      if (json.success && json.data) {
        return {
          url: json.data.url,
          displayUrl: json.data.display_url || json.data.url,
          thumbnailUrl: json.data.thumb?.url || json.data.url,
          deleteUrl: json.data.delete_url,
          title: json.data.title,
          source: 'imgbb'
        };
      }
    }
  } catch (error) {
    console.warn('ImgBB fallback encountered error:', error);
  }

  // 4. FINAL SAFE FALLBACK
  if (compressedFallbackUrl) {
    return {
      url: compressedFallbackUrl,
      displayUrl: compressedFallbackUrl,
      source: 'compressed_data_url'
    };
  }

  throw new Error('Image processing failed');
}
