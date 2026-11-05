# 📱 FlickCove BD - Android APK Build & Play Protect Guide (স্টেপ-বাই-স্টেপ গাইড)

এই নির্দেশিকাটি অনুসরণ করে আপনি আপনার ওয়েব অ্যাপ্লিকেশনটিকে একটি হাই-পারফরম্যান্স **Android APK (.apk)** ফাইলে রূপান্তর করতে পারবেন যা Google Play Protect-এ কোনো লাল ওয়ার্নিং বা ব্লকিং ছাড়াই যেকোনো অ্যান্ড্রয়েড ফোনে অনায়াসে ইনস্টল হবে।

---

## 🛡️ প্লে প্রোটেক্ট (Play Protect) কেন ওয়ার্নিং দেয় এবং এর স্থায়ী সমাধান:

Google Play Protect যেকোনো আনভেরিফাইড APK-তে ওয়ার্নিং দেয় নিচের ৪টি কারণে:
1. **Generic Debug Key দিয়ে সাইন করা:** ডিফল্ট ডিবাগ কী দিয়ে সাইন করা APK-কে গুগল "Unknown / Unsafe Developer" মনে করে। নিজস্ব RSA Keystore দিয়ে সাইন করলে এটি সম্পূর্ণ ক্লিন থাকে।
2. **অতিরিক্ত ও বিপজ্জনক পারমিশন (Dangerous Permissions):** যেমন কন্ট্যাক্ট, ক্যামেরা, এসএমএস বা স্টোরেজ পারমিশন। আমাদের অ্যাপে শুধুমাত্র ২টি নিরাপদ ও স্বাভাবিক পারমিশন রাখা হয়েছে (`INTERNET` এবং `ACCESS_NETWORK_STATE`)।
3. **V2 ও V3 সাইনিং স্কিম মিসিং থাকা:** অ্যান্ড্রয়েড ১১+ ফোনে V2 ও V3 স্কিম ছাড়া সাইন করলে প্লে প্রোটেক্ট ব্লক করে।
4. **Target SDK পুরোনো হওয়া:** আধুনিক Target SDK 34 ব্যবহার করা হয়েছে।

---

## 🚀 ১. প্রজেক্ট বিল্ড ও ক্যালাসিটর সিঙ্ক কমান্ড

আপনার টার্মিনালে নিচের কমান্ডগুলো রান করুন:

```bash
# ১. ডিপেন্ডেন্সি ইনস্টল (যদি আগে করা না থাকে)
npm install

# ২. ওয়েব অ্যাপ প্রোডাকশন বিল্ড তৈরি
npm run build

# ৩. অ্যান্ড্রয়েড প্ল্যাটফর্ম যোগ ও সিঙ্ক
npx cap add android
npx cap sync android
```

---

## 🔑 ২. নিজস্ব রিলিজ কি-স্টোর (Release Keystore) তৈরি

নিচের কমান্ডটি চালিয়ে আপনার অ্যাপের জন্য একটি প্রোডাকশন কী-স্টোর ফাইল তৈরি করুন:

```bash
keytool -genkey -v -keystore flickcove-release.keystore -alias flickcove -keyalg RSA -keysize 2048 -validity 10000
```
*(পাসওয়ার্ড হিসেবে যেকোনো মনে রাখার মতো গোপন পিন দিন, যেমন আপনার প্রতিষ্ঠানের নাম)*

---

## 📦 ৩. রিলিজ APK বিল্ড করার কমান্ড

### পদ্ধতি A: Android Studio দিয়ে (সবচেয়ে সহজ):
1. কমান্ড রান করুন:
   ```bash
   npx cap open android
   ```
2. Android Studio ওপেন হলে:
   - মেনু থেকে যান: **Build** > **Generate Signed Bundle / APK**
   - সিলেক্ট করুন **APK**
   - আপনার তৈরি করা `flickcove-release.keystore` সিলেক্ট করুন।
   - **Signature Versions:** অবশ্যই **V1 (Jar Signature)** এবং **V2 (Full APK Signature)** উভয় চেকবক্সে টিক দিন।
   - **Build Variants:** `release` নির্বাচন করুন এবং **Finish** চাপুন।

### পদ্ধতি B: টার্মিনাল / Gradle দিয়ে সরাসরি:
```bash
cd android
./gradlew assembleRelease
```
বিল্ড হওয়া APK ফাইলটি পাবেন:
`android/app/build/outputs/apk/release/app-release-unsigned.apk`

---

## ✍️ ৪. Play Protect-Compliant V2 & V3 সাইনিং

```bash
# জিপ-অ্যালাইন করা
zipalign -v -p 4 app-release-unsigned.apk flickcove-aligned.apk

# V2 এবং V3 স্কিমে সাইন করা (এটিই প্লে প্রোটেক্ট ক্লিয়ার করে)
apksigner sign --ks flickcove-release.keystore --ks-key-alias flickcove --v2-signing-enabled true --v3-signing-enabled true --out flickcove-v1.2.0.apk flickcove-aligned.apk

# সাইন সফল হয়েছে কিনা যাচাই:
apksigner verify --verbose flickcove-v1.2.0.apk
```

---

## 📊 ৫. ফায়ারবেস ডাউনলোড ও লাইভ ডিভাইস ট্র্যাকিং

1. যখনই কোনো ব্যবহারকারী ব্রাউজার বা ফোনে অ্যাপ ডাউনলোড বা ওপেন করবে, `src/utils/deviceTracker.ts` স্বয়ংক্রিয়ভাবে ফায়ারবেস রিয়েলটাইম/ফায়ারস্টোরে ডাটা পাঠাবে।
2. **এডমিন প্যানেলে দেখার নিয়ম:**
   - অ্যাপের হোমস্ক্রিনে নিচে **More (আরও)** বা হেডারে এডমিন আইকনে ক্লিক করুন।
   - পাসওয়ার্ড দিন: `445566N`
   - মেনু বারে নতুন যুক্ত হওয়া **"ডিভাইস ও ডাউনলোড"** ট্যাবে ক্লিক করুন।
   - এখানে লাইভ দেখতে পাবেন:
     - মোট APK ডাউনলোড ক্লিক সংখ্যা
     - কয়টি ভিন্ন ফোনে অ্যাপটি ইনস্টল করা হয়েছে
     - ব্যবহারকারীদের ফোনের ব্র্যান্ড ও মডেল (Samsung, Xiaomi, Vivo, ইত্যাদি)
     - লাস্ট একটিভ টাইম এবং অ্যাপ ওপেনের সংখ্যা
