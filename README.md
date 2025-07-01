# Shinigami Mirror - Manga Reader

Web mirror untuk shinigami.asia dengan sistem auto-update real-time. Proyek ini dibuat untuk tugas kuliah dengan menggunakan teknologi proxy real-time untuk menyediakan akses manga/manhwa yang selalu terupdate.

## 🚀 Fitur Utama

- **Real-time Mirror**: Konten selalu terupdate langsung dari sumber
- **Anti-Detection**: Sistem rotasi user agent dan delay request
- **Mobile Responsive**: UI modern yang kompatibel dengan semua device
- **Image Proxy**: Bypass hotlink protection untuk gambar
- **Search Functionality**: Pencarian manga dengan hasil real-time
- **Chapter Reader**: Pembaca chapter dengan navigasi keyboard
- **No Storage**: Tidak perlu database, semua data fetched real-time

## 🛠 Teknologi

- **Backend**: Node.js + Express
- **Scraping**: Axios + Cheerio
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Hosting**: Railway
- **Domain**: Freenom (gratis)

## 📦 Instalasi Lokal

1. Clone repository:
```bash
git clone https://github.com/your-username/shinigami-0731.git
cd shinigami-0731
```

2. Install dependencies:
```bash
npm install
```

3. Jalankan server:
```bash
npm start
```

4. Buka browser ke `http://localhost:3000`

## 🚀 Deploy ke Railway

### Step 1: Setup GitHub Repository

1. Buat repository baru di GitHub dengan nama `shinigami-0731`
2. Upload semua file project ke repository
3. Pastikan semua file sudah ter-commit

### Step 2: Deploy ke Railway

1. **Daftar Railway**:
   - Buka [railway.app](https://railway.app)
   - Sign up dengan GitHub account
   - Verifikasi email jika diperlukan

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Pilih repository `shinigami-0731`
   - Click "Deploy Now"

3. **Wait for Deployment**:
   - Railway akan otomatis:
     - Detect `package.json`
     - Run `npm install`
     - Run `npm start`
     - Assign domain temporary

4. **Get Your URL**:
   - Setelah deploy selesai, dapatkan URL seperti:
   - `https://shinigami-0731-production.up.railway.app`

### Step 3: Setup Custom Domain (Opsional)

1. **Daftar Freenom**:
   - Buka [freenom.com](https://freenom.com)
   - Daftar account gratis
   - Pilih domain gratis (.tk, .ml, .ga, .cf)

2. **Setup DNS**:
   - Di Freenom DNS Management
   - Tambah CNAME record:
     - Name: `@` atau `www`
     - Target: `your-app.up.railway.app`

3. **Connect di Railway**:
   - Di Railway dashboard
   - Go to Settings → Domains
   - Click "Custom Domain"
   - Masukkan domain Freenom anda
   - Wait for SSL certificate (5-10 menit)

## 🔧 Environment Variables

Tidak ada environment variables yang diperlukan. Project sudah configured untuk production.

## 📱 Cara Penggunaan

1. **Homepage**: Menampilkan manga terbaru
2. **Search**: Gunakan search bar untuk cari manga
3. **Detail Manga**: Click manga untuk lihat detail & chapter list
4. **Read Chapter**: Click chapter untuk mulai membaca
5. **Navigation**: Gunakan tombol atau keyboard (← →) untuk navigasi

## 🛡 Anti-Detection Features

- **User Agent Rotation**: 15+ user agents berbeda
- **Request Delays**: Random delay 500-2000ms
- **Retry Mechanism**: Auto retry jika request gagal
- **Image Proxy**: Bypass hotlink protection
- **Error Handling**: Graceful error handling

## 📊 Monitoring

Railway menyediakan:
- **Logs**: Real-time application logs
- **Metrics**: CPU, Memory, Network usage
- **Deployments**: History of all deployments
- **Custom Domains**: SSL certificates

## 🔧 Troubleshooting

### Deploy Gagal
- Check logs di Railway dashboard
- Pastikan `package.json` valid
- Pastikan all dependencies listed

### Site Tidak Load
- Check Railway service status
- Verify domain DNS settings
- Check application logs

### Images Tidak Muncul
- Anti-hotlink protection aktif
- Gunakan image proxy endpoint
- Check network connectivity

## 📝 Development Notes

### File Structure
```
shinigami-0731/
├── server.js              # Main server
├── package.json           # Dependencies
├── config/
│   └── scraper.js        # Anti-detection logic
├── routes/
│   ├── manga.js          # Manga endpoints
│   ├── chapter.js        # Chapter reader
│   └── search.js         # Search functionality
└── public/
    ├── index.html        # Frontend UI
    ├── style.css         # Responsive styling
    └── script.js         # Frontend logic
```

### API Endpoints
- `GET /api/manga/home` - Homepage manga
- `GET /api/manga/page/:page` - Pagination
- `GET /api/manga/detail/:slug` - Detail manga
- `GET /api/chapter/:manga/:chapter` - Chapter reader
- `GET /api/search/:query` - Search manga
- `GET /api/image-proxy` - Image proxy

## 🎯 Tugas Kuliah

Project ini dibuat untuk memenuhi tugas kuliah dengan requirements:
- ✅ Web mirror dari mobile device
- ✅ Auto-update mechanism
- ✅ Hosting gratis
- ✅ UI responsive
- ✅ Real-time content

## 🏆 Achievement

- **Zero Storage**: Tidak butuh database
- **Always Updated**: Content selalu fresh
- **Fast Loading**: Optimized dengan caching headers
- **Mobile First**: Responsive design
- **Free Hosting**: Total cost $0 (Railway free tier)

## 📞 Support

Jika ada masalah dengan deployment atau code:
1. Check Railway logs untuk error details
2. Verify semua files sudah ter-upload ke GitHub
3. Pastikan Railway connected ke correct repository
4. Test endpoints secara manual: `/api/manga/home`

## 🔮 Future Improvements

- [ ] Add bookmark functionality
- [ ] Implement manga recommendations
- [ ] Add reading history
- [ ] Dark/light theme toggle
- [ ] Advanced search filters
- [ ] Download chapter functionality

---

**Deadline**: ✅ **SELESAI TEPAT WAKTU!**

Project ini siap deploy dan dapat dijalankan sesuai requirements tugas kuliah. Total waktu development: 2 hari (dari 7 hari deadline).

Happy reading! 📚✨