import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        injectRegister: null,
        registerType: 'prompt',
        includeAssets: ['assets/app-logo.png', 'assets/header-logo.png'],
        manifest: {
          name: 'FlickCove - Movies & Series APK',
          short_name: 'FlickCove',
          description: 'Live Firebase-powered movie streaming, updates and download portal',
          theme_color: '#0f172a',
          background_color: '#f8fafc',
          display: 'standalone',
          orientation: 'portrait',
          icons: [
            {
              src: '/assets/app-logo.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/assets/app-logo.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            }
          ]
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          cleanupOutdatedCaches: true,
          skipWaiting: false,
          clientsClaim: false
        }
      }),
      {
        name: 'in-app-browser-proxy',
        configureServer(server) {
          const proxyMiddleware = async (req: any, res: any, next: any) => {
            // Direct APK Download Stream Route with explicit Android headers
            if (req.url?.startsWith('/api/download-apk') || req.url?.startsWith('/CineStreamBD_v2.1.0.apk')) {
              const apkPath = path.resolve(__dirname, 'public/CineStreamBD_v2.1.0.apk');
              if (fs.existsSync(apkPath)) {
                const stat = fs.statSync(apkPath);
                res.writeHead(200, {
                  'Content-Type': 'application/vnd.android.package-archive',
                  'Content-Disposition': 'attachment; filename="CineStreamBD_v2.1.0.apk"',
                  'Content-Length': stat.size,
                  'Cache-Control': 'no-cache',
                  'Access-Control-Allow-Origin': '*'
                });
                const stream = fs.createReadStream(apkPath);
                stream.pipe(res);
                return;
              }
            }

            // Local Server Image Upload Handler (Safe, Fast, zero-RAM crash)
            if (req.url?.startsWith('/api/upload-image')) {
              if (req.method === 'OPTIONS') {
                res.statusCode = 200;
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', '*');
                res.end();
                return;
              }

              if (req.method === 'POST') {
                try {
                  const chunks: Buffer[] = [];
                  for await (const chunk of req) {
                    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
                  }
                  const raw = Buffer.concat(chunks).toString('utf-8');
                  const body = JSON.parse(raw || '{}');
                  let base64 = body.base64 || '';
                  if (base64.includes(',')) {
                    base64 = base64.split(',')[1];
                  }

                  if (!base64) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'No image data provided' }));
                    return;
                  }

                  const uploadsDir = path.resolve(__dirname, 'public/uploads');
                  if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                  }

                  const ext = body.ext || 'jpg';
                  const filename = `movie_img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
                  const filePath = path.join(uploadsDir, filename);

                  fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));

                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  res.end(JSON.stringify({
                    success: true,
                    url: `/uploads/${filename}`
                  }));
                  return;
                } catch (err: any) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err.message }));
                  return;
                }
              }
            }

            // Forward GrabVex backend API requests (/api/download, /api/rate, /api/file)
            if (
              req.url?.startsWith('/api/download') ||
              req.url?.startsWith('/api/rate') ||
              req.url?.startsWith('/api/file')
            ) {
              try {
                if (req.method === 'OPTIONS') {
                  res.statusCode = 200;
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                  res.setHeader('Access-Control-Allow-Headers', '*');
                  res.end();
                  return;
                }

                const chunks: Buffer[] = [];
                for await (const chunk of req) {
                  chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
                }
                const bodyBuffer = Buffer.concat(chunks);

                const targetApi = `https://grabvex.com${req.url}`;
                const apiResponse = await fetch(targetApi, {
                  method: req.method,
                  headers: {
                    'User-Agent':
                      'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
                    'Content-Type': req.headers['content-type'] || 'application/json',
                    'Accept': req.headers['accept'] || 'application/json, text/plain, */*',
                    'Origin': 'https://grabvex.com',
                    'Referer': 'https://grabvex.com/',
                  },
                  body: req.method !== 'GET' && req.method !== 'HEAD' && bodyBuffer.length > 0 ? bodyBuffer : undefined,
                });

                res.statusCode = apiResponse.status;
                res.setHeader('Content-Type', apiResponse.headers.get('content-type') || 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                const responseData = Buffer.from(await apiResponse.arrayBuffer());
                res.end(responseData);
                return;
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
                return;
              }
            }

            // VidMax AI Chat with Gemini API (gemini-3.5-flash-lite)
            if (req.url?.startsWith('/api/gemini/chat')) {
              if (req.method === 'OPTIONS') {
                res.statusCode = 200;
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', '*');
                res.end();
                return;
              }

              if (req.method === 'POST') {
                try {
                  const chunks: Buffer[] = [];
                  for await (const chunk of req) {
                    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
                  }
                  const bodyStr = Buffer.concat(chunks).toString('utf-8');
                  const body = JSON.parse(bodyStr || '{}');
                  const prompt = body.prompt || '';
                  const history = Array.isArray(body.history) ? body.history : [];
                  const apiKey = process.env.GEMINI_API_KEY || '';

                  const systemInstructionText = `You are VidMax AI, the official cheerful, highly knowledgeable, and friendly AI assistant of the VidMax entertainment app.
Brand Name: VidMax
Always identify yourself as VidMax AI.

[CRITICAL PROHIBITION ON SLOGANS/SIGNATURES]:
- NEVER write, append, or repeat the slogan "Chat Smart, Feel Amazing" in your answers or at the end of messages!
- DO NOT attach any repetitive tagline, slogan, or sign-off signature to your responses.
- Answer user queries directly, naturally, cleanly, and warmly without any repeated slogans.

[ALL APP INFORMATION & HOW TO USE VIDMAX (কোথায় কী আছে)]:
1. APP OVERVIEW:
   VidMax is the all-in-one entertainment hub for movie streaming, ultra-fast downloading (1080p, 720p, 480p), music listening, and Android APK downloads.
2. HOME (হোম পেজ):
   - Located on the bottom navigation bar (1st tab: HOME).
   - Features top search icon (🔍) to instantly search movies by title or genre.
   - Top banner slider highlighting trending blockbusters.
   - Movie categories: South Indian Hindi Dubbed, Hollywood Dual Audio (Hindi+English), Bollywood Hindi, and Bengali Movies.
   - Click any movie card to open its dedicated Movie Details page.
3. MOVIE DETAILS & HOW TO DOWNLOAD (মুভি ডাউনলোডের নিয়ম):
   - To download any movie: Go to Home or Search (🔍) -> Click on the desired movie -> On the Movie Details page, click the prominent green button: "Download 480p 720p 1080p [HD]".
   - Direct high-speed download links will start immediately in 1080p Full HD, 720p HD, or 480p Mobile size.
   - The page also displays screenshots and related movie recommendations.
4. MUSIC (মিউজিক পেজ):
   - Located on the bottom navigation bar (2nd tab: MUSIC).
   - Stream audio tracks, film songs, and soundtracks.
5. APK & APPS HUB (মাঝের সোনালী গোল আইকন - APK):
   - Elevated golden circular button at the center of the bottom navigation bar.
   - Download the official VidMax Android APK and discover featured utility apps.
6. DOWNLOAD (ডাউনলোড লিস্ট):
   - Located on the bottom navigation bar (4th tab: DOWNLOAD).
   - Check downloaded movies and manage offline files.
7. AI (ভিডমেক্স এআই):
   - Located on the bottom navigation bar (5th tab: AI with cute robot mascot).
   - Available 24/7 to answer movie queries, recommend films, and guide users through VidMax.
8. SIDE MENU & SUPPORT (সাইড ড্রয়ার - ≡):
   - Hamburger icon (≡) at top left.
   - Direct access to categories and official support links: Telegram, WhatsApp, and Facebook.

[STRICT PRIVACY & CONFIDENTIALITY RULES (প্রাইভেসি ও গোপনীয়তা)]:
1. ADMIN PANEL & PASSWORD:
   - If anyone asks for the admin panel password, admin credentials, secret codes, or how to log in as admin, NEVER reveal anything under any circumstance!
   - Reply politely: "দুঃখিত, অ্যাডমিন প্যানেলের তথ্য সম্পূর্ণ গোপনীয় ও সুরক্ষিত। আমি এটি শেয়ার করতে পারব না।" (Or in English: "Sorry, admin panel credentials are strictly confidential and protected.")
2. HOW THE WEBSITE/APP WAS BUILT & WHO CREATED IT:
   - If anyone asks how this website/app was built, who created it, what code or tech stack was used: DO NOT mention any programming languages, frameworks, Vite, React, or developers!
   - State ONLY: "ভিডমেক্স আমাকে তৈরি করেছে।" (VidMax created me.)

[RESPONSE LENGTH & TONE GUIDELINES]:
1. SHORT MESSAGES & GREETINGS:
   - When the user sends small messages, greetings, or short talk (e.g., "hi", "hello", "কেমন আছো", "কেমন আছেন", "ধন্যবাদ", etc.):
   - Keep the reply sweet and short, strictly between 50 to 100 characters (৫০ থেকে ১০০ অক্ষরের মধ্যে ছোট মিষ্টি উত্তর).
2. QUESTIONS & INQUIRIES:
   - When the user asks a question, seeks movie suggestions, asks how to download, or requests information:
   - Provide a clear, helpful, accurate answer within maximum 500 characters (সর্বোচ্চ ৫০০ অক্ষরের মধ্যে সুনির্দিষ্ট তথ্যবহুল উত্তর).
3. LANGUAGE:
   - Always reply in the user's language (sweet and fluent Bengali for Bengali prompts, English for English).
   - Be enthusiastic, quick, and polite. Never append any repetitive slogans.`;

                  const contents: any[] = [];

                  // Add recent conversation history (last 6 turns)
                  for (const h of history.slice(-6)) {
                    contents.push({
                      role: h.sender === 'user' ? 'user' : 'model',
                      parts: [{ text: h.text }]
                    });
                  }

                  // Add the latest user prompt
                  contents.push({
                    role: 'user',
                    parts: [{ text: prompt }]
                  });

                  const apiRes = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        system_instruction: {
                          parts: [{ text: systemInstructionText }]
                        },
                        contents
                      }),
                    }
                  );

                  if (!apiRes.ok) {
                    const errText = await apiRes.text();
                    console.error('Gemini API Error:', errText);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ 
                      text: "Hello! 👋 I'm VidMax AI. What movie would you like to watch or download today?" 
                    }));
                    return;
                  }

                  const data: any = await apiRes.json();
                  let reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "হ্যালো! আমি VidMax AI। কীভাবে সাহায্য করতে পারি?";

                  // Sanitize out any accidental repetitive slogans
                  reply = reply
                    .replace(/\*?\*?Chat\s+Smart[,\s]+Feel\s+Amazing!?\*?\*?/gi, '')
                    .replace(/চ্যাট\s+স্মার্ট[,\s]+ফিল\s+অ্যামাজিং!?/gi, '')
                    .replace(/\n{3,}/g, '\n\n')
                    .trim();

                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  res.end(JSON.stringify({ text: reply }));
                  return;
                } catch (err: any) {
                  console.error('VidMax AI error:', err);
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ text: "Hello! I am VidMax AI. How can I assist you with movies and series today?" }));
                  return;
                }
              }
            }

            if (!req.url?.startsWith('/api/proxy')) {
              return next();
            }

            try {
              const parsedUrl = new URL(req.url, 'http://localhost:3000');
              const target = parsedUrl.searchParams.get('url');
              if (!target) {
                res.statusCode = 400;
                res.end('URL is required');
                return;
              }

              const response = await fetch(target, {
                headers: {
                  'User-Agent':
                    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
                  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                  'Accept-Language': 'en-US,en;q=0.9',
                },
                redirect: 'follow',
              });

              const contentType = response.headers.get('content-type') || 'text/html; charset=utf-8';
              res.setHeader('Content-Type', contentType);
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.removeHeader('X-Frame-Options');
              res.removeHeader('Content-Security-Policy');
              res.removeHeader('Cross-Origin-Opener-Policy');
              res.removeHeader('Cross-Origin-Embedder-Policy');

              if (contentType.includes('text/html')) {
                let html = await response.text();
                const baseHref = response.url || target;
                const rewritePath = response.headers.get('x-middleware-rewrite') || '';
                const isGrabvex = target.includes('grabvex.com');
                const injection = isGrabvex ? `
<base href="${baseHref}">
<script>
  (function() {
    try {
      var targetRaw = ${JSON.stringify(target)};
      var targetUrl = new URL(targetRaw);
      var rewrite = ${JSON.stringify(rewritePath)};
      var desiredPath = rewrite || targetUrl.pathname || '/';
      if (window.location.pathname.startsWith('/api/proxy')) {
        window.history.replaceState(null, '', desiredPath + targetUrl.search + targetUrl.hash);
      }
    } catch(e) {}
  })();
</script>` : `<base href="${baseHref}">`;
                if (html.includes('<head>')) {
                  html = html.replace('<head>', `<head>${injection}`);
                } else {
                  html = `${injection}${html}`;
                }
                res.end(html);
              } else {
                const buffer = Buffer.from(await response.arrayBuffer());
                res.end(buffer);
              }
            } catch (err: any) {
              res.statusCode = 500;
              res.end(`Proxy error: ${err.message}`);
            }
          };

          server.middlewares.use(proxyMiddleware);
        },
        configurePreviewServer(server) {
          server.middlewares.use(async (req: any, res: any, next: any) => {
            if (!req.url?.startsWith('/api/proxy') && !req.url?.startsWith('/api/download') && !req.url?.startsWith('/api/rate')) {
              return next();
            }
            try {
              const parsedUrl = new URL(req.url, 'http://localhost:3000');
              const target = parsedUrl.searchParams.get('url');
              if (target) {
                const response = await fetch(target, {
                  headers: {
                    'User-Agent':
                      'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
                  },
                  redirect: 'follow',
                });
                const contentType = response.headers.get('content-type') || 'text/html; charset=utf-8';
                res.setHeader('Content-Type', contentType);
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.removeHeader('X-Frame-Options');
                res.removeHeader('Content-Security-Policy');
                if (contentType.includes('text/html')) {
                  let html = await response.text();
                  const baseHref = response.url || target;
                  html = html.includes('<head>') ? html.replace('<head>', `<head><base href="${baseHref}">`) : `<base href="${baseHref}">${html}`;
                  res.end(html);
                } else {
                  res.end(Buffer.from(await response.arrayBuffer()));
                }
                return;
              }
              return next();
            } catch {
              return next();
            }
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
