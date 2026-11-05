import { Movie, SiteSettings, AppShortcut, Series } from './types';

export const INITIAL_SETTINGS: SiteSettings = {
  adminPasswordHash: '6436661e0985211a34d0f990428434f9d9f6ada1ca74e3d1309b47d5815d3b0d',
  siteTitle: 'FlickCove',
  headerLogoUrl: '/assets/header-logo.png',
  appLogoUrl: 'https://i.ibb.co/Fqs3RwWH/file-00000000bf7881f4911ee0ce9ad5fa1e.png',
  noticeBanner: '🎬 Welcome to FlickCove! All Latest Movies available in 1080p, 720p & 480p.',
  showNotice: false,
  telegramUrl: 'https://t.me/flickcove_official',
  telegramLabel: 'Telegram',
  whatsappUrl: 'https://chat.whatsapp.com/sample',
  contactUrl: 'https://chat.whatsapp.com/sample',
  contactLabel: 'Contact',
  shareInviteUrl: 'https://videodownloader.site',
  searchRedirectUrl: 'https://videodownloader.site',
  searchModalTitle: 'আপনি কী দেখতে বা ডাউনলোড করতে চান?',
  searchButton1Text: 'মুভির ডাউনলোড',
  searchButton1Url: 'https://videodownloader.site',
  searchButton2Text: 'বাংলাদেশী ১৮+ ভিডিও',
  quickBox1Text: 'Tanning movie',
  quickBox1Url: 'https://videodownloader.site',
  quickBox1Active: true,
  quickBox2Text: '18+',
  quickBox2Url: 'https://tinyurl.com/2waz6wm2',
  quickBox2Active: true,
  apkVersion: 'v2.1.0',
  apkDownloadUrl: '',
  apkUpdateChangelog: '• Fast 480p 720p 1080p download links\n• New details view with screenshots & file info',
  forceApkUpdate: false,
  imgbbApiKey: 'e7b8f8955ab261abec0ccdce4c38d9a9',
  homeFeedAd: {
    active: true,
    scriptCode: `<script>
  atOptions = {
    'key' : '280410b8223e51dae425f09c7a2f0eb1',
    'format' : 'iframe',
    'height' : 60,
    'width' : 468,
    'params' : {}
  };
</script>
<script src="https://brijmohan.org/22/280410b8223e51dae425f09c7a2f0eb1"></script>`,
    interval: 1,
  },
  bannerAd: {
    active: false,
    imageUrl: '',
    targetUrl: 'https://videodownloader.site',
    scriptCode: ''
  },
  movieDetailAd: {
    active: true,
    scriptCode: `<script>
  atOptions = {
    'key' : '911ee250303f0d466e6e2cab58b077e0',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
</script>
<script src="https://bauval.org/22/911ee250303f0d466e6e2cab58b077e0"></script>`,
    imageUrl: '',
    targetUrl: 'https://videodownloader.site'
  },
  popupAd: {
    active: false,
    title: 'স্পেশাল অফার ও আপডেট',
    imageUrl: '',
    targetUrl: 'https://videodownloader.site',
    buttonText: 'এখনই দেখুন'
  },
  directAdLink: '',
  customAdCode: '',
  sponsored1: { title: 'SPONSORED', tag: 'Fast Partner', url: '#', active: false },
  sponsored2: { title: 'SPONSORED', tag: 'Fast Cloud', url: '#', active: false },
  inFeedSponsored: { title: 'SPONSORED', tag: 'Terabox Cloud', url: '#', active: false },
  appsSponsoredAd: {
    active: true,
    title: 'MEXC: Buy Bitcoin & Crypto',
    subtitle: '31,000,000 KSKD Up for Grabs',
    imageUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=500&auto=format&fit=crop&q=80',
    iconUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=120&auto=format&fit=crop&q=80',
    targetUrl: 'https://videodownloader.site',
    buttonText: 'INSTALL',
    scriptCode: `<script>
  atOptions = {
    'key' : '280410b8223e51dae425f09c7a2f0eb1',
    'format' : 'iframe',
    'height' : 60,
    'width' : 468,
    'params' : {}
  };
</script>
<script src="https://brijmohan.org/22/280410b8223e51dae425f09c7a2f0eb1"></script>`
  },
  downloadPageAd: {
    active: true,
    scriptCode: `<script type="text/javascript">
  atOptions = {
    'key' : '911ee250303f0d466e6e2cab58b077e0',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
</script>
<script type="text/javascript" src="https://glamourpicklessteward.com/911ee250303f0d466e6e2cab58b077e0/invoke.js"></script>`,
    count: 5,
  },
  musicPageAd: {
    active: true,
    scriptCode: `<script>
  atOptions = {
    'key' : '911ee250303f0d466e6e2cab58b077e0',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
</script>
<script src="https://bauval.org/22/911ee250303f0d466e6e2cab58b077e0"></script>`,
    scriptCode1: `<script>
  atOptions = {
    'key' : '911ee250303f0d466e6e2cab58b077e0',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
</script>
<script src="https://bauval.org/22/911ee250303f0d466e6e2cab58b077e0"></script>`,
    scriptCode2: ''
  },
};

export const INITIAL_MOVIES: Movie[] = [
  {
    id: 'udaala-2025',
    title: 'Udaala (2025) (Hindi + Kannada) Dual Audio UnCut South Movie HD ESub',
    category: 'South Hindi Dubbed',
    badgeLabel: 'South Hindi Dubbed Movie',
    badgeColor: 'red',
    titleColor: 'red',
    genres: ['Drama', 'Romance'],
    year: '2025',
    poster: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&auto=format&fit=crop&q=80',
    audio: 'Hindi + Kannada Dual Audio',
    language: 'Hindi + Kannada',
    duration: '2h 40min',
    releaseDate: '2025',
    starcast: 'Vadiraj Babaladi, Dayanand Beeligi, Yogaraj Bhat, Bala Rajwadi, Praveen Kumar Gasti',
    quality: '480p 720p 1080p [HD]',
    description: 'Set in a vibrant cultural backdrop, a young lovers fight against societal bullies takes many twists—yet can the wisdom of the city\'s monuments turn conflict into love, respect, and harmony?',
    rating: '8.8',
    views: 45200,
    teraboxUrl: 'https://terabox.com/s/1Udaala-Dual-Hindi-Flickcove',
    driveUrl: 'https://drive.google.com/uc?export=download&id=Udaala2025Hindi',
    fastDownloadUrl: 'https://fastserver.flickcove.top/download/udaala-2025.mkv',
    streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    fileSizes: {
      p1080: '2.2 GB',
      p720: '1.4 GB',
      p480: '570 MB',
    },
    screenshots: [
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80'
    ],
    featured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'churuli-2021',
    title: 'Churuli (2021) (Hindi + Malayalam) Dual Audio UnCut South Movie HD ESub',
    category: 'South Hindi Dubbed',
    badgeLabel: 'South Hindi Dubbed Movie',
    badgeColor: 'green',
    titleColor: 'green',
    genres: ['Mystery', 'Sci-Fi', 'Thriller'],
    year: '2021',
    poster: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80',
    audio: 'Hindi + Malayalam Dual Audio',
    language: 'Hindi + Malayalam',
    duration: '1h 55min',
    releaseDate: '2021',
    starcast: 'Vinay Forrt, Chemban Vinod Jose, Joju George, Soubin Shahir, Jaffer Idukki',
    quality: '480p 720p 1080p [HD]',
    description: 'Two undercover cops venture deep into an eerie dense forest village to nab a fugitive criminal named Mayiladumparambil Joy, but find themselves trapped in a mysterious time-looping labyrinth.',
    rating: '8.4',
    views: 38900,
    teraboxUrl: 'https://terabox.com/s/1Churuli-Dual-Hindi-Flickcove',
    driveUrl: 'https://drive.google.com/uc?export=download&id=ChuruliHindi',
    fastDownloadUrl: 'https://fastserver.flickcove.top/download/churuli.mkv',
    fileSizes: {
      p1080: '1.9 GB',
      p720: '980 MB',
      p480: '450 MB',
    },
    screenshots: [
      'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=500&auto=format&fit=crop&q=80'
    ],
    featured: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'verity-2026',
    title: 'Verity (2026) (Hindi + English) Dual Audio Hollywood Movie HD ESub',
    category: 'Hollywood Hindi',
    badgeLabel: 'Hollywood Hindi Movies',
    badgeColor: 'red',
    titleColor: 'red',
    genres: ['Psychological', 'Thriller', 'Mystery'],
    year: '2026',
    poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&auto=format&fit=crop&q=80',
    audio: 'Hindi + English Dual Audio',
    language: 'Hindi + English',
    duration: '2h 10min',
    releaseDate: '2026',
    starcast: 'Anne Hathaway, Dakota Johnson, Jeremy Allen White',
    quality: '480p 720p 1080p [HD]',
    description: 'A struggling author accepts an offer to finish the remaining books of a successful series after the original author is injured, only to uncover shocking bone-chilling manuscripts in her mansion.',
    rating: '8.7',
    views: 52100,
    teraboxUrl: 'https://terabox.com/s/1Verity-Dual-Hindi-Flickcove',
    driveUrl: 'https://drive.google.com/uc?export=download&id=VerityHindi',
    fastDownloadUrl: 'https://fastserver.flickcove.top/download/verity.mkv',
    fileSizes: {
      p1080: '2.5 GB',
      p720: '1.2 GB',
      p480: '500 MB',
    },
    screenshots: [
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80'
    ],
    featured: true,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'little-thomas-2026',
    title: 'Little Thomas (2026) Bollywood Hindi Movie HQCam',
    category: 'Bollywood Hindi',
    badgeLabel: 'Bollywood Hindi Movies',
    badgeColor: 'green',
    titleColor: 'green',
    genres: ['Comedy', 'Family', 'Drama'],
    year: '2026',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    audio: 'Hindi Clean HQCam Audio',
    language: 'Hindi',
    duration: '1h 48min',
    releaseDate: '2026',
    starcast: 'Gulshan Devaiah, Rasika Dugal, Hridansh Parekh',
    quality: '480p 720p 1080p [HQCam]',
    description: 'Set in 1990s Mumbai, an only child named Thomas will go to extraordinary and hilarious lengths to persuade his parents to give him a baby brother.',
    rating: '8.1',
    views: 29400,
    teraboxUrl: 'https://terabox.com/s/1LittleThomas-Hindi-Flickcove',
    driveUrl: 'https://drive.google.com/uc?export=download&id=LittleThomas',
    fastDownloadUrl: 'https://fastserver.flickcove.top/download/little-thomas.mkv',
    fileSizes: {
      p1080: '1.8 GB',
      p720: '900 MB',
      p480: '400 MB',
    },
    screenshots: [
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80'
    ],
    featured: false,
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 'tu-hai-meri-kiran-2026',
    title: 'Tu Hai Meri Kiran (2026) Bollywood Hindi Movie HQCam',
    category: 'Bollywood Hindi',
    badgeLabel: 'Bollywood Hindi Movies',
    badgeColor: 'blue',
    titleColor: 'blue',
    genres: ['Romance', 'Drama'],
    year: '2026',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
    audio: 'Hindi Clean HQ Audio',
    language: 'Hindi',
    duration: '2h 15min',
    releaseDate: '2026',
    starcast: 'Abhimanyu Dassani, Shanaya Kapoor',
    quality: '480p 720p 1080p [HQCam]',
    description: 'A heart-touching romantic journey of two childhood friends who cross paths again in adulthood and redefine love against all odds.',
    rating: '7.9',
    views: 31200,
    teraboxUrl: 'https://terabox.com/s/1TuHaiMeriKiran-Flickcove',
    driveUrl: 'https://drive.google.com/uc?export=download&id=TuHaiMeriKiran',
    fastDownloadUrl: 'https://fastserver.flickcove.top/download/kiran.mkv',
    fileSizes: {
      p1080: '2.0 GB',
      p720: '1.1 GB',
      p480: '480 MB',
    },
    screenshots: [
      'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=500&auto=format&fit=crop&q=80'
    ],
    featured: false,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'ohm-shanthi-oshaana-2014',
    title: 'Ohm Shanthi Oshaana (2014) (Hindi + Malayalam) Dual Audio UnCut South Movie HD ESub',
    category: 'South Hindi Dubbed',
    badgeLabel: 'South Hindi Dubbed Movie',
    badgeColor: 'blue',
    titleColor: 'blue',
    genres: ['Romantic Comedy', 'Drama'],
    year: '2014',
    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
    audio: 'Hindi + Malayalam Dual Audio',
    language: 'Hindi + Malayalam',
    duration: '2h 16min',
    releaseDate: '2014',
    starcast: 'Nazriya Nazim, Nivin Pauly, Renji Panicker, Aju Varghese',
    quality: '480p 720p 1080p [HD]',
    description: 'Spirited high school girl Pooja falls in love with Giri, an older martial artist and farmer, and vows to win his heart over the span of a decade.',
    rating: '8.3',
    views: 64000,
    teraboxUrl: 'https://terabox.com/s/1OhmShanthi-Dual-Hindi-Flickcove',
    driveUrl: 'https://drive.google.com/uc?export=download&id=OhmShanthi',
    fastDownloadUrl: 'https://fastserver.flickcove.top/download/ohm-shanthi.mkv',
    fileSizes: {
      p1080: '2.1 GB',
      p720: '1.2 GB',
      p480: '500 MB',
    },
    screenshots: [
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80'
    ],
    featured: false,
    createdAt: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    id: 'pehla-pyaar-doosri-baar-2026',
    title: 'Pehla Pyaar Doosri Baar (2026) Bollywood Hindi Movie HQCam',
    category: 'Bollywood Hindi',
    badgeLabel: 'Bollywood Hindi Movies',
    badgeColor: 'blue',
    titleColor: 'blue',
    genres: ['Drama', 'Romance'],
    year: '2026',
    poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&auto=format&fit=crop&q=80',
    audio: 'Hindi Clean HQ Audio',
    language: 'Hindi',
    duration: '2h 05min',
    releaseDate: '2026',
    starcast: 'Karan Kundrra, Tejasswi Prakash',
    quality: '480p 720p 1080p [HQCam]',
    description: 'Can second chances heal broken promises? An emotional exploration of modern love, heartbreak, and unexpected reunions.',
    rating: '8.0',
    views: 41000,
    teraboxUrl: 'https://terabox.com/s/1PehlaPyaar-Hindi-Flickcove',
    driveUrl: 'https://drive.google.com/uc?export=download&id=PehlaPyaar',
    fastDownloadUrl: 'https://fastserver.flickcove.top/download/pehla-pyaar.mkv',
    fileSizes: {
      p1080: '1.9 GB',
      p720: '1.0 GB',
      p480: '460 MB',
    },
    screenshots: [
      'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500&auto=format&fit=crop&q=80'
    ],
    featured: false,
    createdAt: new Date(Date.now() - 21600000).toISOString(),
  },
  {
    id: 'ishq-not-a-love-story-2021',
    title: 'Ishq - Not a Love Story (2021) (Hindi + Telugu) Dual Audio UnCut South Movie HD ESub',
    category: 'South Hindi Dubbed',
    badgeLabel: 'South Hindi Dubbed Movie',
    badgeColor: 'orange',
    titleColor: 'orange',
    genres: ['Thriller', 'Suspense'],
    year: '2021',
    poster: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600&auto=format&fit=crop&q=80',
    audio: 'Hindi + Telugu Dual Audio',
    language: 'Hindi + Telugu',
    duration: '1h 58min',
    releaseDate: '2021',
    starcast: 'Teja Sajja, Priya Prakash Varrier, Ravindra Vijay',
    quality: '480p 720p 1080p [HD]',
    description: 'A couple goes on a romantic car drive at night, only to face moral policing by two strangers that spirals into psychological vengeance.',
    rating: '7.8',
    views: 35000,
    teraboxUrl: 'https://terabox.com/s/1Ishq-Dual-Hindi-Flickcove',
    driveUrl: 'https://drive.google.com/uc?export=download&id=IshqTeluguHindi',
    fastDownloadUrl: 'https://fastserver.flickcove.top/download/ishq.mkv',
    fileSizes: {
      p1080: '2.0 GB',
      p720: '1.1 GB',
      p480: '450 MB',
    },
    screenshots: [
      'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=500&auto=format&fit=crop&q=80'
    ],
    featured: false,
    createdAt: new Date(Date.now() - 25200000).toISOString(),
  },
  {
    id: 'hitler-2024',
    title: 'Hitler (2024) (Hindi + Tamil) Dual Audio UnCut South Movie HD ESub',
    category: 'South Hindi Dubbed',
    badgeLabel: 'South Hindi Dubbed Movie',
    badgeColor: 'blue',
    titleColor: 'blue',
    genres: ['Action', 'Thriller'],
    year: '2024',
    poster: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&auto=format&fit=crop&q=80',
    audio: 'Hindi + Tamil Dual Audio',
    language: 'Hindi + Tamil',
    duration: '2h 20min',
    releaseDate: '2024',
    starcast: 'Vijay Antony, Riya Suman, Gautham Vasudev Menon',
    quality: '480p 720p 1080p [HD]',
    description: 'An innocent engineer is hunted by an undercover cop when a series of vigilante robberies target corrupted political election black-money.',
    rating: '8.0',
    views: 48900,
    teraboxUrl: 'https://terabox.com/s/1Hitler-Dual-Hindi-Flickcove',
    driveUrl: 'https://drive.google.com/uc?export=download&id=Hitler2024Hindi',
    fastDownloadUrl: 'https://fastserver.flickcove.top/download/hitler.mkv',
    fileSizes: {
      p1080: '2.3 GB',
      p720: '1.2 GB',
      p480: '500 MB',
    },
    screenshots: [
      'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=500&auto=format&fit=crop&q=80'
    ],
    featured: false,
    createdAt: new Date(Date.now() - 28800000).toISOString(),
  }
];

export const CATEGORIES = [
  'All',
  'South Hindi Dubbed',
  'Bollywood Hindi',
  'Hollywood Hindi',
  'Action',
  'Comedy',
  'Drama',
  'Romance',
  'Mystery',
];

export const INITIAL_MUSIC_TRACKS: import('./types').MusicTrack[] = [
  {
    id: 'track-1',
    youtubeId: 'q_67dO-ZtP0',
    youtubeUrl: 'https://music.youtube.com/watch?v=q_67dO-ZtP0',
    title: 'আমি দূর হতে তোমারেই দেখেছি',
    artist: 'Pointer Music',
    views: '2.6M views',
    duration: '4:35',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    category: 'Covers and remixes',
    likesCount: '2.4K',
    commentsCount: '86',
    hasAiTag: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'track-2',
    youtubeId: 'yG7X9kP1Q4I',
    youtubeUrl: 'https://music.youtube.com/watch?v=yG7X9kP1Q4I',
    title: 'Patar Bashori Lofi Song | পাতার বাঁশরী',
    artist: 'Relax Bd Lofi',
    views: '819K views',
    duration: '7:02',
    thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80',
    category: 'Covers and remixes',
    likesCount: '1.8K',
    commentsCount: '41',
    hasAiTag: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'track-3',
    youtubeId: '69q9jC9i_6A',
    youtubeUrl: 'https://music.youtube.com/watch?v=69q9jC9i_6A',
    title: 'ওপারে থাকবো আমি | Opare Thakbo Ami',
    artist: 'নীলদিগন্তে',
    views: '781K views',
    duration: '5:14',
    thumbnail: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500&auto=format&fit=crop&q=80',
    category: 'Relax',
    likesCount: '3.1K',
    commentsCount: '95',
    hasAiTag: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'track-4',
    youtubeId: 'y5hQyL5xR2c',
    youtubeUrl: 'https://music.youtube.com/watch?v=y5hQyL5xR2c',
    title: 'Mon Na Dile Hoy Ki Prem | মন না দিলে হয় কি প্রেম',
    artist: 'Ganer Thikana 🎶',
    views: '9.8M views',
    duration: '4:10',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    category: 'Feel good',
    likesCount: '12K',
    commentsCount: '320',
    hasAiTag: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'track-5',
    youtubeId: '9oWj47_t63w',
    youtubeUrl: 'https://music.youtube.com/watch?v=9oWj47_t63w',
    title: 'Ami Banglay Gaan Gai | আমি বাংলায় গান গাই',
    artist: 'Mahmuduzzaman Babu',
    views: '12M views',
    duration: '5:40',
    thumbnail: 'https://images.unsplash.com/photo-1520523839898-507127ef3e41?w=500&auto=format&fit=crop&q=80',
    category: 'Energize',
    likesCount: '45K',
    commentsCount: '810',
    hasAiTag: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'track-6',
    youtubeId: 'bJz1jA04p_w',
    youtubeUrl: 'https://music.youtube.com/watch?v=bJz1jA04p_w',
    title: 'Bhalobashi Bhalobashi | ভালোবাসি ভালোবাসি (Lofi Mix)',
    artist: 'Lofi Studio BD',
    views: '3.4M views',
    duration: '3:50',
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80',
    category: 'Relax',
    likesCount: '8.7K',
    commentsCount: '140',
    hasAiTag: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'track-7',
    youtubeId: 'YQHsXMglC9A',
    youtubeUrl: 'https://music.youtube.com/watch?v=YQHsXMglC9A',
    title: 'Bondhu Tin Din | বন্ধু তিন দিন তোর বাড়ি গেলাম',
    artist: 'Runa Laila Hits',
    views: '15M views',
    duration: '4:22',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
    category: 'Workout',
    likesCount: '38K',
    commentsCount: '620',
    hasAiTag: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'track-8',
    youtubeId: 'k4V3Ui68k7g',
    youtubeUrl: 'https://music.youtube.com/watch?v=k4V3Ui68k7g',
    title: 'Preme Pora Baron | প্রেমে পড়া বারণ (Acoustic Guitar)',
    artist: 'Unplugged Vibes BD',
    views: '6.2M views',
    duration: '3:45',
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80',
    category: 'Covers and remixes',
    likesCount: '19K',
    commentsCount: '412',
    hasAiTag: false,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_APP_SHORTCUTS: AppShortcut[] = [
  // Favorite Section
  {
    id: 'app-youtube',
    title: 'YouTube',
    url: 'https://youtube.com',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png',
    section: 'Favorite',
    order: 1,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'app-facebook',
    title: 'Facebook',
    url: 'https://facebook.com',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/5968/5968764.png',
    section: 'Favorite',
    order: 2,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'app-instagram',
    title: 'Instagram',
    url: 'https://instagram.com',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3955/3955024.png',
    section: 'Favorite',
    order: 3,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'app-google',
    title: 'Google',
    url: 'https://google.com',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
    section: 'Favorite',
    order: 4,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'app-tiktok',
    title: 'TikTok',
    url: 'https://tiktok.com',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png',
    section: 'Favorite',
    order: 5,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'app-vimeo',
    title: 'Vimeo',
    url: 'https://vimeo.com',
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Vimeo_icon.svg/240px-Vimeo_icon.svg.png',
    section: 'Favorite',
    order: 6,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'app-pinterest',
    title: 'Pinterest',
    url: 'https://pinterest.com',
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Pinterest-logo.png/240px-Pinterest-logo.png',
    section: 'Favorite',
    order: 7,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'app-pkpk88',
    title: 'PKPK-88',
    url: 'https://videodownloader.site',
    iconUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&auto=format&fit=crop&q=80',
    section: 'Favorite',
    order: 8,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'app-dearmet',
    title: 'Dearmet',
    url: 'https://videodownloader.site',
    iconUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    section: 'Favorite',
    order: 9,
    active: true,
    createdAt: new Date().toISOString()
  },

  // Paisa Kamao Section
  {
    id: 'game-q880-506',
    title: 'Q880-506',
    url: 'https://videodownloader.site',
    iconUrl: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=200&auto=format&fit=crop&q=80',
    section: 'Paisa Kamao',
    order: 10,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'game-q880-507',
    title: 'Q880-507',
    url: 'https://videodownloader.site',
    iconUrl: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=200&auto=format&fit=crop&q=80',
    section: 'Paisa Kamao',
    order: 11,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'game-na33',
    title: 'NA33',
    url: 'https://videodownloader.site',
    iconUrl: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=200&auto=format&fit=crop&q=80',
    section: 'Paisa Kamao',
    order: 12,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'game-pkpk88-earn',
    title: 'PKPK88',
    url: 'https://videodownloader.site',
    iconUrl: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=200&auto=format&fit=crop&q=80',
    section: 'Paisa Kamao',
    order: 13,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'game-777bd',
    title: '777BD',
    url: 'https://videodownloader.site',
    iconUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200&auto=format&fit=crop&q=80',
    section: 'Paisa Kamao',
    order: 14,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'game-ace67',
    title: 'ACE 67',
    url: 'https://videodownloader.site',
    iconUrl: 'https://images.unsplash.com/photo-1541278107931-e006523892df?w=200&auto=format&fit=crop&q=80',
    section: 'Paisa Kamao',
    order: 15,
    active: true,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_SERIES: Series[] = [
  {
    id: 'series-hsc-ict',
    title: 'এইচএসসি প্রোগ্রামিং ও আইসিটি ভিডিও সিরিজ (HSC ICT Complete Video Class)',
    category: 'South Hindi Dubbed',
    badgeLabel: 'YouTube Exclusive Series • ৩টি ক্লাস',
    badgeColor: 'blue',
    poster: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    year: '2026',
    quality: 'Full HD 1080p',
    description: 'এইচএসসি শিক্ষার্থীদের জন্য সম্পূর্ণ আইসিটি ও প্রোগ্রামিং ভাষা চ্যাপ্টারভিত্তিক ভিডিও লেকচার সিরিজ।',
    isYouTubeSeries: true,
    episodes: [
      {
        id: 'ep-hsc-1',
        episodeNumber: 1,
        title: 'লেকচার ১: বিশ্ব ও বাংলাদেশ প্রেক্ষিত - প্রাথমিক পরিচিতি ও মূল কনসেপ্ট',
        badge: 'প্রথম অধ্যায় • আইসিটি (ICT)',
        youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
        youtubeId: 'kJQP7kiw5Fk',
        thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
        duration: '22:15',
        description: 'প্রথম অধ্যায়ের সম্পূর্ণ বেসিক আলোচনা ও বোর্ড পরীক্ষার প্রস্তুতি।'
      },
      {
        id: 'ep-hsc-2',
        episodeNumber: 2,
        title: 'লেকচার ২: বিশ্ব ও বাংলাদেশ প্রেক্ষিত - গুরুত্বপূর্ণ সূত্র ও বেসিক নিয়মাবলী',
        badge: 'প্রথম অধ্যায় • আইসিটি (ICT)',
        youtubeUrl: 'https://www.youtube.com/watch?v=kqtD5dpn9C8',
        youtubeId: 'kqtD5dpn9C8',
        thumbnail: 'https://img.youtube.com/vi/kqtD5dpn9C8/hqdefault.jpg',
        duration: '28:40',
        description: 'দ্বিতীয় লেকচারে গুরুত্বপূর্ণ সূত্র ও প্র্যাকটিক্যাল উদাহরণসমূহ।'
      },
      {
        id: 'ep-hsc-3',
        episodeNumber: 3,
        title: 'লেকচার ৩: প্রোগ্রামিং ভাষা - অনুবাদক প্রোগ্রাম (কম্পাইলার, ইন্টারপ্রেটার ও অ্যাসেম্বলার)',
        badge: 'পঞ্চম অধ্যায় • প্রোগ্রামিং ভাষা',
        youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
        youtubeId: 'kJQP7kiw5Fk',
        thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
        duration: '34:20',
        description: 'প্রোগ্রামিং ভাষার প্রাথমিক ধারণা ও অনুবাদক প্রোগ্রাম আলোচনা।'
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'series-kgf-saga',
    title: 'কেজিএফ মেগা সাগা সিরিজ (K.G.F Chapters Movie Series Hindi Dubbed)',
    category: 'South Hindi Dubbed',
    badgeLabel: 'মুভি সিরিজ • ২ পর্ব',
    badgeColor: 'red',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
    year: '2025',
    quality: '1080p [HD]',
    description: 'রকি ভাইয়ের উত্থান ও কোলার গোল্ড ফিল্ডস দখলের মহাকাব্যিক গল্প। সম্পূর্ণ হিন্দি ডাবড সিরিজ।',
    isYouTubeSeries: true,
    episodes: [
      {
        id: 'kgf-part-1',
        episodeNumber: 1,
        title: 'পর্ব ১: K.G.F Chapter 1 (হিন্দি ডাবড ব্লকবাস্টার)',
        badge: 'পার্ট ১ • ফুল এইচডি',
        youtubeUrl: 'https://www.youtube.com/watch?v=-KfsY-qw9YT',
        youtubeId: '-KfsY-qw9YT',
        thumbnail: 'https://img.youtube.com/vi/-KfsY-qw9YT/hqdefault.jpg',
        duration: '2h 35min',
        description: 'রকি কীভাবে মুম্বাইয়ের গলি থেকে কেজিএফ-এর অধিপতি হয়ে ওঠে।'
      },
      {
        id: 'kgf-part-2',
        episodeNumber: 2,
        title: 'পর্ব ২: K.G.F Chapter 2 (হিন্দি ডাবড ফাইনাল ব্যাটেল)',
        badge: 'পার্ট ২ • ফাইনাল যুদ্ধ',
        youtubeUrl: 'https://www.youtube.com/watch?v=Qah9sSIXitI',
        youtubeId: 'Qah9sSIXitI',
        thumbnail: 'https://img.youtube.com/vi/Qah9sSIXitI/hqdefault.jpg',
        duration: '2h 48min',
        description: 'অধীরা ও রমিকাসেনের বিরুদ্ধে রকির রক্তক্ষয়ী সাম্রাজ্য রক্ষার চূড়ান্ত লড়াই।'
      }
    ],
    createdAt: new Date().toISOString()
  }
];



