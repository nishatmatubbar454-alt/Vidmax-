import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, increment, collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { ApkAnalytics, InstalledDevice } from '../types';

const DEVICE_ID_KEY = 'flickcove_device_uuid';
const DEVICE_FIRST_RUN_KEY = 'flickcove_device_registered';

/**
 * Extracts a human-readable phone model or browser OS label
 */
export function getDeviceDetails(): { deviceModel: string; platform: string; isApk: boolean } {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isCapacitorNative = typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform();
  const isWebview = Boolean(
    isCapacitorNative ||
    (typeof window !== 'undefined' && (
      (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.() ||
      window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'ionic:' ||
      ua.includes('wv') ||
      (ua.includes('Android') && ua.includes('Version/'))
    ))
  );

  let deviceModel = 'Unknown Device';
  if (/Samsung|SM-[A-Z0-9]+/i.test(ua)) {
    const match = ua.match(/SM-[A-Z0-9]+/i);
    deviceModel = match ? `Samsung (${match[0]})` : 'Samsung Galaxy';
  } else if (/Xiaomi|Redmi|POCO|Mi\s[A-Z0-9]+/i.test(ua)) {
    const match = ua.match(/(?:Redmi|POCO|Mi)[\w\s-]+/i);
    deviceModel = match ? match[0].trim() : 'Xiaomi / Redmi';
  } else if (/Vivo|V2\d{3}[A-Z]*/i.test(ua)) {
    deviceModel = 'Vivo Phone';
  } else if (/OPPO|CPH\d{4}/i.test(ua)) {
    deviceModel = 'Oppo Phone';
  } else if (/Realme|RMX\d{4}/i.test(ua)) {
    deviceModel = 'Realme Phone';
  } else if (/Infinix|X\d{3}[A-Z]*/i.test(ua)) {
    deviceModel = 'Infinix Phone';
  } else if (/TECNO/i.test(ua)) {
    deviceModel = 'Tecno Phone';
  } else if (/Pixel\s\d+/i.test(ua)) {
    const match = ua.match(/Pixel\s\d+[a-zA-Z\s]*/i);
    deviceModel = match ? `Google ${match[0]}` : 'Google Pixel';
  } else if (/iPhone/i.test(ua)) {
    deviceModel = 'Apple iPhone';
  } else if (/iPad/i.test(ua)) {
    deviceModel = 'Apple iPad';
  } else if (/Android/i.test(ua)) {
    deviceModel = 'Android Phone';
  } else if (/Windows NT/i.test(ua)) {
    deviceModel = 'Windows PC';
  } else if (/Macintosh/i.test(ua)) {
    deviceModel = 'Mac';
  } else if (/Linux/i.test(ua)) {
    deviceModel = 'Linux Desktop';
  }

  let platform = 'Web';
  if (isCapacitorNative || isWebview) {
    platform = 'Android APK';
  } else if (/Android/i.test(ua)) {
    platform = 'PWA (Android)';
  } else if (/iPhone|iPad/i.test(ua)) {
    platform = 'PWA (iOS)';
  }

  return {
    deviceModel,
    platform,
    isApk: isCapacitorNative || isWebview,
  };
}

/**
 * Gets or creates a unique device identifier
 */
export function getOrCreateDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      const rand = Math.random().toString(36).substring(2, 8);
      const time = Date.now().toString(36);
      id = `fc_${rand}_${time}`;
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return `fc_temp_${Date.now()}`;
  }
}

/**
 * Ping and register device in Firebase Firestore
 */
export async function recordAppLaunch(appVersion = '1.2.0'): Promise<void> {
  try {
    const deviceId = getOrCreateDeviceId();
    const { deviceModel, platform, isApk } = getDeviceDetails();
    const screenRes = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'unknown';
    const lang = typeof navigator !== 'undefined' ? (navigator.language || 'bn-BD') : 'bn-BD';
    const nowIso = new Date().toISOString();

    const isAlreadyRegistered = localStorage.getItem(DEVICE_FIRST_RUN_KEY) === 'true';
    const deviceRef = doc(db, 'installed_devices', deviceId);
    const summaryRef = doc(db, 'apk_analytics', 'summary');

    if (!isAlreadyRegistered) {
      const docSnap = await getDoc(deviceRef);
      if (!docSnap.exists()) {
        const newDeviceData: InstalledDevice = {
          deviceId,
          platform,
          deviceModel,
          appVersion,
          isApk,
          installedAt: nowIso,
          lastSeen: nowIso,
          totalOpens: 1,
          screenResolution: screenRes,
          language: lang,
        };

        await setDoc(deviceRef, newDeviceData);
        localStorage.setItem(DEVICE_FIRST_RUN_KEY, 'true');

        // Increment device count in summary
        await setDoc(
          summaryRef,
          {
            totalDevices: increment(1),
            activeDevices: increment(1),
            lastUpdated: nowIso,
          },
          { merge: true }
        );
        return;
      }
      localStorage.setItem(DEVICE_FIRST_RUN_KEY, 'true');
    }

    // Returning user: update heartbeat
    await updateDoc(deviceRef, {
      lastSeen: nowIso,
      totalOpens: increment(1),
      appVersion,
      platform,
      deviceModel,
    }).catch(async () => {
      // If doc didn't exist, recreate it
      await setDoc(
        deviceRef,
        {
          deviceId,
          platform,
          deviceModel,
          appVersion,
          isApk,
          installedAt: nowIso,
          lastSeen: nowIso,
          totalOpens: 1,
          screenResolution: screenRes,
          language: lang,
        },
        { merge: true }
      );
    });

    await setDoc(
      summaryRef,
      {
        lastUpdated: nowIso,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Device telemetry ping notice:', err);
  }
}

/**
 * Increment APK download click count in Firebase Firestore
 */
export async function recordApkDownload(): Promise<void> {
  try {
    const summaryRef = doc(db, 'apk_analytics', 'summary');
    const nowIso = new Date().toISOString();

    await setDoc(
      summaryRef,
      {
        totalDownloads: increment(1),
        lastUpdated: nowIso,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Apk download counter notice:', err);
  }
}

/**
 * Real-time subscription to APK Analytics Summary
 */
export function subscribeToApkAnalytics(callback: (data: ApkAnalytics) => void): () => void {
  const summaryRef = doc(db, 'apk_analytics', 'summary');
  return onSnapshot(summaryRef, (snap) => {
    if (snap.exists()) {
      const d = snap.data();
      callback({
        totalDownloads: d.totalDownloads || 0,
        totalDevices: d.totalDevices || 0,
        activeDevices: d.activeDevices || 0,
        lastUpdated: d.lastUpdated || '',
      });
    } else {
      callback({
        totalDownloads: 0,
        totalDevices: 0,
        activeDevices: 0,
      });
    }
  });
}

/**
 * Real-time subscription to list of installed devices
 */
export function subscribeToInstalledDevices(callback: (devices: InstalledDevice[]) => void): () => void {
  const devCol = collection(db, 'installed_devices');
  const q = query(devCol, orderBy('lastSeen', 'desc'), limit(100));

  return onSnapshot(
    q,
    (snap) => {
      const list: InstalledDevice[] = [];
      snap.forEach((d) => {
        const item = d.data() as InstalledDevice;
        list.push({
          deviceId: item.deviceId || d.id,
          platform: item.platform || 'Unknown',
          deviceModel: item.deviceModel || 'Phone',
          appVersion: item.appVersion || '1.0.0',
          isApk: !!item.isApk,
          installedAt: item.installedAt || '',
          lastSeen: item.lastSeen || '',
          totalOpens: item.totalOpens || 1,
          screenResolution: item.screenResolution,
          language: item.language,
        });
      });
      callback(list);
    },
    (err) => {
      console.warn('Installed devices listener error:', err);
    }
  );
}
