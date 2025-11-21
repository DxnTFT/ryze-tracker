# 🎮 Ryze Trait Tracker

<div align="center">

**A powerful TFT Set 16 composition optimizer to help you unlock Ryze**

[![Live Demo](https://img.shields.io/badge/demo-live-success)](ryze-tracker.vercel.app)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

</div>

---

## ✨ Features

### 🎯 Smart Composition Optimizer
- **Real-time Suggestions**: Get instant composition recommendations as you select units
- **Cost-Optimized**: Solutions sorted by gold cost and team size
- **Level-Aware**: Prioritizes Level 8 compositions, then Level 9

### 🔧 Intuitive Interface
- **Unit Selection**: Browse units by cost (1-4) with search and filtering
- **Emblem Tracking**: Left-click to add, right-click to remove emblems
- **Lock Icons**: Visual indicators for hard-to-obtain units
- **Side-by-Side Layout**: Desktop-optimized UI for better visibility

### 📊 Regional Trait Tracking
Track all 10 regional traits with accurate breakpoints:
- Bilgewater (3), Demacia (3), Freljord (3), Ionia (3), Ixtal (3)
- Noxus (3), Piltover (2), Void (2), Yordle (2), Zaun (3)

> **Note**: Targon exists as a trait but has no emblem available in-game

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/DxnTFT/ryze-tracker.git
cd ryze-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app in action!

---

## 📖 How to Use

1. **Select Your Units**: Click on units you currently have on your board
2. **Add Emblems**: Left-click emblems to add (max 2 per trait), right-click to remove
3. **View Compositions**: See suggested unit combinations to reach 5 regional traits
4. **Build Your Team**: Follow the cheapest path to unlock Ryze!

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite 5
- **Styling**: Vanilla CSS with modern glassmorphism design
- **Data**: TFT Set 16 units, traits, and breakpoints
- **Optimization**: Custom algorithm for finding optimal compositions

---

## 🌐 Deployment

Deploy for free on any of these platforms:

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm i -g netlify-cli
npm run build
netlify deploy --prod
```

### GitHub Pages
Add to `vite.config.js`:
```javascript
export default defineConfig({
  base: '/ryze-tracker/',
  plugins: [react()],
})
```

Then deploy:
```bash
npm run deploy
```

---

## 🎨 Features in Detail

### Unit Filtering
- Filter by cost (1-4)
- Search by unit name or trait
- Toggle visibility of unlockable units

### Composition Optimizer
- Analyzes all possible 5-trait combinations
- Considers multi-regional units as "bridges"
- Excludes 5-cost and 7-cost units (too expensive for Ryze unlock)
- Accounts for current emblems and selected units

### Smart Sorting
1. **Team Size**: Level 8 (≤8 units) compositions first
2. **Gold Cost**: Cheapest solutions within each tier
3. **Deduplication**: Removes duplicate compositions

---

## 📝 License

MIT License - feel free to use this project however you'd like!

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

---

## 🙏 Acknowledgments

- TFT Set 16 data sourced from Riot Games
- Icon assets from Community Dragon and Data Dragon APIs
- Built with ❤️ for the TFT community

---

<div align="center">

**[⬆ Back to Top](#-ryze-trait-tracker)**

Made by [DxnTFT](https://github.com/DxnTFT)

</div>
