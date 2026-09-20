import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily/safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Fallback intelligent rules-based answers if Gemini API key is not configured or fails
function generateSmartFallbackResponse(userMessage: string, history: Array<{ role: string; content: string }> = []): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes('halo') || lower.includes('hai') || lower.includes('pagi') || lower.includes('malam') || lower.includes('siang') || lower.includes('sore') || lower.includes('p')) {
    return 'Halo! Selamat datang di RZSANS STORE. 🤖 Saya adalah **Bot Otomatis RZSANS** yang bertugas 24/7. Saya siap membantu Anda memilih akun game sultan, mengecek status pesanan, panduan pembayaran instan, dan klaim garansi.';
  }

  if (lower.includes('ml') || lower.includes('mobile legend') || lower.includes('mythic') || lower.includes('collector')) {
    return '🎮 **Rekomendasi Akun Mobile Legends (MLBB) di RZSANS STORE:**\n- **MLBB Mythic Glory 100★** (Skin Collector Ling, Granger, Gusion, All Unbind) - Rp 350.000 (Best Seller!)\n- **MLBB Sultan All Star** (500+ Skin, 8 Skin Legend, Monsep aman) - Rp 1.250.000\n- **MLBB Mythic Starter** (Wr 75%+, Emblem Max) - Rp 120.000\n\n⚡ Semua akun MLBB bergaransi Anti Hackback 30 Hari dan kredensial login (Email Moonton + Sandi) langsung terkirim otomatis detik setelah pembayaran berhasil.';
  }

  if (lower.includes('ff') || lower.includes('free fire') || lower.includes('sg2') || lower.includes('old')) {
    return '🔥 **Rekomendasi Akun Free Fire (FF):**\n- **FF Old Season 2 & 3** (Bundle Letda, Sakura, Celana Angelic, SG2 OPM & Rapper) - Rp 450.000\n- **FF Akun Sultan EVOGUN Max** (Semua Evo Gun Level Max) - Rp 780.000\n\n⚡ Akun login via Gmail/VK unbind aman, langsung diserahkan otomatis oleh bot kami.';
  }

  if (lower.includes('roblox') || lower.includes('blox fruit') || lower.includes('godhuman')) {
    return '⚔️ **Rekomendasi Akun Roblox:**\n- **Roblox Blox Fruits Max Level (2550)** (Godhuman, CDK, Soul Guitar, Buah Kitsune/Dough Terbuka) - Rp 180.000\n- **Roblox Sultan Outfit + 10.000 Robux Summary** - Rp 320.000\n\n⚡ Data login akun Roblox tanpa pin orang tua, bisa langsung diganti password dan diverifikasi ke email Anda.';
  }

  if (lower.includes('genshin') || lower.includes('ar 58') || lower.includes('raiden') || lower.includes('furina')) {
    return '✨ **Rekomendasi Akun Genshin Impact:**\n- **Genshin AR 58 C6 Raiden Shogun + Furina** (Bintang 5 Melimpah, Primogems 15k) - Rp 650.000\n- **Genshin Starter AR 10 Bintang 5 Pilihan** - Mulai Rp 45.000\n\n⚡ Server Asia, username unset, email change ready.';
  }

  if (lower.includes('cara') || lower.includes('beli') || lower.includes('order') || lower.includes('gimana')) {
    return '🛒 **Cara Berbelanja Otomatis di RZSANS STORE:**\n1. Pilih akun game yang diinginkan pada katalog katalog produk.\n2. Klik tombol **"Beli Langsung"**.\n3. Isi nama & nomor WhatsApp Anda untuk tanda bukti penerimaan.\n4. Pilih metode pembayaran (QRIS, Dana, GoPay, ShopeePay, atau Bank Transfer).\n5. Selesaikan pembayaran. **Bot kami akan langsung memverifikasi transaksi dan menampilkan data akun (Email, Sandi, Kode 2FA) di layar Anda dalam hitungan detik!**';
  }

  if (lower.includes('garansi') || lower.includes('aman') || lower.includes('hack') || lower.includes('hb')) {
    return '🛡️ **Jaminan Keamanan & Garansi Resmi RZSANS:**\n- **Garansi Anti-Hackback 30 Hari Penuh:** Jika akun bermasalah dalam masa garansi, kami ganti 100% atau refund.\n- **Akun 1st Hand & Legal:** Semua akun telah melalui uji screening anti-minus, unbind pihak ketiga, dan aman dari ban.\n- **Data Kredensial Pribadi:** Kredensial akun dienkripsi dan hanya diserahkan kepada pembeli resmi.';
  }

  if (lower.includes('bayar') || lower.includes('qris') || lower.includes('dana') || lower.includes('gopay') || lower.includes('bca')) {
    return '💳 **Metode Pembayaran Otomatis:**\n- **QRIS Real-Time:** Bisa scan dari BCA, Mandiri, BRI, BNI, Dana, OVO, GoPay, LinkAja, ShopeePay.\n- **E-Wallet:** Dana, GoPay, OVO, ShopeePay.\n- **Virtual Account & Transfer Bank:** Otomatis tanpa biaya admin tersembunyi.';
  }

  if (lower.includes('resi') || lower.includes('status') || lower.includes('pesanan') || lower.includes('ord-')) {
    return '📦 **Pengecekan Status Pesanan Otomatis:**\nSilakan ketik nomor pesanan Anda (contoh format: `ORD-123456`) atau buka tab **"Akun Saya" -> "Riwayat Pesanan"** di menu atas. Di sana Anda bisa melihat seluruh riwayat akun yang sudah dibeli beserta sandi yang dapat disalin 1-klik.';
  }

  if (lower.includes('pin') || lower.includes('admin')) {
    return '🔒 **Informasi Keamanan:** Akses administrator dan PIN panel toko dilindungi secara ketat dan hanya dapat diakses oleh pemilik resmi RZSANS STORE.';
  }

  return '🤖 **Bot Otomatis RZSANS Siap Membantu!**\nAnda dapat menanyakan hal-hal berikut:\n- 🎮 *Rekomendasi akun (MLBB, Free Fire, Roblox, Genshin, Valorant)*\n- ⚡ *Cara kerja pengiriman instan bot 24 jam*\n- 🛡️ *Syarat garansi anti-hackback 30 hari*\n- 💳 *Cara pembayaran via QRIS / E-Wallet*\n- 📦 *Pengecekan pesanan & resi akun*\n\nAda yang ingin Anda tanyakan lebih spesifik?';
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'RZSANS STORE API & Auto-Bot Server',
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
  });
});

// AI Store Assistant Bot Endpoint
app.post('/api/bot/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
    }

    const ai = getGeminiClient();

    if (ai) {
      try {
        const systemPrompt = `Anda adalah "Bot Otomatis RZSANS" - Asisten Penjualan & Layanan Pelanggan Otomatis 24 Jam Resmi dari RZSANS STORE (Marketplace Akun Game Terpercaya).
Kepribadian Anda:
- Ramah, profesional, cepat tanggap, jujur, dan berorientasi pada kepuasan gamer.
- Bahasa: Bahasa Indonesia yang gaul namun sopan (menggunakan istilah gamer seperti 'sultan', 'skin', 'unbind', 'hackback', 'anti-minus').
- Produk Utama: Jual Beli Akun Mobile Legends (Mythic, Skin Collector/Legend), Free Fire (Old Season, SG2 OPM), Roblox (Blox Fruits Godhuman, Robux), Genshin Impact (AR 58+), PUBG Mobile, dan Valorant.
- Keunggulan Utama:
  1. Pengiriman Instan Otomatis 24 Jam: Segera setelah pembayaran QRIS/E-Wallet terverifikasi oleh bot, kredensial login (email, sandi, kode 2FA) langsung diserahkan detik itu juga.
  2. Garansi 30 Hari Anti Hack-Back (Uang kembali / ganti unit jika terjadi masalah).
  3. Kredensial akun aman terenkripsi.
- Aturan Keamanan: JANGAN PERNAH membocorkan PIN admin atau password sistem. Beritahu bahwa kredensial admin bersifat rahasia dan terlindungi.
- Jawaban harus padat, jelas, terstruktur rapi dengan bullet point jika menyebutkan list produk atau langkah-langkah.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: message,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          },
        });

        const reply = response.text || generateSmartFallbackResponse(message, history);
        return res.json({ reply, source: 'ai' });
      } catch (aiErr) {
        console.warn('Gemini API call failed, falling back to smart responder:', aiErr);
        const reply = generateSmartFallbackResponse(message, history);
        return res.json({ reply, source: 'fallback' });
      }
    } else {
      // Offline / Smart local knowledge-base fallback
      const reply = generateSmartFallbackResponse(message, history);
      return res.json({ reply, source: 'fallback' });
    }
  } catch (err: any) {
    console.error('Bot endpoint error:', err);
    return res.status(500).json({
      error: 'Gagal memproses pesan bot.',
      reply: 'Maaf, terjadi gangguan sementara pada koneksi bot. Silakan coba kembali sesaat lagi.',
    });
  }
});

// Auto-Delivery Verification Bot Simulation Endpoint
app.post('/api/bot/verify-delivery', async (req, res) => {
  const { orderId, paymentMethod, amount } = req.body;
  
  res.json({
    status: 'delivered',
    verifiedAt: new Date().toISOString(),
    orderId: orderId || `ORD-${Date.now().toString().slice(-6)}`,
    verificationLog: [
      { step: 1, message: 'Bot mendeteksi mutasi pembayaran berhasil', status: 'done' },
      { step: 2, message: 'Bot mendekripsi kredensial akun dari brankas server', status: 'done' },
      { step: 3, message: 'Akun game resmi berhasil diserahkan ke pembeli', status: 'done' },
    ],
    note: 'Kredensial login akun Anda siap digunakan. Pastikan langsung mengganti sandi demi keamanan.',
  });
});

// Live recent transactions feed generated automatically
app.get('/api/bot/live-feed', (req, res) => {
  const games = ['Mobile Legends', 'Free Fire', 'Roblox Blox Fruits', 'Genshin Impact', 'Valorant'];
  const cities = ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Yogyakarta', 'Makassar', 'Denpasar', 'Semarang'];
  const methods = ['QRIS Real-Time', 'DANA', 'GoPay', 'ShopeePay', 'BCA Transfer'];

  const randomGame = games[Math.floor(Math.random() * games.length)];
  const randomCity = cities[Math.floor(Math.random() * cities.length)];
  const randomMethod = methods[Math.floor(Math.random() * methods.length)];
  const orderNum = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

  res.json({
    orderNumber: orderNum,
    game: randomGame,
    city: randomCity,
    paymentMethod: randomMethod,
    timeAgo: 'Baru saja',
    deliveredStatus: 'Otomatis Terkirim (Bot 24/7)',
  });
});

// Serve frontend in dev or production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
