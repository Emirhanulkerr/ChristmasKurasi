# 🎄 Yılbaşı Gizli Noel Baba (Secret Santa) 🎅

Şık, etkileyici ve görsel açıdan çarpıcı bir Yılbaşı temalı Gizli Noel Baba web uygulaması.

## ✨ Özellikler

### Temel Özellikler
- **Gizli Noel Baba Kurası**: Her katılımcı sadece kendi eşleşmesini görebilir
- **Kalıcı Veriler**: Sayfa yenilendiğinde bile sonuçlar korunur
- **Tek Seferlik Eşleşme**: Sonuçlar bir kez oluşturulur ve yeniden kullanılır
- **Kendini Çekememe**: Hiç kimse kendisini çekemez
- **Birebir Eşleşme**: Her kişi tam olarak bir hediye alır ve verir

### 3D Çark Sistemi
- Responsive 3D dönen çark
- CSS 3D dönüşümleri
- Gerçekçi fizik ve yavaşlama efekti
- Seçili segment vurgulaması
- Mobil optimizasyonu

### Görsel Tema – Yılbaşı Sihri
- Koyu kış gradyanı arka plan
- Animasyonlu kar yağışı (performans optimize)
- Yanıp sönen ışıklı Noel ağacı
- Glassmorphism kartlar
- Konfeti patlaması

### Ek Özellikler
- 🔔 Ses açma/kapama
- 📱 Mobil titreşim geri bildirimi
- 🎉 Eşleşme gösteriminde konfeti
- ⚙️ Yönetici sıfırlama seçeneği

## 🚀 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Üretim için derle
npm run build

# Derlemeyi önizle
npm run preview
```

## 🛠️ Teknoloji Yığını

- **React 19** - Modern UI framework
- **TypeScript** - Tip güvenliği
- **Vite** - Hızlı geliştirme sunucusu
- **Framer Motion** - Akıcı animasyonlar
- **Zustand** - Hafif state yönetimi
- **Canvas Confetti** - Kutlama efektleri
- **Howler.js** - Ses efektleri

## 📁 Proje Yapısı

```
src/
├── components/
│   ├── ChristmasTree/     # Animasyonlu Noel ağacı
│   ├── Snowfall/          # Kar yağışı efekti
│   ├── SoundToggle/       # Ses açma/kapama butonu
│   └── SpinningWheel/     # 3D dönen çark
├── screens/
│   ├── SetupScreen/       # Katılımcı ekleme ekranı
│   ├── SelectScreen/      # Katılımcı seçim ekranı
│   ├── SpinScreen/        # Çark çevirme ekranı
│   └── RevealScreen/      # Eşleşme gösterim ekranı
├── store/
│   └── useSecretSantaStore.ts  # Zustand store
├── types/
│   └── index.ts           # TypeScript tipleri
├── utils/
│   ├── derangement.ts     # Derangement algoritması
│   ├── sound.ts           # Ses yönetimi
│   └── storage.ts         # localStorage yönetimi
├── App.tsx
├── App.css
├── index.css
└── main.tsx
```

## 🎯 Kullanım Akışı

1. **Kurulum Ekranı**: Katılımcıları ekleyin (en az 2 kişi)
2. **Kura Çekme**: "Kurayı Çek" butonuna tıklayın
3. **Seçim Ekranı**: Kendi adınızı seçin
4. **Çark Çevirme**: "Çarkı Çevir" butonuna basın
5. **Eşleşme**: Hediye alacağınız kişiyi öğrenin

## 🧮 Derangement Algoritması

Uygulama, kimsenin kendisini çekmemesini garanti eden bir derangement (sapmış permütasyon) algoritması kullanır:

```typescript
// Fisher-Yates karıştırma + derangement doğrulaması
// Matematiksel not: Rastgele bir permütasyonun derangement olma
// olasılığı n büyüdükçe 1/e ≈ 0.368'e yaklaşır
```

## 📱 Responsive Tasarım

- Mobil öncelikli layout
- Çark, ağaç ve efektler ekran boyutuna uyum sağlar
- Dokunmatik dostu etkileşimler

## 🔒 Veri Kalıcılığı

Tüm veriler localStorage'da güvenli bir şekilde saklanır:
- Katılımcı listesi
- Eşleşmeler
- Görüntülenmiş katılımcılar
- Ses ayarları

---

**Mutlu Yıllar 2025! 🎄🎅✨**
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
